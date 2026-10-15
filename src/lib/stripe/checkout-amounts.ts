import type Stripe from "stripe";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import type { DiscountLine } from "@/lib/coupons/discount";
import { isOfferActive } from "@/lib/courses/offer";

export type PurchaseType = "personal" | "group" | "enterprise";

export type CheckoutItem = {
  slug: string;
  title: string;
  price: number;
  quantity: number;
  purchaseType: PurchaseType;
  couponCode?: string | null;
};

// Thrown when a course can't be resolved at all (e.g. slug lookup failed)
// — checkout fails closed rather than falling back to a client-supplied
// amount.
export class MissingPriceError extends Error {
  constructor(slug: string) {
    super(`No price available for "${slug}"`);
    this.name = "MissingPriceError";
  }
}

// The backend course API has no Stripe Price objects of its own (see the
// null defaults in src/lib/courses/loaders.ts's toApiCourseDetail) — it
// runs its own pricing model instead, documented as: a live flash offer
// overrides every other price for every purchase type; otherwise a
// Group/Enterprise purchase uses its own flat tier price (falling back to
// the Personal effective price if that tier price isn't set); otherwise
// discountedPrice undercuts the list price.
export function resolveUnitAmount(
  course: ApiCourseDetail,
  purchaseType: PurchaseType,
): number {
  if (isOfferActive(course)) return Number(course.offerPrice);

  const tierPrice =
    purchaseType === "enterprise"
      ? course.enterprisePlanPrice
      : purchaseType === "group"
        ? course.groupPlanPrice
        : null;
  if (tierPrice) return Number(tierPrice);

  return Number(course.discountedPrice ?? course.price);
}

// Resolves each cart line to a real, server-computed amount — the
// client-sent `item.price` is never trusted — as Stripe Checkout line
// items using inline `price_data` (no pre-existing Stripe Price object
// required). Stripe computes the actual charge (and any discount) itself
// from these, never from a client-sent amount.
//
// The same pence amounts come back as `discountLines`, so a coupon's
// discount is worked out from exactly what Stripe is being asked to charge
// rather than from a second, separately-derived total.
export async function resolveCheckoutAmounts(
  items: CheckoutItem[],
  courses: (ApiCourseDetail | null)[],
  currency = "gbp",
): Promise<{
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  discountLines: DiscountLine[];
  subtotal: number;
}> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const discountLines: DiscountLine[] = [];

  items.forEach((item, index) => {
    const course = courses[index];
    if (!course) throw new MissingPriceError(item.slug);

    const unitAmount = resolveUnitAmount(course, item.purchaseType);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new MissingPriceError(item.slug);
    }

    const unitPence = Math.round(unitAmount * 100);

    lineItems.push({
      price_data: {
        currency,
        unit_amount: unitPence,
        product_data: { name: course.title },
      },
      quantity: item.quantity,
    });

    discountLines.push({
      courseId: course.id,
      slug: item.slug,
      unitAmount: unitPence,
      quantity: item.quantity,
    });
  });

  const subtotal = discountLines.reduce(
    (total, line) => total + line.unitAmount * line.quantity,
    0,
  );

  return { lineItems, discountLines, subtotal };
}
