import Stripe from "stripe";

// Created on first use so builds without STRIPE_SECRET_KEY still succeed;
// a request that needs Stripe fails with a clear error instead.
let client: Stripe | undefined;

function getStripe(): Stripe {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => Reflect.get(getStripe(), prop),
});
