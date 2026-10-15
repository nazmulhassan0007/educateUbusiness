import { authApi } from "@/lib/auth/backend";
import type { BackendCoupon, CouponDiscountType } from "./discount";

type RawCoupon = {
  code?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
  minQuantity?: unknown;
  course?: { id?: unknown; title?: unknown; slug?: unknown } | null;
};

export type CouponLookup =
  | { ok: true; coupon: BackendCoupon }
  | { ok: false; status: number; message: string };

// The backend is the only authority on coupons: it owns the codes, the
// windows, the per-account redemption record and the discount itself. This
// is POST /api/coupons/details, which runs the exact same validation
// POST /api/checkout runs a step later — so a code accepted here is one
// checkout will accept too (course-scope and minimum-quantity aside, which
// depend on the cart and are checked in computeCouponDiscount).
//
// It needs the buyer's bearer token because "already redeemed" is a
// per-account fact; there is no anonymous coupon lookup.
export async function lookupCoupon(
  token: string,
  code: string,
): Promise<CouponLookup> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: false, status: 400, message: "Enter a coupon code" };
  }

  const result = await authApi<RawCoupon>("/api/coupons/details", {
    method: "POST",
    token,
    body: { couponCode: trimmed },
  });

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      // The backend's own wording ("This coupon has expired", "You have
      // already used this coupon", …) is what the buyer sees — it is more
      // specific than anything that could be substituted here.
      message: result.message || "Coupon code is invalid or inactive",
    };
  }

  const coupon = toCoupon(trimmed, result.data);
  if (!coupon) {
    return {
      ok: false,
      status: 502,
      message: "Couldn't read that coupon — please try again.",
    };
  }

  return { ok: true, coupon };
}

function toCoupon(fallbackCode: string, raw: RawCoupon | null): BackendCoupon | null {
  if (!raw) return null;

  // Decimal strings ("10.00") on the wire, numbers everywhere in this app.
  const discountValue = Number(raw.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) return null;

  const discountType: CouponDiscountType =
    raw.discountType === "fixed" ? "fixed" : "percentage";

  const minQuantity = Number(raw.minQuantity);

  const course =
    raw.course && typeof raw.course.id === "string"
      ? {
          id: raw.course.id,
          title: typeof raw.course.title === "string" ? raw.course.title : "",
          slug: typeof raw.course.slug === "string" ? raw.course.slug : "",
        }
      : null;

  return {
    code: typeof raw.code === "string" && raw.code ? raw.code : fallbackCode,
    discountType,
    discountValue,
    minQuantity: Number.isFinite(minQuantity) && minQuantity > 0 ? minQuantity : 1,
    course,
  };
}
