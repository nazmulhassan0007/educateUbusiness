import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

type VerifyResetOtpData = { valid: boolean };

// Validation-only — does not consume the code. Lets the UI reject a bad
// code before showing the new-password step; POST /api/auth/reset-password
// still re-validates the code itself when the password is actually set.
export async function POST(request: Request) {
  const body = await request.json();
  const result = await authApi<VerifyResetOtpData>("/api/auth/verify-reset-otp", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ valid: result.data.valid });
}
