import { isValidPhoneNumber } from "libphonenumber-js/min";

// Numbers typed without a country code are read as UK numbers — the support
// team is UK-based and the field's placeholder is "+44".
export const DEFAULT_PHONE_COUNTRY = "GB";

export const PHONE_INVALID =
  "Enter a valid phone number. For numbers outside the UK, start with the country code, like +880 1712 345678.";

// The "min" metadata keeps this light enough for the browser: it checks each
// country's number lengths and leading digits. The server re-checks with the
// full metadata (src/lib/resend/contact.ts).
export function phoneProblem(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter a phone number.";
  if (!isValidPhoneNumber(v, DEFAULT_PHONE_COUNTRY)) return PHONE_INVALID;
  return null;
}
