// The coupon shape the backend serves from POST /api/coupons/details, and
// the discount arithmetic that shape implies. Kept free of any server-only
// import so both the API routes and (via the validate route's response) the
// client can talk in the same terms.

export type CouponDiscountType = "percentage" | "fixed";

export type BackendCoupon = {
  code: string;
  discountType: CouponDiscountType;
  /** A percentage (10 = 10% off) or a flat amount in whole currency units. */
  discountValue: number;
  /** Minimum number of matching seats before the discount applies. */
  minQuantity: number;
  /** null when the coupon applies to any course. */
  course: { id: string; title: string; slug: string } | null;
};

/** One cart line, priced server-side. `amount` is in pence. */
export type DiscountLine = {
  courseId: string | null;
  slug: string;
  unitAmount: number;
  quantity: number;
};

export type DiscountResult =
  | { ok: true; amount: number; matchedSubtotal: number }
  | { ok: false; message: string };

// Mirrors the checks the backend runs when the same code is sent on
// POST /api/checkout, down to the wording of its errors — anything this
// accepts, checkout has to accept too, or a buyer gets charged a discounted
// total the backend then refuses to record. The checks the backend owns
// alone (active, in-window, not already redeemed by this account) are
// already answered by the lookup that produced `coupon`.
export function computeCouponDiscount(
  coupon: BackendCoupon,
  lines: DiscountLine[],
): DiscountResult {
  const matching = coupon.course
    ? lines.filter(
        (line) =>
          line.courseId === coupon.course!.id || line.slug === coupon.course!.slug,
      )
    : lines;

  if (matching.length === 0) {
    return {
      ok: false,
      message: "Coupon code is not valid for the items in your cart",
    };
  }

  const quantity = matching.reduce((total, line) => total + line.quantity, 0);
  if (quantity < coupon.minQuantity) {
    return {
      ok: false,
      message: `Coupon requires a minimum quantity of ${coupon.minQuantity}`,
    };
  }

  const matchedSubtotal = matching.reduce(
    (total, line) => total + line.unitAmount * line.quantity,
    0,
  );

  // A fixed-value coupon is one flat amount off the matching items, not a
  // per-seat discount — and never more than those items are worth, so a
  // large code on a small order can't produce a negative charge.
  const amount =
    coupon.discountType === "percentage"
      ? Math.round((matchedSubtotal * coupon.discountValue) / 100)
      : Math.min(matchedSubtotal, Math.round(coupon.discountValue * 100));

  return { ok: true, amount, matchedSubtotal };
}
