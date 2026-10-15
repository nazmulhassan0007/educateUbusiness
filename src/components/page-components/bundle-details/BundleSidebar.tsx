"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoBookOutline,
  IoCheckmarkCircleOutline,
  IoRibbonOutline,
  IoTimeOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import type { ApiBundle } from "@/lib/courses/loaders";
import { bundleToCartCourse } from "@/lib/courses/mappers";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  checkCoupon,
  previewDiscount,
  type CouponState,
} from "@/lib/coupon-client";
import { useAuthStore } from "@/store/auth-store";
import AuthPromptModal from "@/app/checkout/AuthPromptModal";

export default function BundleSidebar({ bundle }: { bundle: ApiBundle }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const authUser = useAuthStore((state) => state.user);
  const fetchAuthUser = useAuthStore((state) => state.fetchUser);
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<CouponState>({
    status: "idle",
  });
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  const price = Number(bundle.price);
  const originalPrice = bundle.originalPrice
    ? Number(bundle.originalPrice)
    : undefined;

  // Preview only — recalculated from the bundle's own price. /api/checkout
  // re-validates the code and re-derives the discount server-side.
  const discountedPrice =
    couponState.status === "applied"
      ? Math.max(0, price - previewDiscount(couponState, price))
      : price;
  const displayOriginalPrice =
    couponState.status === "applied" && discountedPrice !== price
      ? price
      : originalPrice;

  const includedCourses = [...bundle.courses].map((course) => course.title);

  const bundleDetails: { icon: IconType; label: string }[] = [
    bundle.durationLabel && { icon: IoTimeOutline, label: bundle.durationLabel },
    bundle.deliveryMode && { icon: IoBookOutline, label: bundle.deliveryMode },
    bundle.certificationBadge && {
      icon: IoRibbonOutline,
      label: bundle.certificationBadge,
    },
  ].filter((option): option is { icon: IconType; label: string } =>
    Boolean(option),
  );

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    if (!authUser) {
      setShowAuthPrompt(true);
      return;
    }
    // No items are sent: a bundle is not one of the backend's courses, so
    // there is nothing for it to price the discount against. The code
    // itself is still confirmed against the backend, and the figure below
    // is worked out from the coupon's own shape.
    setCouponState({ status: "checking" });
    setCouponState(await checkCoupon(coupon));
  };

  const removeCoupon = () => {
    setCoupon("");
    setCouponState({ status: "idle" });
  };

  const handleAddToCart = (openDropdown = true) =>
    addItem(
      {
        ...bundleToCartCourse(bundle),
        price: discountedPrice,
        originalPrice: displayOriginalPrice,
      },
      "personal",
      1,
      couponState.status === "applied" ? couponState.code : null,
      openDropdown,
    );

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/cart");
  };

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-white/9 bg-[rgba(137,137,137,0.05)] p-6 lg:p-8">
      {includedCourses.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            <h3 className="font-title type-h4 font-semibold text-on-dark">
              What&rsquo;s Included
            </h3>
            <div className="flex flex-col gap-3">
              {includedCourses.map((title, index) => (
                <div key={`${title}-${index}`} className="flex items-start gap-2.5">
                  <IoCheckmarkCircleOutline className="mt-0.5 size-5 shrink-0 text-primary-500" />
                  <p className="type-body font-light text-on-dark">{title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-white/9" />
        </>
      )}

      {bundleDetails.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            <h3 className="font-title type-h4 font-semibold text-on-dark">
              Bundle Details
            </h3>
            <div className="flex flex-col gap-4">
              {bundleDetails.map((option) => (
                <div key={option.label} className="flex items-center gap-2.5">
                  <option.icon className="size-5 shrink-0 text-primary-500" />
                  <p className="type-small font-light text-on-dark whitespace-nowrap">
                    {option.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-white/9" />
        </>
      )}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="type-stat font-semibold text-on-dark">
          {formatPrice(discountedPrice)}
        </span>
        {displayOriginalPrice && (
          <span className="type-body font-light text-[#f08083] line-through">
            {formatPrice(displayOriginalPrice)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-primary-900 py-5 px-6 rounded-[20px]">
        <p className="type-small font-medium text-on-dark">Apply Coupon</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon code"
            disabled={couponState.status === "applied"}
            className="h-12 flex-1 rounded-lg border border-white/9 bg-transparent px-4 text-base md:text-sm text-on-dark placeholder:text-on-dark/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={
              couponState.status === "checking" ||
              couponState.status === "applied"
            }
            className="h-12 shrink-0 rounded-lg bg-primary-500 px-5 type-small font-medium text-primary-950 disabled:opacity-50"
          >
            {couponState.status === "checking" ? "Checking…" : "Apply Now"}
          </button>
        </div>
        {couponState.status === "applied" && (
          <div className="flex h-[54px] items-center justify-between rounded-lg border border-accent-600 px-4">
            <span className="type-small font-medium text-primary-500">
              {couponState.code} &mdash;{" "}
              {couponState.discountType === "percentage"
                ? `${couponState.discountValue}% off`
                : `${formatPrice(couponState.discountValue)} off`}
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className="type-small font-medium text-on-dark/60 hover:text-on-dark"
            >
              Remove
            </button>
          </div>
        )}
        {couponState.status === "error" && (
          <p className="type-small text-[#f08083]">{couponState.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleAddToCart()}
          className="h-12 flex-1 cursor-pointer rounded-lg bg-primary-500 type-button font-medium text-primary-950 transition-colors hover:bg-primary-500/90"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="h-12 flex-1 cursor-pointer rounded-lg border border-primary-500 type-button font-medium text-primary-500 transition-colors hover:bg-primary-500/10"
        >
          Buy Now
        </button>
      </div>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        redirectTo={`/bundles/${bundle.slug}`}
      />
    </div>
  );
}
