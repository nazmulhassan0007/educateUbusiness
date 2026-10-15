import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";
import { getAuthToken } from "@/lib/auth/server";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type SignedUpload = { uploadUrl: string; publicUrl: string; key: string };

// Both halves of the PO document upload, run server-side: ask the backend
// for a signed URL, then PUT the bytes to it.
//
// The browser used to do that PUT itself, straight from the purchase-order
// page, which is what the API reference describes. It cannot work here: the
// signed URL is on the backend's own plain-HTTP host, so a page served over
// HTTPS has the request blocked as mixed content before it leaves the
// browser — and on any host, the upload endpoint would need CORS to permit
// a cross-origin PUT. Either way the browser reports the same bare
// "Failed to fetch", with no response to explain it.
//
// Doing it from here removes both problems at once: the browser only ever
// talks to this origin, and this server can speak plain HTTP to the backend
// with no CORS involved. The backend contract is unchanged — it still sees
// exactly the two calls it documents.
export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { error: "You must be logged in to check out." },
      { status: 401 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No PO document was received." },
      { status: 400 },
    );
  }

  // Re-checked here, not just in the form: the page's own validation is a
  // convenience, and this route is reachable without it.
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "The PO document must be a PDF, JPG or PNG." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "The PO document must be 10MB or smaller." },
      { status: 400 },
    );
  }

  const signed = await authApi<SignedUpload>(
    "/api/checkout/po-document-upload-url",
    {
      method: "POST",
      token,
      body: {
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    },
  );

  if (!signed.ok) {
    return NextResponse.json(
      { error: signed.message, errors: signed.errors },
      { status: signed.status },
    );
  }

  const { uploadUrl, publicUrl } = signed.data;
  if (!uploadUrl || !publicUrl) {
    return NextResponse.json(
      { error: "The upload could not be prepared. Please try again." },
      { status: 502 },
    );
  }

  let upload: Response;
  try {
    upload = await fetch(uploadUrl, {
      method: "PUT",
      // The reference is explicit that this has to match the contentType
      // the signed URL was issued for.
      headers: { "Content-Type": file.type },
      body: await file.arrayBuffer(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the upload service. Please try again." },
      { status: 502 },
    );
  }

  if (!upload.ok) {
    console.error(
      `[po-document] Upload PUT failed: ${upload.status} ${upload.statusText}`,
    );
    return NextResponse.json(
      { error: "The PO document could not be uploaded. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { publicUrl } });
}
