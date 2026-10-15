import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";

// Advisory only — register/register-company still enforce uniqueness
// themselves with a 409, so this just lets the form flag a taken email
// before the user fills out the rest of it.
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const result = await authApi<{ is_exist_email: boolean }>(
    `/api/auth/email-availability?email=${encodeURIComponent(email)}`,
    { method: "GET" },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ exists: result.data.is_exist_email });
}
