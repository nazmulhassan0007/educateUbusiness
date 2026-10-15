import { cookies } from "next/headers";
import { authApi } from "./backend";
import { AUTH_COOKIE_NAME } from "./cookie";

// GET /auth/me is the one endpoint on this backend that returns snake_case
// field names — every other endpoint (register, courses, etc.) is
// camelCase. Confirmed against the live backend; the doc never showed an
// example for this endpoint's shape.
export type AuthUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

// Used server-side (Server Components, Route Handlers) wherever the caller
// just needs to know who's logged in — e.g. gating /api/checkout. Returns
// null for both "no cookie" and "backend rejected the token" alike; callers
// that need to distinguish an expired/invalid token (to clear the cookie)
// should call authApi("/api/auth/me", ...) directly instead, as
// src/app/api/auth/me/route.ts does.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const result = await authApi<AuthUser>("/api/auth/me", {
    method: "GET",
    token,
  });
  return result.ok ? result.data : null;
}
