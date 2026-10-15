"use client";

import { cn } from "@/lib/utils";
import { PANEL_TITLE } from "./checkout-ui";

export type PaymentMethod = "card" | "purchase_order";

const OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "purchase_order", label: "Purchase order" },
];

/**
 * Which of the backend's two payment routes this order takes.
 *
 * Card covers the `individual` / `group` / `company_card`
 * purchase types — all charged immediately through Stripe. A purchase
 * order is `company_po`: no card, the order lands `pending` with its
 * licences reserved until an admin approves the PO, and it needs a
 * company to reserve them for. That's why the option can be disabled —
 * there is nothing in the cart it could apply to.
 */
export default function PaymentMethodSelect({
  value,
  onChange,
  purchaseOrderDisabledReason,
  note,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  /** Set when a purchase order can't apply to this cart — also the hint shown. */
  purchaseOrderDisabledReason?: string | null;
  /** Shown under the options once a method is picked, when it needs explaining. */
  note?: string | null;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className={cn(PANEL_TITLE, "mb-4 p-0")}>Payment method</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const isDisabled =
            option.id === "purchase_order" &&
            Boolean(purchaseOrderDisabledReason);
          const isSelected = value === option.id && !isDisabled;

          return (
            <label
              key={option.id}
              className={cn(
                "flex h-14 items-center gap-3 rounded-[14px] border px-4 transition-[border-color,background-color,box-shadow]",
                "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#0c7a5e]",
                isSelected
                  ? "border-[#06180b] bg-white shadow-[0_12px_24px_-18px_rgb(6_24_11/0.45)]"
                  : "border-[#06180b]/15 bg-transparent",
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : !isSelected && "cursor-pointer hover:border-[#06180b]/35 hover:bg-white/60",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.id}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              {/* Drawn rather than a native radio so it matches the rest of
                  the page's controls in every browser. */}
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                  isSelected ? "border-[#06180b] bg-[#06180b]" : "border-[#06180b]/30",
                )}
              >
                {isSelected && (
                  <span className="size-2 rounded-full bg-[#1ee9b5]" />
                )}
              </span>
              <span
                className={cn(
                  "type-body",
                  isSelected ? "font-medium text-[#06180b]" : "text-[#06180b]/75",
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {(purchaseOrderDisabledReason || note) && (
        <p className="m-0 type-small text-[#06180b]/70">
          {purchaseOrderDisabledReason ?? note}
        </p>
      )}
    </fieldset>
  );
}
