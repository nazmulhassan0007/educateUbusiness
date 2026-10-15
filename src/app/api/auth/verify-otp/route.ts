import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth/cookie";

type VerifyOtpData = {
  otpRequired: false;
  token: string;
  user: { id: string; email: string };
};

export async function POST(request: Request) {
  // `remember` is ours (the cookie's lifetime), not the backend's.
  const { remember = false, ...body } = await request.json();
  const result = await authApi<VerifyOtpData>("/api/auth/verify-login-otp", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    result.data.token,
    authCookieOptions(Boolean(remember)),
  );
  return response;
}
