import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

type ForgotPasswordData = { otpExpiryMinutes: number };

export async function POST(request: Request) {
  const body = await request.json();
  const result = await authApi<ForgotPasswordData>("/api/auth/forgot-password", {
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
