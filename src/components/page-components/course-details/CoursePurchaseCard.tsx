"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import QuantityStepper from "@/components/shared/QuantityStepper";
import { Arrow, Plus } from "@/components/page-components/concepts/shared";
import { cn, formatPrice, parseDate } from "@/lib/utils";
import { PAYMENT_OPTIONS, type CoursePricingState } from "./useCoursePricing";

const EASE = [0.22, 1, 0.36, 1] as const;

const linkClass =
  "cursor-pointer type-small font-medium text-[#0c7a5e] underline decoration-from-font underline-offset-[3px] transition-colors hover:text-[#06180b] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]";

/**
 * The purchase card from the hero (Figma 183:205): the price, Buy now, Add to
 * cart, then "Apply coupon" as a quiet link that opens in place. Above the price
 * sits the Personal / Group / Enterprise switch, with a seat count for the
 * multi-seat plans — the design (drawn for a Personal-only course) leaves both out.
 */
export default function CoursePurchaseCard({
  pricing,
  hasCertificate,
}: {
  pricing: CoursePricingState;
  hasCertificate: boolean;
}) {
  const {
    selectedPlan,
    quantity,
    coupon,
    setCoupon,
    couponState,
    discountedUnitPrice,
    displayOriginalPrice,
    offerEndsAt,
    selectPlan,
    changeQuantity,
    applyCoupon,
    removeCoupon,
    handleAddToCart,
    handleBuyNow,
  } = pricing;

  const [couponOpen, setCouponOpen] = useState(false);
  const couponInput = useRef<HTMLInputElement>(null);
  const couponId = useId();
  const showCoupon = couponOpen || couponState.status !== "idle";

  useEffect(() => {
    if (couponOpen) couponInput.current?.focus();
  }, [couponOpen]);

  const appliedLabel =
    couponState.status === "applied"
      ? `${couponState.code} · ${
          couponState.discountAmount !== null
            ? `${formatPrice(couponState.discountAmount / 100)} off`
            : couponState.discountType === "percentage"
              ? `${couponState.discountValue}% off`
              : `${formatPrice(couponState.discountValue)} off`
        }`
      : null;

  const note = [selectedPlan === "personal" ? "paid once" : "per seat", hasCertificate && "certificate included"]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full rounded-[20px] bg-[#f7f6f1] p-6 text-[#06180b] shadow-[0_40px_80px_-24px_rgb(0_0_0/0.45)] sm:p-7 lg:w-[400px]">
      <div role="radiogroup" aria-label="Plan" className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-[#06180b]/[0.06] p-1">
        {PAYMENT_OPTIONS.map((option) => {
          const active = selectedPlan === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectPlan(option.id)}
              className={cn(
                "h-9 cursor-pointer rounded-full type-caption font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0c7a5e]",
                active ? "bg-[#06180b] text-[#f2efe6]" : "text-[#06180b]/70 hover:text-[#06180b]",
              )}
            >
              {option.label.replace(" Plan", "")}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1">
        <p className="m-0 font-title type-stat tracking-[-0.03em] tabular-nums">
          {formatPrice(discountedUnitPrice)}
        </p>
        <div className="flex flex-col pb-2 sm:pb-2.5">
          {displayOriginalPrice !== undefined && (
            <span className="type-body text-[#06180b]/45 line-through tabular-nums">{formatPrice(displayOriginalPrice)}</span>
          )}
          <span className="type-small text-[#06180b]/[0.62]">{note}</span>
        </div>
      </div>
      {offerEndsAt && (
        <p className="m-0 mt-2 type-small font-medium text-[#0c7a5e]">
          Offer ends{" "}
          {parseDate(offerEndsAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Europe/London",
          })}
        </p>
      )}

      {selectedPlan !== "personal" && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#06180b]/12 px-4 py-2.5">
          <span className="type-small text-[#06180b]/70">Seats</span>
          <QuantityStepper value={quantity} onChange={changeQuantity} variant="light" />
        </div>
      )}

      <div className="mt-[18px] flex flex-col gap-[18px]">
        <PillButton tone="mint" onClick={handleBuyNow} icon={<Arrow size={16} />}>
          Buy now
        </PillButton>
        <PillButton tone="ink" onClick={() => handleAddToCart()} icon={<Plus size={14} />}>
          Add to cart
        </PillButton>
      </div>

      {!showCoupon && (
        <div className="mt-[18px] flex justify-center">
          <button type="button" className={linkClass} aria-expanded={false} aria-controls={couponId} onClick={() => setCouponOpen(true)}>
            Apply coupon
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {showCoupon && (
          <motion.div
            key="coupon"
            id={couponId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {couponState.status === "applied" ? (
                <div className="flex h-12 items-center justify-between gap-3 rounded-full bg-[#1ee9b5]/20 pl-5 pr-2">
                  <span className="truncate type-small font-medium text-[#0c7a5e]">{appliedLabel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponOpen(false);
                    }}
                    className="h-9 shrink-0 cursor-pointer rounded-full px-3 type-small font-medium text-[#06180b]/70 transition-colors hover:bg-[#06180b]/[0.06] hover:text-[#06180b]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyCoupon();
                  }}
                  className="flex h-12 items-center gap-2 rounded-full border border-[#06180b]/18 bg-white pl-5 pr-1.5 transition-colors focus-within:border-[#0c7a5e]"
                >
                  <label htmlFor={`${couponId}-code`} className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id={`${couponId}-code`}
                    ref={couponInput}
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    autoComplete="off"
                    className="h-full min-w-0 flex-1 bg-transparent text-base md:text-[15px] text-[#06180b] uppercase placeholder:normal-case placeholder:text-[#06180b]/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponState.status === "checking" || !coupon.trim()}
                    className="h-9 shrink-0 cursor-pointer rounded-full bg-[#06180b] px-4 type-small font-medium text-[#f2efe6] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {couponState.status === "checking" ? "Checking…" : "Apply"}
                  </button>
                </form>
              )}
              {couponState.status === "error" && (
                <p role="alert" className="m-0 mt-2 pl-5 type-small text-[#b42318]">
                  {couponState.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The design's call-to-action pill: label left, a round icon chip right, a wipe of colour on hover. */
function PillButton({
  tone,
  onClick,
  icon,
  children,
}: {
  tone: "mint" | "ink";
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const mint = tone === "mint";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-[60px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-full py-2 pl-6 pr-2 type-button font-medium transition-transform active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]",
        mint ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b] text-[#f2efe6]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 right-0 w-0 rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full",
          mint ? "bg-[#5ef0c9]" : "bg-[#0b3a28]",
        )}
      />
      <span className="relative">{children}</span>
      <span
        className={cn(
          "relative grid size-11 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mint ? "bg-[#06180b] text-[#f2efe6] group-hover:-rotate-45" : "bg-[#1ee9b5] text-[#06180b] group-hover:rotate-90",
        )}
      >
        {icon}
      </span>
    </button>
  );
}
