import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import { safeRedirect } from "@/lib/auth/redirect";

// /checkout itself is browsable by guests — the checkout page prompts for
// login only when the buyer tries to pay, and /api/checkout independently
// rejects unauthenticated requests server-side.
const AUTH_ONLY_ROUTES = ["/login", "/register"];

// Only checks whether our session cookie is present — it doesn't verify the
// token against the backend on every request (unlike the old Supabase
// middleware's getUser() call), since that would add a real-latency backend
// round trip to every single navigation. A stale/expired cookie just means
// getCurrentUser() (src/lib/auth/server.ts) or /api/auth/me later finds it
// invalid and treats the visitor as logged out.
export function proxy(request: NextRequest) {
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(`${route}/`),
  );

  if (isAuthOnlyRoute && request.cookies.get(AUTH_COOKIE_NAME)) {
    const redirect = safeRedirect(request.nextUrl.searchParams.get("redirect"));
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
