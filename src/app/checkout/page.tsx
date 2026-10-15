"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance, StripeElementsOptions } from "@stripe/stripe-js";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import {
  getCartTotal,
  useCartHydrated,
  useCartStore,
} from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import AuthPromptModal from "./AuthPromptModal";
import CheckoutForm from "./CheckoutForm";
import CompanySection from "./CompanySection";
import OrderSummary from "./OrderSummary";
import PaymentMethodSelect, { type PaymentMethod } from "./PaymentMethodSelect";
import SeatAllocation from "./SeatAllocation";
import {
  CheckoutHeader,
  ERROR_TEXT,
  FIELD,
  FIELD_ERROR,
  LABEL,
  LINK,
  Note,
  PAGE,
  PANEL,
  PANEL_TITLE,
  PillAction,
  RULE,
  SummaryRow,
  SummaryTotal,
} from "./checkout-ui";
import {
  createEmptyAllocation,
  isAllocationComplete,
  needsAllocation,
  type AllocationState,
  type SeatEntry,
} from "./seat-allocation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Loaded once at module scope, not per-render — `loadStripe` is meant to be
// called a single time and reused (it caches the underlying script load).
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// Mirrors the checkout page's light theme (cream panels, #06180b ink, deep
// mint #0c7a5e for focus and selection — see checkout-ui.tsx) so the Payment
// Element reads as part of the page instead of Stripe's own default.
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorBackground: "#ffffff",
    colorText: "#06180b",
    colorTextSecondary: "#4d5a51",
    colorTextPlaceholder: "#6a736c",
    colorPrimary: "#0c7a5e",
    colorDanger: "#b42318",
    borderRadius: "14px",
    spacingUnit: "4px",
    // PaymentElement renders in a cross-origin iframe, so it can't read
    // `--font-sans` off the parent document — the literal family name has to
    // be paired with the `fonts` entry below so Stripe can load it itself.
    fontFamily: '"Stack Sans Text", sans-serif',
  },
  rules: {
    ".Tab, .Input, .Block, .PickerItem": {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(6, 24, 11, 0.18)",
      boxShadow: "none",
    },
    ".Input": {
      padding: "13px 16px",
    },
    ".Input:hover, .Tab:hover": {
      border: "1px solid rgba(6, 24, 11, 0.3)",
    },
    ".Input:focus, .Tab:focus": {
      border: "1px solid #0c7a5e",
      boxShadow: "0 0 0 4px rgba(30, 233, 181, 0.25)",
    },
    ".Input--invalid": {
      border: "1px solid #b42318",
      boxShadow: "none",
    },
    ".Tab--selected, .Tab--selected:hover, .Tab--selected:focus": {
      border: "1px solid #06180b",
      backgroundColor: "#ffffff",
      color: "#06180b",
    },
    ".TabIcon--selected, .TabLabel--selected": {
      color: "#06180b",
      fill: "#06180b",
    },
    ".Label": {
      color: "rgba(6, 24, 11, 0.8)",
      fontWeight: "500",
    },
  },
};

