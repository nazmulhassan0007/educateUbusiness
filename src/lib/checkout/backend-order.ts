import { authApi } from "@/lib/auth/backend";
import type { PurchaseType } from "@/lib/checkout/plan";
import { resolveBackendPurchaseType } from "./purchase-type";

export type OrderRecipient = { firstName: string; lastName: string; email: string };

// Everything the backend's POST /checkout needs for one cart line, plus
// enough of our own context (slug, tier) to group lines by backend
// purchaseType. Built in /api/checkout/route.ts from the cart items the
// client posts, encoded into Checkout Session metadata (see below), and
// decoded back out of it in the Stripe webhook once payment succeeds.
export type OrderLineItem = {
  courseId: string;
  slug: string;
  quantity: number;
  purchaseType: PurchaseType;
  companyId?: string | null;
  // Group tier only — one learner per seat, matches the backend's
  // seats[].learners shape field-for-field.
  learners?: OrderRecipient[];
};

export type SubmitOrderResult =
  | { purchaseType: string; ok: true; couponDropped?: string; skipped?: true }
  | { purchaseType: string; ok: false; message: string; retryable: boolean };

// Duplicate protection for webhook redelivery. The backend's POST /checkout
// takes no payment reference or idempotency key and has no order lookup, so
// the only record of "this group was already sent" is one we keep ourselves
// — on the Stripe object, the one store this app has. See the Stripe
// webhook for where these are read and written.
export const RECORDED_MARKER_PREFIX = "recorded_";

export function recordedGroups(metadata: Record<string, string>): Set<string> {
  return new Set(
    Object.keys(metadata)
      .filter((key) => key.startsWith(RECORDED_MARKER_PREFIX) && metadata[key])
      .map((key) => key.slice(RECORDED_MARKER_PREFIX.length)),
  );
}

// The backend rejects a coupon with a 400 and a message naming it ("This
// coupon has expired", "You have already used this coupon", …). By the time
// this runs the card has been charged, so the distinction matters: see the
// retry in submitBackendOrders below.
function isCouponRejection(status: number, message: string) {
  return status === 400 && /coupon/i.test(message);
}

// A single POST /checkout call carries exactly one purchaseType, one
// companyId, and one recipients/seats array matched 1:1 to its items — so a
// cart mixing tiers (e.g. one personal course + one group course) needs one
// backend call per resolved purchaseType, all under the single Stripe
// charge already taken. Mirrors register-company's use of authApi() for the
// same auth/error conventions.
export async function submitBackendOrders(
  token: string,
  items: OrderLineItem[],
  // Cart-wide — the same code applies to the whole checkout (see
  // /api/checkout/route.ts), so it's passed once here rather than read off
  // individual items, and included on every purchaseType group's call, per
  // the doc: "To actually apply a coupon at checkout, add couponCode to
  // the checkout request body itself." This is the backend's own record of
  // which code was used — it doesn't change what Stripe already charged.
  couponCode?: string | null,
  // Groups an earlier delivery of the same webhook event already recorded
  // (skipped, so a redelivery only resends what failed), and a hook awaited
  // right after each group succeeds, before the next is sent — so a failure
  // partway through still leaves the earlier groups marked.
  options: {
    alreadyRecorded?: Set<string>;
    onRecorded?: (purchaseType: string) => Promise<void>;
  } = {},
): Promise<SubmitOrderResult[]> {
  const groups = new Map<string, OrderLineItem[]>();
  for (const item of items) {
    const purchaseType = resolveBackendPurchaseType(item);
    groups.set(purchaseType, [...(groups.get(purchaseType) ?? []), item]);
  }

  const results: SubmitOrderResult[] = [];
  for (const [purchaseType, groupItems] of groups) {
    if (options.alreadyRecorded?.has(purchaseType)) {
      results.push({ purchaseType, ok: true, skipped: true });
      continue;
    }

    // Kept coupon-free so the retry below can reuse it as-is.
    const baseBody: Record<string, unknown> = {
      purchaseType,
      items: groupItems.map((item) => ({
        courseId: item.courseId,
        quantity: item.quantity,
      })),
    };

    if (purchaseType === "group") {
      baseBody.seats = groupItems.map((item) => ({
        courseId: item.courseId,
        learners: item.learners ?? [],
      }));
    }
    if (purchaseType === "company_card") {
      baseBody.companyId = groupItems[0]?.companyId;
    }

    const body = couponCode ? { ...baseBody, couponCode } : baseBody;

    let result = await authApi("/api/checkout", { method: "POST", token, body });

    // Last resort, and only after the money has already moved: the coupon
    // was validated against this same backend when the Checkout Session
    // was built, so a rejection here means it stopped qualifying in
    // between (a single-use code redeemed on another order, or a window
    // that closed mid-payment). Recording the order without the code beats
    // leaving a paid buyer with no enrolment at all — the caller logs the
    // discrepancy, which is a smaller reconciliation job than a lost
    // order.
    let couponDropped: string | undefined;
    if (
      !result.ok &&
      couponCode &&
      isCouponRejection(result.status, result.message)
    ) {
      const retry = await authApi("/api/checkout", {
        method: "POST",
        token,
        body: baseBody,
      });
      if (retry.ok) {
        couponDropped = couponCode;
        result = retry;
      }
    }

    if (result.ok) await options.onRecorded?.(purchaseType);

    results.push(
      result.ok
        ? { purchaseType, ok: true, couponDropped }
        : {
            purchaseType,
            ok: false,
            message: result.message,
            // 400/401/403/409 are the caller's fault (bad payload, expired
            // token, no access) — retrying the identical request fails the
            // same way every time. Only a backend-side 5xx is worth
            // Stripe redelivering the whole webhook event for.
            retryable: result.status >= 500,
          },
    );
  }

  return results;
}

// ── Stripe metadata chunking ────────────────────────────────────────────
//
// PaymentIntent metadata caps each value at 500 chars (50 keys total). The
// order payload (JSON) and the buyer's raw bearer token both risk exceeding
// that, so both get split across numbered keys (`${key}_0`, `${key}_1`, ...)
// and reassembled on the other side.

const METADATA_CHUNK_SIZE = 500;

// Stripe allows 50 metadata keys per object. One `recorded_<type>` marker
// per backend purchaseType (individual, group, company_card) may be added
// after payment, so checkout must leave room for all three.
export const MAX_CHECKOUT_METADATA_KEYS = 50 - 3;

export function truncateMetadataValue(value: string): string {
  return value.slice(0, METADATA_CHUNK_SIZE);
}

export function chunkMetadataValue(
  key: string,
  value: string,
): Record<string, string> {
  const chunks: Record<string, string> = {};
  const count = Math.max(1, Math.ceil(value.length / METADATA_CHUNK_SIZE));
  for (let i = 0; i < count; i++) {
    chunks[`${key}_${i}`] = value.slice(
      i * METADATA_CHUNK_SIZE,
      (i + 1) * METADATA_CHUNK_SIZE,
    );
  }
  return chunks;
}

export function readMetadataValue(
  metadata: Record<string, string>,
  key: string,
): string | null {
  if (metadata[`${key}_0`] === undefined) return null;
  let value = "";
  for (let i = 0; metadata[`${key}_${i}`] !== undefined; i++) {
    value += metadata[`${key}_${i}`];
  }
  return value;
}
