import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

type ResetPasswordData = { message: string };

export async function POST(request: Request) {
  const body = await request.json();
  const result = await authApi<ResetPasswordData>("/api/auth/reset-password", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ message: result.data.message });
}
