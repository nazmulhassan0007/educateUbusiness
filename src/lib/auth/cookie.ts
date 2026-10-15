export const AUTH_COOKIE_NAME = "eu_token";

// The backend documents no token TTL or refresh endpoint — this only bounds
// how long a stale cookie lingers client-side. Real expiry is enforced by
// the backend itself rejecting the token with 401, which getCurrentUser()
// treats as "logged out" (see src/lib/auth/server.ts).
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

// "Remember me" unticked: no maxAge, so the browser drops the cookie when
// it closes (a session cookie) instead of keeping it for 30 days.
export function authCookieOptions(remember: boolean) {
  return remember ? AUTH_COOKIE_OPTIONS : { ...AUTH_COOKIE_OPTIONS, maxAge: undefined };
}
