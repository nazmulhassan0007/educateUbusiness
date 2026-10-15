import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import { stripe } from "@/lib/stripe/server";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <section className="bg-surface-dark py-16 lg:py-24">
        <Bounded className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-start gap-4 self-start text-left md:items-center md:self-auto md:text-center">
            <h1 className="font-title type-h1 font-semibold text-on-dark">
              Something Went Wrong
            </h1>
            <p className="max-w-md text-on-dark/70">No payment was found.</p>
          </div>
          <PrimaryButton label="Back to Cart" href="/cart" />
        </Bounded>
      </section>
    );
  }

  // Retrieval itself can fail (invalid/expired id, wrong Stripe mode, etc.)
  // — treat that the same as an unsuccessful payment rather than letting it
  // crash to a generic error page, so the buyer always gets a clear answer.
  // "processing": a delayed payment method (e.g. a bank debit) completed the
  // session but the money hasn't arrived yet — the order is recorded by the
  // webhook once it does. "paid" includes a session discounted to £0.
  let outcome: "paid" | "processing" | "failed" = "failed";
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.status === "complete") {
      outcome = session.payment_status === "unpaid" ? "processing" : "paid";
    }
  } catch {
    outcome = "failed";
  }

  return (
    <section className="bg-surface-dark py-16 lg:py-24">
      <Bounded className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-start gap-4 self-start text-left md:items-center md:self-auto md:text-center">
          {outcome === "paid" ? (
            <>
              <ClearCartOnSuccess />
              <h1 className="font-title type-h1 font-semibold text-on-dark">
                Payment Successful
              </h1>
              <p className="max-w-md text-on-dark/70">
                Thanks for your purchase. We&rsquo;re adding your courses to
                your account now &mdash; they&rsquo;ll be ready in a few
                moments.
              </p>
            </>
          ) : outcome === "processing" ? (
            <>
              {/* Cleared too: the order is placed, so leaving it in the cart
                  invites paying for it twice. */}
              <ClearCartOnSuccess />
              <h1 className="font-title type-h1 font-semibold text-on-dark">
                Payment Processing
              </h1>
              <p className="max-w-md text-on-dark/70">
                Thanks for your order. Your payment is still being processed
                by your bank &mdash; your courses will be added to your
                account as soon as it clears.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-title type-h1 font-semibold text-on-dark">
                Payment Not Completed
              </h1>
              <p className="max-w-md text-on-dark/70">
                Your payment didn&rsquo;t go through. You can try again from
                your cart.
              </p>
            </>
          )}
        </div>
        <PrimaryButton label="Continue Browsing" href="/courses" />
      </Bounded>
    </section>
  );
}
