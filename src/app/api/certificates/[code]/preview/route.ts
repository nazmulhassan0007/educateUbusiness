import { getCoursesApiURL } from "@/lib/courses/get-url";
import {
  certificateVerifyPath,
  isValidVerificationCode,
} from "@/lib/certificates/loaders";

const BASE_URL = getCoursesApiURL();

// A thin proxy for the backend's watermarked PDF
// (`GET /api/certificates/verify/{code}/preview`). It exists because that
// backend is served over plain HTTP: linking a browser straight at it from
// this HTTPS page would be blocked as mixed content. Nothing is added to the
// request — the endpoint is public, exactly as the verification JSON is.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  // `?download=1` is the same PDF with an attachment disposition — the
  // checker offers both, because a browser's built-in viewer and a saved
  // file are two different things someone might want from one certificate.
  const isDownload = new URL(request.url).searchParams.get("download") === "1";
  if (!isValidVerificationCode(code)) {
    return Response.json(
      { error: "No valid certificate found for this code." },
      { status: 404 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      new URL(`${certificateVerifyPath(code)}/preview`, BASE_URL),
      { headers: { Accept: "application/pdf" }, cache: "no-store" },
    );
  } catch {
    return Response.json(
      { error: "The verification service didn't answer. Please try again." },
      { status: 502 },
    );
  }

  // Only a currently-valid certificate renders — an expired, revoked or
  // unknown code is a flat 404 upstream, which is passed straight through.
  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: "No valid certificate found for this code." },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${
        isDownload ? "attachment" : "inline"
      }; filename="educateU-certificate-${code}.pdf"`,
      // A revoked certificate has to stop rendering immediately, so this is
      // never cached anywhere along the way.
      "Cache-Control": "no-store",
    },
  });
}
