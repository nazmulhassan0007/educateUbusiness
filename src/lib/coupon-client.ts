import type { CouponDiscountType } from "@/lib/coupons/discount";
import type { PurchaseType } from "@/store/cart-store";

// Client-safe. This is only a display preview: /api/checkout looks the same
// code up again against the backend and re-derives the discount itself
// before it ever affects what's charged, and the backend does it a third
// time when the order is recorded.
export type CouponState =
  | { status: "idle" }
  | { status: "checking" }
  | {
      status: "applied";
      code: string;
      discountType: CouponDiscountType;
      /** A percentage (10 = 10% off) or a flat amount in whole currency units. */
      discountValue: number;
      /**
       * The exact discount in pence for the items that were priced, or null
       * when there were none to price (a bundle) — then the caller works the
       * preview out from discountType/discountValue itself.
       */
      discountAmount: number | null;
      /** Set when the coupon only applies to one course. */
      course: { id: string; title: string; slug: string } | null;
    }
  | { status: "error"; message: string };

export type CouponCheckItem = {
  slug: string;
  quantity: number;
  purchaseType: PurchaseType;
};

export async function checkCoupon(
  code: string,
  items?: CouponCheckItem[],
): Promise<CouponState> {
  if (!code.trim()) return { status: "idle" };

  try {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, items }),
    });
    const data = await response.json();

    if (data.valid) {
      return {
        status: "applied",
        code: data.code ?? code.trim(),
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        discountAmount:
          typeof data.discountAmount === "number" ? data.discountAmount : null,
        course: data.course ?? null,
      };
    }
    return { status: "error", message: data.error ?? "Invalid coupon code" };
  } catch {
    return {
      status: "error",
      message: "Couldn't check that code — please try again.",
    };
  }
}

/**
 * The preview discount in whole currency units for a subtotal the caller
 * already knows, used where the server couldn't price the items itself.
 */
export function previewDiscount(
  coupon: Extract<CouponState, { status: "applied" }>,
  subtotal: number,
): number {
  if (coupon.discountAmount !== null) {
    return Math.min(subtotal, coupon.discountAmount / 100);
  }
  return coupon.discountType === "percentage"
    ? (subtotal * coupon.discountValue) / 100
    : Math.min(subtotal, coupon.discountValue);
}
