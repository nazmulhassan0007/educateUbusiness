import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authApi } from "@/lib/auth/backend";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import type { AuthUser } from "@/lib/auth/server";

export async function GET() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });

  const result = await authApi<AuthUser>("/api/auth/me", { method: "GET", token });

  if (!result.ok) {
    const response = NextResponse.json({ user: null });
    // Only a real "this token is invalid" answer clears the cookie — a
    // transient backend/network failure shouldn't silently log someone out.
    if (result.status === 401) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ user: result.data });
}
