import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/resend/newsletter";

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = (await request.json()) as { email?: unknown });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { success: false, error: "Enter your email address" },
      { status: 400 },
    );
  }

  try {
    const result = await subscribeToNewsletter(email, new URL(request.url).origin);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[newsletter] Subscribe failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not subscribe right now" },
      { status: 500 },
    );
  }
}
