import { NextResponse } from "next/server";
import { sendContactEnquiry, type ContactEnquiry } from "@/lib/resend/contact";

const str = (value: unknown) => (typeof value === "string" ? value : "");

export async function POST(request: Request) {
  let body: Partial<Record<keyof ContactEnquiry, unknown>>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const enquiry: ContactEnquiry = {
    firstName: str(body.firstName),
    lastName: str(body.lastName),
    phone: str(body.phone),
    email: str(body.email),
    inquiry: str(body.inquiry),
    message: str(body.message),
  };

  try {
    const result = await sendContactEnquiry(enquiry);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[contact] Enquiry failed:", error);
    return NextResponse.json(
      { success: false, error: "We couldn’t send your enquiry just now. Please try again." },
      { status: 500 },
    );
  }
}
