import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/components/shared/course-card/CourseCard";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import {
  DEFAULT_QUANTITY_FOR_PLAN,
  planForQuantity,
  useCartStore,
  type PurchaseType,
} from "@/store/cart-store";
import {
  checkCoupon,
  previewDiscount,
  type CouponState,
} from "@/lib/coupon-client";
import { useAuthStore } from "@/store/auth-store";
import { isOfferActive } from "@/lib/courses/offer";

export type PaymentOption = { id: PurchaseType; label: string };

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "personal", label: "Personal Plan" },
  { id: "group", label: "Group Plan" },
  { id: "enterprise", label: "Enterprise Plan" },
];

// Shared pricing/plan/coupon/cart state for a course — the new design shows
// this same widget twice (inline in the hero, then again in the sticky
// sidebar once you scroll past it), so the state has to live above both
// rather than duplicating it per-instance, or picking a plan in one place
// wouldn't be reflected in the other.
export function useCoursePricing(course: ApiCourseDetail) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const authUser = useAuthStore((state) => state.user);
  const fetchAuthUser = useAuthStore((state) => state.fetchUser);
  const [selectedPlan, setSelectedPlan] = useState<PurchaseType>("personal");
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<CouponState>({
    status: "idle",
  });
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  const price = Number(course.price);
  const discountedPrice = course.discountedPrice
    ? Number(course.discountedPrice)
    : null;
  // Personal tier only — Group/Enterprise each have their own flat CMS
  // price with no separate "was" price of their own.
  const personalPrice = discountedPrice ?? price;
  const personalOriginalPrice = discountedPrice ? price : undefined;

  // Falls back to the Personal price if a tier's CMS price isn't set yet,
  // so the widget still shows *something* rather than £0 while pricing is
  // being filled in.
  const tierPrices: Record<PurchaseType, number> = {
    personal: personalPrice,
    group: course.groupPlanPrice ? Number(course.groupPlanPrice) : personalPrice,
    enterprise: course.enterprisePlanPrice
      ? Number(course.enterprisePlanPrice)
      : personalPrice,
  };

  // A live offer overrides every tier (same rule checkout charges by, see
  // src/lib/courses/offer.ts); the tier's regular price is struck through.
  const offerPrice = isOfferActive(course) ? Number(course.offerPrice) : null;
  const priceForPlan = (plan: PurchaseType) =>
    offerPrice !== null
      ? {
          price: offerPrice,
          originalPrice:
            plan === "personal"
              ? (personalOriginalPrice ?? personalPrice)
              : tierPrices[plan],
        }
      : {
          price: tierPrices[plan],
          originalPrice:
            plan === "personal" ? personalOriginalPrice : undefined,
        };

  const { price: unitPrice, originalPrice: unitOriginalPrice } =
    priceForPlan(selectedPlan);

  // Preview only — recalculated from whichever tier/quantity is currently
  // selected, so it stays correct if the buyer changes plan after applying
  // a code.
  //
  // A coupon discounts the *order*, not a seat (that's how the backend
  // applies it, and how /api/checkout hands it to Stripe), so it comes off
  // the quantity-scaled subtotal once and is divided back across quantity
  // for this per-unit display. Subtracting it from `unitPrice` directly
  // would overstate the discount by `quantity`x for anything but one seat.
  const subtotal = unitPrice * quantity;
  const discountedSubtotal =
    couponState.status === "applied"
      ? Math.max(0, subtotal - previewDiscount(couponState, subtotal))
      : subtotal;
  const discountedUnitPrice = discountedSubtotal / quantity;
  const displayOriginalPrice =
    couponState.status === "applied" && discountedUnitPrice !== unitPrice
      ? unitPrice
      : unitOriginalPrice;

  const cartCourse: Course = {
    slug: course.slug,
    title: course.title,
    description: course.shortDescription,
    rating:
      course.rating && course.reviewCount > 0
        ? `${course.reviewCount}+ Student Rated ${course.rating} Star`
        : undefined,
    price: discountedUnitPrice,
    originalPrice: displayOriginalPrice,
    thumbnailImage: course.thumbnailImage?.url ?? null,
    kind: "course",
    planPrices: {
      personal: priceForPlan("personal"),
      group: priceForPlan("group"),
      enterprise: priceForPlan("enterprise"),
    },
  };

  const selectPlan = (plan: PurchaseType) => {
    setSelectedPlan(plan);
    setQuantity(DEFAULT_QUANTITY_FOR_PLAN[plan]);
  };

  const changeQuantity = (qty: number) => {
    setQuantity(qty);
    setSelectedPlan(planForQuantity(qty));
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    if (!authUser) {
      setShowAuthPrompt(true);
      return;
    }
    setCouponState({ status: "checking" });
    setCouponState(
      await checkCoupon(coupon, [
        { slug: course.slug, quantity, purchaseType: selectedPlan },
      ]),
    );
  };

  const removeCoupon = () => {
    setCoupon("");
    setCouponState({ status: "idle" });
  };

  // A coupon already applied may stop qualifying (or start qualifying) as
  // the buyer changes seat count or plan tier — the backend's minimum
  // quantity is checked against exactly those. Re-run the same check rather
  // than leaving a stale "applied" state on screen.
  useEffect(() => {
    if (couponState.status !== "applied") return;
    const code = couponState.code;
    checkCoupon(code, [
      { slug: course.slug, quantity, purchaseType: selectedPlan },
    ]).then(setCouponState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, selectedPlan]);

  const handleAddToCart = (openDropdown = true) =>
    addItem(
      cartCourse,
      selectedPlan,
      quantity,
      couponState.status === "applied" ? couponState.code : null,
      openDropdown,
    );

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/cart");
  };

  return {
    selectedPlan,
    quantity,
    coupon,
    setCoupon,
    couponState,
    showAuthPrompt,
    setShowAuthPrompt,
    discountedUnitPrice,
    displayOriginalPrice,
    offerEndsAt: offerPrice !== null ? course.offerEndsAt : null,
    selectPlan,
    changeQuantity,
    applyCoupon,
    removeCoupon,
    handleAddToCart,
    handleBuyNow,
  };
}

export type CoursePricingState = ReturnType<typeof useCoursePricing>;
