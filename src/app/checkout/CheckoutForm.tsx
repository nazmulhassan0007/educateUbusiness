"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BillingAddressElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { Note, PANEL_TITLE, PillAction } from "./checkout-ui";

export default function CheckoutForm() {
  const checkoutState = useCheckoutElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (checkoutState.type !== "success") return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // Surfaces Stripe's own inline "this field is required" messages on
    // the Billing address / Payment elements themselves (e.g. a blank
    // required address field) before attempting to charge the card.
    const validation = await checkoutState.checkout.validateElements();
    if (validation.type === "error") {
      setErrorMessage(
        validation.error.validation_errors[0]?.message ??
          validation.error.message ??
          "Please fill in all required fields.",
      );
      setIsSubmitting(false);
      return;
    }

    // `return_url` is already set on the Checkout Session itself (see
    // route.ts) — Stripe rejects passing it again here.
    const result = await checkoutState.checkout.confirm();

    if (result.type === "error") {
      setErrorMessage(result.error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/checkout/return?session_id=${result.session.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h2 className={PANEL_TITLE}>Billing address</h2>
        <BillingAddressElement
          onLoadError={(event) => {
            console.error(
              "[checkout] BillingAddressElement failed to load:",
              event.error,
            );
            setErrorMessage(
              event.error.message ?? "Could not load the billing address form.",
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className={PANEL_TITLE}>Payment method</h2>
        <PaymentElement
          onLoadError={(event) => {
            console.error(
              "[checkout] PaymentElement failed to load:",
              event.error,
            );
            setErrorMessage(
              event.error.message ?? "Could not load the payment form.",
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        {errorMessage && <Note tone="error">{errorMessage}</Note>}
        <PillAction
          type="submit"
          disabled={checkoutState.type !== "success" || isSubmitting}
        >
          {isSubmitting ? "Processing…" : "Pay now"}
        </PillAction>
        <p className="m-0 text-center type-caption text-[#06180b]/65">
          Payments are processed securely by Stripe.
        </p>
      </div>
    </form>
  );
}
