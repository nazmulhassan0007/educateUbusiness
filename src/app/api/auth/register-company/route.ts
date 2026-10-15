import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authApi } from "@/lib/auth/backend";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

// Handles both backend branches — the backend itself decides which applies
// based on whether `email` already has an account:
// - Branch A (public, no token needed): brand-new company + brand-new admin.
// - Branch B (requires the caller to be authenticated as that exact
//   account): adds a company to an existing account. Attaching our session
//   token here (when present) is what lets an already-logged-in individual
//   add a company without logging out — omitted for a logged-out visitor,
//   who can only ever hit Branch A anyway.
export async function POST(request: Request) {
  const body = await request.json();
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;

  const result = await authApi("/api/auth/register/company", {
    method: "POST",
    body,
    token,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: result.status });
}
