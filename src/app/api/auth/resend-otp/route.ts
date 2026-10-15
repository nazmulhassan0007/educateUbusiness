import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

type ResendOtpData = { otpExpiryMinutes: number };

// Reset-password flow's resend, rate-limited server-side to once per 60s
// per email. Distinct from the login flow's resend, which just re-calls
// POST /api/auth/login (see src/app/api/auth/verify-otp/route.ts).
export async function POST(request: Request) {
  const body = await request.json();
  const result = await authApi<ResendOtpData>("/api/auth/resend-otp", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ otpExpiryMinutes: result.data.otpExpiryMinutes });
}
