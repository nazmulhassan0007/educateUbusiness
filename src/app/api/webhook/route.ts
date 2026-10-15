import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import {
  readMetadataValue,
  recordedGroups,
  RECORDED_MARKER_PREFIX,
  submitBackendOrders,
  type OrderLineItem,
} from "@/lib/checkout/backend-order";

// The backend's POST /checkout is only called from here, once Stripe has
// actually confirmed the payment — not from /api/checkout at session-creation
// time — since the backend marks card purchases "paid" immediately with no
// pending-then-flip state. The order payload and the buyer's bearer token
// were stashed on the Checkout Session's metadata by /api/checkout/route.ts
// (see src/lib/checkout/backend-order.ts for the chunking format), since
// this webhook is a server-to-server callback with no access to the
// buyer's session cookie.
//
// Driven by checkout.session.completed and
// checkout.session.async_payment_succeeded (Stripe's recommended pair): a
// delayed payment method completes the session while still unpaid, and only
// the second event says the money actually arrived.

// Returns whether Stripe should redeliver this event. `retryable: true`
// tells the caller to return a non-2xx response — Stripe automatically
// retries a failed webhook delivery with backoff for up to 3 days, which
// is the only "retry" mechanism available here (no local queue/DB exists
// to schedule one ourselves). A non-retryable failure (bad payload, or a
// 400/401/403/409 from the backend) will fail identically on every retry,
// so it's acked instead and just logged for manual reconciliation.
async function recordOrder(sessionId: string): Promise<{ retryable: boolean }> {
  // Fetched fresh rather than read off the event: an event is a snapshot
  // taken when it was created, so on a redelivery it wouldn't show the
  // `recorded_*` markers an earlier attempt wrote.
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  const paymentIntent = paymentIntentId
    ? await stripe.paymentIntents.retrieve(paymentIntentId)
    : null;
  const ref = paymentIntent ? `${session.id} / ${paymentIntent.id}` : session.id;

  // Sessions created before the order details moved onto the session still
  // carry them on their PaymentIntent.
  const sessionMetadata = session.metadata ?? {};
  const orderMetadata = readMetadataValue(sessionMetadata, "order_payload")
    ? sessionMetadata
    : (paymentIntent?.metadata ?? {});

  const payloadJson = readMetadataValue(orderMetadata, "order_payload");
  const token = readMetadataValue(orderMetadata, "auth_token");
  if (!payloadJson || !token) {
    console.error(
      `[stripe webhook] Checkout ${ref} is missing order_payload/auth_token metadata — cannot record the order. NOT retryable — this data will never appear on redelivery.`,
    );
    return { retryable: false };
  }

  let items: OrderLineItem[];
  try {
    items = JSON.parse(payloadJson) as OrderLineItem[];
  } catch {
    console.error(
      `[stripe webhook] Checkout ${ref} has an unreadable order_payload — cannot record the order. NOT retryable, needs manual reconciliation.`,
    );
    return { retryable: false };
  }

  // Markers go on the PaymentIntent, which can always be updated. A session
  // discounted to £0 has no PaymentIntent, so its markers go on the session.
  const markers = paymentIntent?.metadata ?? sessionMetadata;
  const saveMarker = (key: string) => {
    const metadata = { [key]: new Date().toISOString() };
    return paymentIntent
      ? stripe.paymentIntents.update(paymentIntent.id, { metadata })
      : stripe.checkout.sessions.update(session.id, { metadata });
  };

  const couponCode = readMetadataValue(orderMetadata, "coupon_code");
  const results = await submitBackendOrders(token, items, couponCode, {
    alreadyRecorded: recordedGroups(markers),
    onRecorded: async (purchaseType) => {
      try {
        await saveMarker(`${RECORDED_MARKER_PREFIX}${purchaseType}`);
      } catch (error) {
        // The order IS recorded on the backend; only our note of it failed.
        // Not fatal on its own — but if this event is redelivered, this
        // group will be submitted a second time.
        console.error(
          `[stripe webhook] The ${purchaseType} order for ${ref} was recorded on the backend, but its ${RECORDED_MARKER_PREFIX}${purchaseType} marker couldn't be saved — a redelivery would submit it again. Check for a duplicate.`,
          error,
        );
      }
    },
  });

  let retryable = false;
  for (const result of results) {
    if (result.ok) {
      if (result.skipped) {
        console.log(
          `[stripe webhook] The ${result.purchaseType} order for ${ref} was already recorded by an earlier delivery — skipped.`,
        );
      }
      if (result.couponDropped) {
        // The buyer was charged the discounted total but the order is
        // recorded at full price: the backend refused the code after the
        // charge went through (see submitBackendOrders). The enrolment is
        // intact — the order total is what needs correcting by hand.
        console.error(
          `[stripe webhook] Coupon "${result.couponDropped}" was rejected by the backend after payment for ${ref} — the ${result.purchaseType} order was recorded WITHOUT it. Charged ${session.amount_total} (discounted); the recorded order total will be higher. Needs manual reconciliation.`,
        );
      }
      continue;
    }

    // Money has already moved — a non-retryable failure here needs
    // manual reconciliation (same tolerance this app already had for
    // Moodle enrollment failures); a retryable one gets another shot
    // via Stripe's own redelivery instead of being dropped silently.
    console.error(
      `[stripe webhook] Backend order (${result.purchaseType}) failed for ${ref}: ${result.message}` +
        (result.retryable
          ? " — retryable, Stripe will redeliver this event."
          : " — NOT retryable, needs manual reconciliation."),
    );
    if (result.retryable) retryable = true;
  }
  return { retryable };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      console.log(
        `[stripe webhook] ${event.type} — ${session.id}, payment_status: ${session.payment_status}, amount: ${session.amount_total}`,
      );

      // A delayed payment method (e.g. a bank debit) completes the session
      // before the money arrives. Nothing is recorded yet:
      // async_payment_succeeded follows if it clears, async_payment_failed
      // if it doesn't.
      if (session.payment_status === "unpaid") break;

      try {
        const { retryable } = await recordOrder(session.id);
        if (retryable) {
          return NextResponse.json(
            { error: "Backend order submission failed, will retry." },
            { status: 502 },
          );
        }
      } catch (error) {
        // An unexpected/network-level failure (e.g. the backend or Stripe
        // was unreachable) — treat it the same as a retryable result above,
        // since it's exactly the kind of transient failure Stripe's
        // redelivery exists for. Groups already recorded are marked, so a
        // redelivery won't send them again.
        console.error(
          `[stripe webhook] recordOrder threw for ${session.id}:`,
          error,
        );
        return NextResponse.json(
          { error: "Unexpected error recording order, will retry." },
          { status: 502 },
        );
      }
      break;
    }

    case "checkout.session.async_payment_failed": {
      // Nothing was recorded for an unpaid session, so there's nothing to
      // undo — the buyer simply hasn't paid.
      const session = event.data.object;
      console.warn(
        `[stripe webhook] Delayed payment failed for ${session.id} — no order recorded.`,
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
