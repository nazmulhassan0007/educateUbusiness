import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await authApi("/api/auth/register/individual", {
    method: "POST",
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: result.status });
}
