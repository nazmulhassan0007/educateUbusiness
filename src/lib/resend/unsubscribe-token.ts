import { createHmac, timingSafeEqual } from "node:crypto";

// Unsubscribe links carry the address and an HMAC of it, so a link only ever
// works for the address it was sent to — nobody can unsubscribe someone else
// by editing the email in the URL. No expiry: an unsubscribe link has to keep
// working for as long as the email it's in sits in someone's inbox.
//
// NEWSLETTER_UNSUBSCRIBE_SECRET should be its own random value. The Resend key
// is only a fallback so sign-ups don't break while it's being added; rotating
// whichever one is in use invalidates every link already sent.
function secret(): string {
  const value = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? process.env.RESEND_API_KEY;
  if (!value) throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET is not set.");
  return value;
}

function sign(email: string): string {
  return createHmac("sha256", secret())
    .update(`newsletter-unsubscribe:${email.trim().toLowerCase()}`)
    .digest("base64url");
}

export function unsubscribeToken(email: string): string {
  return sign(email);
}

export function isValidUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The query string both the unsubscribe page and the one-click endpoint read. */
export function unsubscribeQuery(email: string): string {
  return new URLSearchParams({ email, token: unsubscribeToken(email) }).toString();
}
