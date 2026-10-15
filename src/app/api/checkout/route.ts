import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { getCurrentUser, getAuthToken } from "@/lib/auth/server";
import { getCourseBySlug } from "@/lib/courses/loaders";
import { lookupCoupon } from "@/lib/coupons/backend";
import { computeCouponDiscount } from "@/lib/coupons/discount";
import {
  resolveCheckoutAmounts,
  MissingPriceError,
  type CheckoutItem,
} from "@/lib/stripe/checkout-amounts";
import {
  chunkMetadataValue,
  MAX_CHECKOUT_METADATA_KEYS,
  truncateMetadataValue,
  type OrderLineItem,
} from "@/lib/checkout/backend-order";
import { planForQuantity, type PurchaseType } from "@/lib/checkout/plan";
import type { AllocationState } from "@/app/checkout/seat-allocation";

// Tags every session from this flow in the Stripe Dashboard so it can be
// told apart from any other checkout (Stripe's convention: a label plus an
// 8-letter random suffix, fixed per integration).
const INTEGRATION_IDENTIFIER = "educateu_checkout_elements_qmvtrkzh";

// Generous upper bound — only there to reject absurd payloads before they
// reach Stripe.
const MAX_QUANTITY = 10_000;

type CheckoutRequestItem = CheckoutItem & {
  purchaseType: PurchaseType;
  companyId?: string | null;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const token = await getAuthToken();
  if (!user || !token) {
    return NextResponse.json(
      { error: "You must be logged in to check out." },
      { status: 401 },
    );
  }

  const { items, allocations, buyerName, buyerEmail } =
    (await request.json()) as {
      items: CheckoutRequestItem[];
      allocations: AllocationState;
      buyerName: string;
      buyerEmail: string;
    };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // The price per seat comes from the plan, so the plan can't be the
  // client's choice: it must be the one the quantity implies, exactly as the
  // cart sets it.
  const invalidItem = items.find(
    (item) =>
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY ||
      item.purchaseType !== planForQuantity(item.quantity),
  );
  if (invalidItem) {
    return NextResponse.json(
      {
        error: `The quantity or plan for "${invalidItem.title ?? invalidItem.slug}" isn't valid. Please update it in your cart.`,
      },
      { status: 400 },
    );
  }

  // The backend wants one named learner per Group seat. Caught here, before
  // payment — once the card is charged, a mismatch can only end in a paid
  // order the backend refuses to record.
  const unallocated = items.find(
    (item) =>
      item.purchaseType === "group" &&
      (allocations?.[item.slug]?.length ?? 0) !== item.quantity,
  );
  if (unallocated) {
    return NextResponse.json(
      {
        error: `Add a learner for every seat on "${unallocated.title ?? unallocated.slug}".`,
      },
      { status: 400 },
    );
  }

  const missingCompany = items.find(
    (item) => item.purchaseType === "enterprise" && !item.companyId,
  );
  if (missingCompany) {
    return NextResponse.json(
      { error: "companyId is required for a company purchase." },
      { status: 400 },
    );
  }

  const courseResults = await Promise.all(
    items.map((item) => getCourseBySlug(item.slug).catch(() => null)),
  );
  const courses = courseResults.map((result) => result?.data ?? null);

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  let discountLines;
  try {
    // Every amount is computed here from the course records just fetched —
    // the client-sent `item.price` is never trusted.
    ({ lineItems, discountLines } = await resolveCheckoutAmounts(
      items,
      courses,
    ));
  } catch (error) {
    if (error instanceof MissingPriceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  // Every item shares one cart-wide code (see cart-store's
  // applyCouponToAll) — looked up against the backend rather than trusted,
  // same as the per-item amounts above.
  //
  // The backend owns coupons outright: it validates the same code again on
  // POST /api/checkout and records the order's own discount from it. So the
  // discount charged here has to be the one the backend will compute, not a
  // separate Stripe promotion code that the backend has never heard of —
  // otherwise the buyer is charged one total and the order records another,
  // or (worse) the backend rejects the code after the money has moved and
  // the order can't be recorded at all.
  //
  // An invalid code fails the whole call rather than silently charging full
  // price: the buyer typed it deliberately, and being told why beats being
  // quietly billed more than the screen promised.
  const couponCode = items.find((item) => item.couponCode)?.couponCode;
  let stripeCouponId: string | undefined;
  if (couponCode) {
    const lookup = await lookupCoupon(token, couponCode);
    if (!lookup.ok) {
      return NextResponse.json({ error: lookup.message }, { status: 400 });
    }

    const discount = computeCouponDiscount(lookup.coupon, discountLines);
    if (!discount.ok) {
      return NextResponse.json({ error: discount.message }, { status: 400 });
    }

    if (discount.amount > 0) {
      // A one-off Stripe coupon for exactly the amount the backend will
      // discount. Using `amount_off` (rather than re-pricing the line
      // items) keeps each line showing its real price and the discount
      // showing as a discount, and a percentage coupon scoped to one course
      // in a mixed cart still comes out at the backend's figure — Stripe's
      // own percent_off would apply to the whole order instead.
      const created = await stripe.coupons.create({
        amount_off: discount.amount,
        currency: "gbp",
        duration: "once",
        name: `Coupon ${lookup.coupon.code}`,
        // Made for this one session; capping it means a leftover one (from
        // an abandoned or rebuilt session) can never be reused.
        max_redemptions: 1,
        metadata: { coupon_code: lookup.coupon.code },
      });
      stripeCouponId = created.id;
    }
  }

  // Everything the backend's POST /checkout will need once payment
  // succeeds — built now (while we still have the client's full payload)
  // and carried through Stripe as Checkout Session metadata, since the
  // webhook that eventually submits it is a server-to-server callback with
  // no access to the buyer's session/cookie. See src/lib/checkout/backend-order.ts.
  //
  // On the session rather than the PaymentIntent: the webhook is driven by
  // checkout.session.* events, and a session discounted to £0 has no
  // PaymentIntent at all.
  // `courseId` comes from the course record we just fetched by slug, never
  // from the client — resolveCheckoutAmounts() already succeeded above,
  // which is only possible when every `courses[index]` resolved to a real
  // course, so the `!` here is safe.
  const orderLineItems: OrderLineItem[] = items.map((item, index) => ({
    courseId: courses[index]!.id,
    slug: item.slug,
    quantity: item.quantity,
    purchaseType: item.purchaseType,
    companyId: item.companyId ?? null,
    learners:
      item.purchaseType === "group" ? allocations?.[item.slug] ?? [] : undefined,
  }));

  // Plain labels, also copied onto the PaymentIntent so the payment reads
  // sensibly in the Dashboard. Truncated, since unlike the payloads below
  // they aren't chunked.
  const summaryMetadata = {
    slugs: truncateMetadataValue(items.map((item) => item.slug).join(",")),
    buyer_name: truncateMetadataValue(buyerName ?? ""),
    buyer_email: truncateMetadataValue(buyerEmail ?? ""),
  };

  const sessionMetadata = {
    ...summaryMetadata,
    ...chunkMetadataValue("order_payload", JSON.stringify(orderLineItems)),
    // Carried through so the webhook can forward it to the backend's own
    // POST /checkout as `couponCode`. The backend recomputes the same
    // discount from it, which is why the charge above was built from that
    // same coupon rather than from a Stripe-side promotion code.
    ...(couponCode ? chunkMetadataValue("coupon_code", couponCode) : {}),
    // Accepted trade-off (confirmed with the team): the backend requires a
    // buyer bearer token and has no server-to-server credential, so the
    // only durable way for the webhook to record the order after payment
    // is to carry this token along. It becomes visible to anyone with
    // Stripe Dashboard/API access for as long as Stripe retains the object.
    ...chunkMetadataValue("auth_token", token),
  };

  // A very large Group order (many named learners) can outgrow Stripe's
  // metadata limit. Refused here, before payment, rather than letting
  // Stripe reject it with an unrelated-looking error.
  if (Object.keys(sessionMetadata).length > MAX_CHECKOUT_METADATA_KEYS) {
    return NextResponse.json(
      {
        error:
          "This order is too large to pay for in one checkout. Please split it into smaller orders.",
      },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "elements",
      line_items: lineItems,
      // Keeps every other automatically-enabled payment method (card,
      // PayPal, wallets, etc.) but drops Revolut Pay from the Payment
      // Element.
      excluded_payment_method_types: ["revolut_pay"],
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      ...(buyerEmail ? { customer_email: buyerEmail } : {}),
      metadata: sessionMetadata,
      payment_intent_data: { metadata: summaryMetadata },
      integration_identifier: INTEGRATION_IDENTIFIER,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Only blame the email when Stripe actually rejected the email.
      if (error.param === "customer_email") {
        return NextResponse.json(
          { error: "Please check your email address and try again." },
          { status: 400 },
        );
      }
      console.error(
        `[checkout] Stripe rejected the session (param: ${error.param ?? "none"}): ${error.message}`,
      );
      return NextResponse.json(
        { error: "We couldn't set up payment. Please try again." },
        { status: 400 },
      );
    }
    throw error;
  }

  return NextResponse.json({ clientSecret: session.client_secret });
}
