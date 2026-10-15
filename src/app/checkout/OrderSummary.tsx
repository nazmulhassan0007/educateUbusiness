"use client";

import { useState } from "react";
import {
  useCheckoutElements,
  CurrencySelectorElement,
} from "@stripe/react-stripe-js/checkout";
import { checkCoupon } from "@/lib/coupon-client";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import {
  ERROR_TEXT,
  PANEL,
  PANEL_TITLE,
  RULE,
  SummaryRow,
  SummaryTotal,
} from "./checkout-ui";

const CONTAINER_CLASSNAME = cn(PANEL, "flex flex-col gap-6 lg:sticky");
const CONTAINER_STYLE = {
  top: "calc(var(--navbar-height, var(--home-nav-h)) + 24px)",
};

// Coupons are the backend's, not Stripe's: the same code is validated
// again when the order is recorded, and the discount charged here is the
// one the backend will compute (see /api/checkout). So this box drives the
// cart's own coupon rather than Stripe's `applyPromotionCode` — a code
// applied Stripe-side would discount the charge without the backend ever
// hearing about it, leaving the order recorded at full price and the
// redemption never taken.
export default function OrderSummary() {
  const checkoutState = useCheckoutElements();
  const items = useCartStore((state) => state.items);
  const applyCouponToAll = useCartStore((state) => state.applyCouponToAll);
  const appliedCode = items.find((item) => item.couponCode)?.couponCode ?? null;
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (checkoutState.type !== "success") {
    return (
      <aside className={CONTAINER_CLASSNAME} style={CONTAINER_STYLE}>
        <h2 className={PANEL_TITLE}>Order summary</h2>
        <p
          className={
            checkoutState.type === "error"
              ? ERROR_TEXT
              : "m-0 type-small text-[#06180b]/70"
          }
        >
          {checkoutState.type === "error"
            ? checkoutState.error.message
            : "Loading order summary…"}
        </p>
      </aside>
    );
  }

  const { checkout } = checkoutState;
  const { lineItems, total, discountAmounts } = checkout;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    // Checked before it is committed to the cart, so an invalid code is
    // answered here instead of failing the rebuilt PaymentIntent.
    const result = await checkCoupon(
      code,
      items.map((item) => ({
        slug: item.course.slug,
        quantity: item.quantity,
        purchaseType: item.purchaseType,
      })),
    );
    if (result.status === "applied") {
      setCouponInput("");
      // Rebuilds the Checkout Session at the discounted amount — the
      // discount is priced into the session, not applied on top of it.
      applyCouponToAll(result.code);
    } else if (result.status === "error") {
      setCouponError(result.message);
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponError(null);
    applyCouponToAll(null);
  };

  return (
    <aside
      aria-labelledby="payment-summary-title"
      className={CONTAINER_CLASSNAME}
      style={CONTAINER_STYLE}
    >
      <h2 id="payment-summary-title" className={PANEL_TITLE}>
        Order summary
      </h2>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {lineItems.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="m-0 type-small font-medium">{item.name}</p>
              {item.quantity > 1 && (
                <p className="m-0 type-caption text-[#06180b]/65 tabular-nums">
                  {item.quantity} seats · {item.unitAmount.amount} each
                </p>
              )}
            </div>
            <p className="m-0 shrink-0 whitespace-nowrap type-small tabular-nums">
              {item.total.amount}
            </p>
          </li>
        ))}
      </ul>

      <div className={RULE} />

      <div className="flex flex-col gap-3">
        <SummaryRow label="Subtotal" value={total.subtotal.amount} />
        {discountAmounts && discountAmounts.length > 0 && (
          <SummaryRow
            tone="saving"
            label={`Coupon${appliedCode ? ` (${appliedCode})` : ""}`}
            value={`−${total.discount.amount}`}
          />
        )}
      </div>

      {appliedCode ? (
        <div className="flex h-12 items-center justify-between gap-3 rounded-full bg-[#1ee9b5]/20 pl-5 pr-1.5">
          <span className="truncate type-small font-medium text-[#0c7a5e]">
            {appliedCode} applied
          </span>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="h-9 shrink-0 cursor-pointer rounded-full px-3 type-small font-medium text-[#06180b]/70 transition-colors hover:bg-[#06180b]/[0.06] hover:text-[#06180b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyCoupon();
            }}
            className="flex h-12 items-center gap-2 rounded-full border border-[#06180b]/18 bg-white pl-5 pr-1.5 transition-colors focus-within:border-[#0c7a5e] focus-within:ring-4 focus-within:ring-[#1ee9b5]/25"
          >
            <label htmlFor="checkout-coupon" className="sr-only">
              Coupon code
            </label>
            <input
              id="checkout-coupon"
              type="text"
              placeholder="Coupon code"
              autoComplete="off"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              aria-invalid={Boolean(couponError)}
              className="h-full min-w-0 flex-1 bg-transparent type-body uppercase text-[#06180b] caret-[#0c7a5e] placeholder:normal-case placeholder:text-[#06180b]/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="h-9 shrink-0 cursor-pointer rounded-full bg-[#06180b] px-4 type-small font-medium text-[#f2efe6] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isApplyingCoupon ? "Applying…" : "Apply"}
            </button>
          </form>
          {couponError && (
            <p role="alert" className={cn(ERROR_TEXT, "pl-5")}>
              {couponError}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="type-small font-medium text-[#06180b]/80">Currency</span>
        <CurrencySelectorElement />
      </div>

      <div className={RULE} />
      <SummaryTotal label="Total due" value={total.total.amount} />
    </aside>
  );
}
