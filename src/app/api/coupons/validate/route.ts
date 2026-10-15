import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/server";
import { getCourseBySlug } from "@/lib/courses/loaders";
import { lookupCoupon } from "@/lib/coupons/backend";
import { computeCouponDiscount, type DiscountLine } from "@/lib/coupons/discount";
import { resolveUnitAmount } from "@/lib/stripe/checkout-amounts";
import type { PurchaseType } from "@/store/cart-store";

type ValidateRequestItem = {
  slug: string;
  quantity: number;
  purchaseType: PurchaseType;
};

// The "10% off before you commit" preview. It runs the backend's own
// coupon check (POST /api/coupons/details) rather than a second, parallel
// source of codes — the charge and the order both come from that same
// coupon, so the preview has to as well or it would advertise a discount
// checkout then refuses.
//
// Prices are re-derived here from the course API for the same reason
// /api/checkout does it: only the code string is ever trusted from the
// client.
export async function POST(request: Request) {
  const { code, items } = (await request.json()) as {
    code?: string;
    items?: ValidateRequestItem[];
  };

  if (!code?.trim()) {
    return NextResponse.json({ valid: false, error: "Enter a coupon code" });
  }

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({
      valid: false,
      error: "Log in to apply a coupon code.",
    });
  }

  const lookup = await lookupCoupon(token, code);
  if (!lookup.ok) {
    return NextResponse.json({ valid: false, error: lookup.message });
  }

  const { coupon } = lookup;
  const base = {
    valid: true as const,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minQuantity: coupon.minQuantity,
    course: coupon.course,
  };

  // No items to price against (the bundle sidebar has no backend course of
  // its own) — the code itself is still confirmed, and the caller shows the
  // discount shape rather than an exact figure.
  if (!items?.length) {
    return NextResponse.json({ ...base, discountAmount: null });
  }

  const courseResults = await Promise.all(
    items.map((item) => getCourseBySlug(item.slug).catch(() => null)),
  );

  const lines: DiscountLine[] = [];
  items.forEach((item, index) => {
    const course = courseResults[index]?.data;
    if (!course) return;
    const unitAmount = resolveUnitAmount(course, item.purchaseType);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) return;
    lines.push({
      courseId: course.id,
      slug: item.slug,
      unitAmount: Math.round(unitAmount * 100),
      quantity: Math.max(1, item.quantity),
    });
  });

  if (lines.length === 0) {
    return NextResponse.json({ ...base, discountAmount: null });
  }

  const discount = computeCouponDiscount(coupon, lines);
  if (!discount.ok) {
    return NextResponse.json({ valid: false, error: discount.message });
  }

  return NextResponse.json({ ...base, discountAmount: discount.amount });
}
