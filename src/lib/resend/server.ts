import { Resend } from "resend";

// Created on first use so builds without RESEND_API_KEY still succeed;
// a request that needs Resend fails with a clear error instead.
let client: Resend | undefined;

function getResend(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export const resend = new Proxy({} as Resend, {
  get: (_target, prop) => Reflect.get(getResend(), prop),
});
