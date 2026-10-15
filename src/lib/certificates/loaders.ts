import { getCoursesApiURL } from "@/lib/courses/get-url";

const BASE_URL = getCoursesApiURL();

// The verification code is the 12-hex-character string the certificate's QR
// code carries. The pattern stays a little wider than that on purpose — it
// only exists to keep obvious junk (and probes) away from the API, not to
// second-guess what the backend considers a code.
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}$/;

export type CertificateStatus = "valid" | "expired" | "revoked";

/**
 * One certificate as `GET /api/certificates/verify/{code}` describes it.
 *
 * The endpoint is public and deliberately minimal: the learner's name, the
 * course, the two dates and a status — nothing else about the learner exists
 * in the response, so nothing else can be shown here.
 */
export type Certificate = {
  /** The code that was looked up — the API doesn't echo it back. */
  code: string;
  learnerName: string;
  courseName: string;
  /** ISO timestamp. */
  issuedAt: string;
  /** ISO timestamp, or null when the certificate does not expire. */
  expiresAt: string | null;
  status: CertificateStatus;
  /**
   * Our own proxy for the backend's watermarked PDF rendering. Only set for a
   * currently-valid certificate: the preview endpoint 404s for an expired or
   * revoked one, so offering the link then would just be a broken button.
   */
  previewUrl: string | null;
};

export type CertificateLookup =
  | { state: "found"; certificate: Certificate }
  // The code is well-formed but no certificate carries it.
  | { state: "not-found" }
  // We couldn't ask, or couldn't understand the answer. Kept separate from
  // "not-found" on purpose: telling someone their certificate doesn't exist
  // because a server was down would be worse than telling them to retry.
  | { state: "unavailable" };

export function isValidVerificationCode(value: string) {
  return CODE_PATTERN.test(value);
}

export function certificateVerifyPath(code: string) {
  return `/api/certificates/verify/${encodeURIComponent(code)}`;
}

export async function verifyCertificate(
  code: string,
): Promise<CertificateLookup> {
  const trimmed = code.trim();
  if (!isValidVerificationCode(trimmed)) return { state: "not-found" };

  let response: Response;
  try {
    // Not `fetchAPI`: a verification lookup must never be served from a
    // cache — a revoked certificate has to stop verifying immediately.
    response = await fetch(new URL(certificateVerifyPath(trimmed), BASE_URL), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return { state: "unavailable" };
  }

  // The endpoint answers 200 for every code, including unknown ones — any
  // other status is the service failing, never a missing certificate.
  if (!response.ok) return { state: "unavailable" };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { state: "unavailable" };
  }

  const data = (payload as { data?: unknown } | null)?.data;
  if (!data || typeof data !== "object") return { state: "unavailable" };

  const certificate = toCertificate(trimmed, data as Record<string, unknown>);
  return certificate
    ? { state: "found", certificate }
    : // An unknown code comes back as `{ "valid": false }` and nothing else —
      // there is no learner or course to name, which is exactly a miss.
      { state: "not-found" };
}

function toCertificate(
  code: string,
  raw: Record<string, unknown>,
): Certificate | null {
  const learnerName = text(raw.learnerName);
  const courseName = text(raw.courseName);
  const issuedAt = text(raw.issuedAt);

  if (!learnerName || !courseName || !issuedAt) return null;

  const status = resolveStatus(raw);

  return {
    code,
    learnerName,
    courseName,
    issuedAt,
    expiresAt: text(raw.expiresAt),
    status,
    previewUrl:
      status === "valid"
        ? `/api/certificates/${encodeURIComponent(code)}/preview`
        : null,
  };
}

// `valid` is the field that decides, and `status` explains it: the API only
// ever sets `valid: true` for `status: "valid"`. Trusting `valid` first means
// a status string we don't recognise can never be rendered as a confirmed
// certificate.
function resolveStatus(raw: Record<string, unknown>): CertificateStatus {
  if (raw.valid === true) return "valid";
  return text(raw.status) === "revoked" ? "revoked" : "expired";
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}