const elementsFonts: StripeElementsOptions["fonts"] = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=Stack+Sans+Text:wght@200..700&display=swap",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const applyCouponToAll = useCartStore((state) => state.applyCouponToAll);
  const hydrated = useCartHydrated();
  // The coupon the session was priced with is kept beside its secret: a
  // session built before the buyer changed the code charges the wrong
  // amount, so it is simply not rendered once the two disagree (rather
  // than being cleared from inside the effect that replaces it). The cart it
  // was priced from is kept the same way — see `cartKey` below.
  const [session, setSession] = useState<{
    clientSecret: string;
    couponCode: string | null;
    cartKey: string;
  } | null>(null);
  const [paymentSetupError, setPaymentSetupError] = useState<string | null>(
    null,
  );
  const [allocations, setAllocations] = useState<AllocationState>({});
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  // Locked independently per field — an account missing a full_name (e.g.
  // an older magic-link signup) shouldn't leave the buyer stuck with a
  // read-only, empty name field they can never fill in.
  const [lockedFields, setLockedFields] = useState({
    name: false,
    email: false,
  });
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [prefilledEmail, setPrefilledEmail] = useState<string | null>(null);
  const total = getCartTotal(items);
  const authUser = useAuthStore((state) => state.user);
  const fetchAuthUser = useAuthStore((state) => state.fetchUser);
  const isAuthenticated = Boolean(authUser);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  // /checkout is browsable by guests, but only a logged-in user can pay
  // (enforced again server-side in /api/checkout — this is just the UI
  // gate). When there is an account, pre-fill from it and lock whichever
  // fields it actually supplied, so the order can't be placed under a
  // different name/email. Adjusted during render (guarded by
  // `prefilledEmail`) rather than in an effect — same pattern the
  // `allocations` sync below uses — since this only needs to run once the
  // auth store actually resolves a user, not on every render.
  if (authUser && authUser.email !== prefilledEmail) {
    const fullName = [authUser.firstName, authUser.lastName]
      .filter(Boolean)
      .join(" ");
    setPrefilledEmail(authUser.email);
    setBuyerName(fullName);
    setBuyerEmail(authUser.email);
    setLockedFields({
      name: Boolean(fullName),
      email: Boolean(authUser.email),
    });
  }

  const isEmailValid = EMAIL_REGEX.test(buyerEmail.trim());
  const buyerInfoValid = buyerName.trim().length > 0 && isEmailValid;
  const emailError = !emailTouched
    ? null
    : buyerEmail.trim().length === 0
      ? "Email address is required."
      : !isEmailValid
        ? "Please enter a valid email address."
        : null;

  // Keeps `allocations` in sync with the cart's current quantities —
  // creates an entry for a Group/Enterprise line (quantity > 1) that
  // doesn't have one yet, AND resizes an existing entry whose seat count
  // no longer matches (e.g. the buyer went back to /cart and changed the
  // quantity), keeping whatever was already typed rather than discarding
  // it. Checked fresh on every render (not gated behind a "have we seen
  // this cart state before" flag) so a quantity change is always caught,
  // not just on the next full page load. Uses React's "adjust state
  // during render" pattern instead of an effect, since a bare setState
  // call in an effect body trips react-hooks/set-state-in-effect.
  if (hydrated) {
    const outOfSync = items.some((item) => {
      if (item.purchaseType !== "group") return false;
      const existing = allocations[item.course.slug];
      return !existing || existing.length !== item.quantity;
    });

    if (outOfSync) {
      setAllocations((prev) => {
        const next: AllocationState = {};
        for (const item of items) {
          if (item.purchaseType !== "group") continue;

          const existing = prev[item.course.slug];
          if (!existing) {
            next[item.course.slug] = createEmptyAllocation(item.quantity);
            continue;
          }
          if (existing.length === item.quantity) {
            next[item.course.slug] = existing;
            continue;
          }

          const seats = existing.slice(0, item.quantity);
          while (seats.length < item.quantity) {
            seats.push({ firstName: "", lastName: "", email: "" });
          }
          next[item.course.slug] = seats;
        }
        return next;
      });
    }
  }

  const requiresAllocation = needsAllocation(items);
  const allocationComplete = isAllocationComplete(items, allocations);
  // An Enterprise line needs the company it's bought for — chosen or
  // created in the company step below (CompanySection).
  const missingCompany = items.some(
    (item) => item.purchaseType === "enterprise" && !item.companyId,
  );
  // A purchase order is the backend's company_po type: it reserves licences
  // in a company's seat pool, so it only applies to Enterprise-plan lines.
  // Anything else in the cart stays on card and is left behind in the cart
  // for a second, card checkout — which the note below says out loud rather
  // than letting those items quietly vanish from the order.
  const enterpriseItems = items.filter(
    (item) => item.purchaseType === "enterprise",
  );
  const purchaseOrderDisabledReason =
    enterpriseItems.length === 0
      ? "Purchase orders are for Enterprise-plan purchases (6 seats or more)."
      : null;
  const purchaseOrderNote =
    paymentMethod === "purchase_order" && enterpriseItems.length < items.length
      ? "Only your Enterprise-plan items go on the purchase order. The rest stay in your cart to pay by card."
      : null;
  // Guards against a stale selection: the buyer picks a purchase order,
  // then empties the Enterprise items out of the cart on another tab.
  const effectivePaymentMethod: PaymentMethod = purchaseOrderDisabledReason
    ? "card"
    : paymentMethod;

  const canContinue =
    buyerInfoValid &&
    !missingCompany &&
    (!requiresAllocation || allocationComplete);
  const readyForPayment = detailsConfirmed;

  const updateSeat = (
    slug: string,
    seatIndex: number,
    field: keyof SeatEntry,
    value: string,
  ) => {
    setAllocations((prev) => {
      const seats = prev[slug];
      if (!seats) return prev;
      return {
        ...prev,
        [slug]: seats.map((seat, index) =>
          index === seatIndex ? { ...seat, [field]: value } : seat,
        ),
      };
    });
  };

  // One code covers the whole cart (see cart-store's applyCouponToAll), so
  // it is read off the first item that carries one. Changing it has to
  // rebuild the PaymentIntent — the discount is priced into the Checkout
  // Session, not applied on top of it.
  const cartCouponCode =
    items.find((item) => item.couponCode)?.couponCode ?? null;

  // Everything in the cart that changes what a session charges or records,
  // apart from the coupon (which rebuilds the session in place, below).
  const cartKey = items
    .map((item) =>
      [
        item.course.slug,
        item.quantity,
        item.purchaseType,
        item.companyId ?? "",
      ].join(":"),
    )
    .join("|");

  useEffect(() => {
    if (!hydrated || items.length === 0 || !readyForPayment) return;

    // A response that arrives after this run is superseded (coupon changed,
    // or the buyer was sent back to their details) must not land.
    let cancelled = false;
    const requestCartKey = cartKey;

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          slug: item.course.slug,
          title: item.course.title,
          price: item.course.price,
          quantity: item.quantity,
          purchaseType: item.purchaseType,
          couponCode: item.couponCode ?? null,
          companyId: item.companyId ?? null,
        })),
        allocations,
        buyerName,
        buyerEmail,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Could not set up payment.");
        }
        if (cancelled) return;
        setSession({
          clientSecret: (data as { clientSecret: string }).clientSecret,
          couponCode: cartCouponCode,
          cartKey: requestCartKey,
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setPaymentSetupError(error.message);
        setDetailsConfirmed(false);
      });

    return () => {
      cancelled = true;
    };
    // Seeds the PaymentIntent once checkout is ready to pay, and again
    // whenever the coupon changes — re-running it on every
    // keystroke/cart mutation would spin up a new PaymentIntent
    // mid-payment, but a different coupon means a different amount to
    // charge, so that session genuinely has to be replaced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, readyForPayment, cartCouponCode]);

  // The cart can still change while the payment form is open — the navbar's
  // cart dropdown is on this page too. A session charges for the cart it was
  // built from, and the return page then empties whatever the cart holds, so
  // paying on a stale session would charge for one cart and clear another.
  // A changed cart sends the buyer back to confirm their details, which
  // builds a fresh session. Same "adjust state during render" pattern as the
  // allocation sync above.
  if (readyForPayment && session && session.cartKey !== cartKey) {
    setSession(null);
    setDetailsConfirmed(false);
    setPaymentSetupError(
      "Your cart changed, so your order has been updated. Check your details and continue to payment.",
    );
  }

  if (!hydrated) return <section className={PAGE} aria-busy="true" />;

  const onPayment =
    readyForPayment && session && session.couponCode === cartCouponCode;
  const seatCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const savings = total.originalPrice - total.price;
  const backToCart = (
    <Link href="/cart" className={LINK}>
      Back to cart
    </Link>
  );

  if (items.length === 0) {
    return (
      <section className={PAGE}>
        <div className="mx-auto flex max-w-site flex-col gap-10 lg:gap-12">
          <CheckoutHeader step="Details" title="Checkout" />
          <div className={cn(PANEL, "flex flex-col items-start gap-6 sm:p-10")}>
            <div className="flex flex-col gap-2">
              <h2 className={PANEL_TITLE}>Your cart is empty.</h2>
              <p className="m-0 type-body text-[#06180b]/70">
                Add a course to your cart to check out.
              </p>
            </div>
            <PillAction href="/courses" className="sm:w-auto sm:min-w-[280px]">
              Browse courses
            </PillAction>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={PAGE}>
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:gap-12">
        <CheckoutHeader
          step={onPayment ? "Payment" : "Details"}
          title="Checkout"
          aside={backToCart}
        />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
          {onPayment ? (
            <CheckoutElementsProvider
              stripe={stripePromise}
              options={{
                clientSecret: session.clientSecret,
                elementsOptions: { appearance, fonts: elementsFonts },
                adaptivePricing: { allowed: true },
              }}
            >
              <div className={PANEL}>
                <CheckoutForm />
              </div>
              <OrderSummary />
            </CheckoutElementsProvider>
          ) : (
            <>
              <div className={PANEL}>
                {!readyForPayment ? (
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <h2 className={PANEL_TITLE}>Your details</h2>
                        {(lockedFields.name || lockedFields.email) && (
                          <p className="m-0 type-small text-[#06180b]/70">
                            Taken from your account, so the order is placed
                            in your name.
                          </p>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className={LABEL}>Full name</span>
                          <input
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            readOnly={lockedFields.name}
                            className={FIELD}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={LABEL}>Email</span>
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            readOnly={lockedFields.email}
                            aria-invalid={Boolean(emailError)}
                            aria-describedby={
                              emailError ? "buyer-email-error" : undefined
                            }
                            className={cn(FIELD, emailError && FIELD_ERROR)}
                          />
                          {emailError && (
                            <p id="buyer-email-error" className={ERROR_TEXT}>
                              {emailError}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>

                    <CompanySection email={authUser?.email ?? null} />

                    <SeatAllocation
                      items={items}
                      allocations={allocations}
                      onUpdateSeat={updateSeat}
                    />

                    {/* Right before the button whose label it changes. */}
                    <PaymentMethodSelect
                      value={effectivePaymentMethod}
                      onChange={setPaymentMethod}
                      purchaseOrderDisabledReason={purchaseOrderDisabledReason}
                      note={purchaseOrderNote}
                    />

                    <div className="flex flex-col gap-4">
                      {missingCompany && (
                        <Note>
                          Choose or create the company for your Enterprise
                          plan, above, to continue.
                        </Note>
                      )}
                      {paymentSetupError && (
                        <div className="flex flex-col items-start gap-2">
                          <Note tone="error">{paymentSetupError}</Note>
                          {/* A coupon that stopped qualifying (expired, or
                              already redeemed since it was added) fails the
                              whole setup — without this the cart's code
                              can't be cleared from here, and checkout is a
                              dead end. */}
                          {cartCouponCode && (
                            <button
                              type="button"
                              onClick={() => {
                                applyCouponToAll(null);
                                setPaymentSetupError(null);
                              }}
                              className={LINK}
                            >
                              Remove coupon &ldquo;{cartCouponCode}&rdquo; and
                              continue
                            </button>
                          )}
                        </div>
                      )}
                      <PillAction
                        disabled={!canContinue}
                        onClick={() => {
                          // Both routes need an account — the backend has no
                          // guest checkout of any kind.
                          if (!isAuthenticated) {
                            setShowAuthPrompt(true);
                            return;
                          }
                          if (effectivePaymentMethod === "purchase_order") {
                            // No Stripe session is created for a PO: there is
                            // no card to charge. The PO page collects the
                            // reference and document and posts company_po
                            // straight to the backend.
                            router.push("/checkout/purchase-order");
                            return;
                          }
                          setPaymentSetupError(null);
                          setDetailsConfirmed(true);
                        }}
                      >
                        {effectivePaymentMethod === "purchase_order"
                          ? "Continue to purchase order"
                          : "Continue to payment"}
                      </PillAction>
                    </div>
                  </div>
                ) : (
                  <div aria-live="polite" className="flex min-h-[320px] flex-col justify-center gap-4">
                    <span className="h-1 w-24 overflow-hidden rounded-full bg-[#06180b]/10">
                      <span className="block h-full w-1/2 rounded-full bg-[#1ee9b5] motion-safe:animate-[checkout-load_1.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
                    </span>
                    <p className="m-0 type-body text-[#06180b]/70">
                      Loading payment form…
                    </p>
                    <style>{`@keyframes checkout-load { from { transform: translateX(-100%); } to { transform: translateX(200%); } }`}</style>
                  </div>
                )}
              </div>

              <aside
                aria-labelledby="checkout-summary-title"
                className={cn(PANEL, "flex flex-col gap-6 lg:sticky")}
                style={{ top: "calc(var(--navbar-height, var(--home-nav-h)) + 24px)" }}
              >
                <h2 id="checkout-summary-title" className={PANEL_TITLE}>
                  Order summary
                </h2>

                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {items.map((item) => (
                    <li
                      key={item.course.slug}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="m-0 type-small font-medium">
                          {item.course.title}
                        </p>
                        <p className="m-0 type-caption text-[#06180b]/65 tabular-nums">
                          <span className="capitalize">{item.purchaseType}</span>{" "}
                          plan
                          {item.quantity > 1
                            ? ` · ${item.quantity} seats · ${formatPrice(item.course.price)} each`
                            : ""}
                        </p>
                      </div>
                      <p className="m-0 shrink-0 whitespace-nowrap type-small tabular-nums">
                        {formatPrice(item.course.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className={RULE} />

                <div className="flex flex-col gap-3">
                  <SummaryRow
                    label={`Subtotal (${seatCount} ${seatCount === 1 ? "seat" : "seats"})`}
                    value={formatPrice(total.originalPrice)}
                  />
                  {savings > 0 && (
                    <SummaryRow
                      tone="saving"
                      label="Savings"
                      value={`−${formatPrice(savings)}`}
                    />
                  )}
                </div>

                <div className={RULE} />
                <SummaryTotal value={formatPrice(total.price)} />
              </aside>
            </>
          )}
        </div>
      </div>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />
    </section>
  );
}
