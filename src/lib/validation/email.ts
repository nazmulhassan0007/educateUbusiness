// Email checks that are safe to run in the browser. The forms use these for
// instant feedback; the API routes run the same checks again, then the
// server-only ones in ./email-server.ts (disposable domains, DNS).

// RFC 5321 limits: 64 characters before the @, 254 in total.
const MAX_LOCAL = 64;
const MAX_TOTAL = 254;

// Stricter than "something@something.something": no spaces, no leading,
// trailing or doubled dots, hostname labels that can't start or end with a
// hyphen, and a letters-only TLD. Quoted local parts and IP-literal domains
// are valid per the RFC but never typed into a real sign-up form.
const EMAIL_RE =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/** Trimmed, with the domain lower-cased (the part before the @ is left as typed). */
export function normaliseEmail(value: string): string {
  const v = value.trim();
  const at = v.lastIndexOf("@");
  return at === -1 ? v : v.slice(0, at + 1) + v.slice(at + 1).toLowerCase();
}

export function emailProblem(value: string): string | null {
  const v = normaliseEmail(value);
  if (!v) return "Enter your email address.";
  const at = v.lastIndexOf("@");
  if (!EMAIL_RE.test(v) || at > MAX_LOCAL || v.length > MAX_TOTAL) {
    return "Enter a valid email address, like name@company.co.uk.";
  }
  return null;
}

// Where most typos are aimed. A suggestion is only a hint ("Did you mean…?"),
// never a reason to reject, so a real domain that happens to sit close to
// one of these still goes through.
const COMMON_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "live.co.uk",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "btinternet.com",
  "sky.com",
];

// Optimal string alignment distance: Levenshtein plus swapped neighbours,
// so "gmial" is one edit from "gmail", not two.
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** The address with its domain corrected, if it looks like a typo of a common one (gmial.com → gmail.com). */
export function suggestEmail(value: string): string | null {
  const v = normaliseEmail(value);
  if (emailProblem(v)) return null;
  const at = v.lastIndexOf("@");
  const domain = v.slice(at + 1);
  if (COMMON_DOMAINS.includes(domain)) return null;

  let best: string | null = null;
  let bestDistance = Infinity;
  for (const candidate of COMMON_DOMAINS) {
    const d = distance(domain, candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  // One slip for short domains, two for longer ones — any further and it's
  // more likely a different domain than a typo.
  const allowed = domain.length >= 9 ? 2 : 1;
  return best && bestDistance <= allowed ? v.slice(0, at + 1) + best : null;
}
