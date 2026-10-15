import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

// Stateless JWT, no backend session to invalidate — logout is just clearing
// our own cookie.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
