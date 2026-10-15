import { resolve4, resolve6, resolveMx } from "node:dns/promises";
import MailChecker from "mailchecker";
import { emailProblem, normaliseEmail } from "./email";

// Server-only email checks, run after the shared syntax check. Together they
// catch most undeliverable addresses without a confirmation email: throwaway
// inboxes, and domains that don't exist or can't receive mail.

const DISPOSABLE = MailChecker.blacklist();

function isDisposable(domain: string): boolean {
  // Also catches subdomains, e.g. anything.mailinator.com.
  const labels = domain.split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    if (DISPOSABLE.has(labels.slice(i).join("."))) return true;
  }
  return false;
}

const DNS_TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const domainCache = new Map<string, { ok: boolean; at: number }>();

class DnsTimeout extends Error {}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new DnsTimeout()), DNS_TIMEOUT_MS)),
  ]);
}

// "No such domain" or "no records of this type" — a definite answer, unlike
// a timeout or a resolver failure.
function isNoRecords(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}

/**
 * Whether the domain can receive mail: it has MX records, or (RFC 5321's
 * fallback when there are none) an A/AAAA record. A "null MX" (RFC 7505)
 * means the domain explicitly accepts no mail.
 *
 * Returns null when DNS itself couldn't answer in time — that says nothing
 * about the address, so the caller lets it through rather than turn a slow
 * resolver into a rejected sign-up.
 */
async function domainAcceptsMail(domain: string): Promise<boolean | null> {
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.ok;

  let ok: boolean;
  try {
    const mx = await withTimeout(resolveMx(domain));
    ok = mx.some((r) => r.exchange !== "" && r.exchange !== ".");
  } catch (error) {
    if (!isNoRecords(error)) {
      console.warn(`[email] MX lookup for ${domain} failed; allowing the address.`, error);
      return null;
    }
    const lookups = await Promise.allSettled([withTimeout(resolve4(domain)), withTimeout(resolve6(domain))]);
    if (lookups.some((l) => l.status === "fulfilled" && l.value.length > 0)) {
      ok = true;
    } else if (lookups.every((l) => l.status === "rejected" && isNoRecords(l.reason))) {
      ok = false;
    } else {
      return null;
    }
  }

  domainCache.set(domain, { ok, at: Date.now() });
  return ok;
}

/** The shared syntax check, plus disposable-domain and DNS checks. Null when the address looks deliverable. */
export async function deliverableEmailProblem(value: string): Promise<string | null> {
  const syntax = emailProblem(value);
  if (syntax) return syntax;

  const email = normaliseEmail(value);
  const domain = email.slice(email.lastIndexOf("@") + 1);

  if (isDisposable(domain)) {
    return "Temporary email addresses aren't accepted. Please use your own email address.";
  }
  if ((await domainAcceptsMail(domain)) === false) {
    return `${domain} can't receive email. Check the address for typos.`;
  }
  return null;
}
