import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth/cookie";

type LoginData =
  | { otpRequired: true; email: string; otpExpiryMinutes: number }
  | { otpRequired: false; token: string; user: { id: string; email: string } };

export async function POST(request: Request) {
  // `remember` is ours (the cookie's lifetime), not the backend's.
  const { remember = false, ...body } = await request.json();
  const result = await authApi<LoginData>("/api/auth/login", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  if (result.data.otpRequired) {
    return NextResponse.json({
      otpRequired: true,
      email: result.data.email,
      otpExpiryMinutes: result.data.otpExpiryMinutes,
    });
  }

  const response = NextResponse.json({ otpRequired: false });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    result.data.token,
    authCookieOptions(Boolean(remember)),
  );
  return response;
}
