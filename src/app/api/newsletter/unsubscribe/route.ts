import { NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/lib/resend/newsletter";

// Two callers, one shape: the unsubscribe page's button, and mail clients'
// own "Unsubscribe" buttons (RFC 8058 one-click — they POST to the URL in the
// email's List-Unsubscribe header with a form body we don't need). Both carry
// the address and its token in the query string.
//
// POST only, never GET: link scanners and inbox previews open every link in
// an email, and must not unsubscribe anyone by doing so.
export async function POST(request: Request) {
  const params = new URL(request.url).searchParams;
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  try {
    const result = await unsubscribeFromNewsletter(email, token);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[newsletter] Unsubscribe failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not unsubscribe right now. Please try again." },
      { status: 500 },
    );
  }
}
