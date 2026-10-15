import { redirect } from "next/navigation";
import type { Memberships } from "@/app/api/auth/memberships/route";
import { LINK, Note, PAGE, PANEL, PANEL_TITLE, PillAction, RULE } from "@/app/checkout/checkout-ui";
import { authApi } from "@/lib/auth/backend";
import { getAuthToken, type AuthUser } from "@/lib/auth/server";
import { PORTAL_URL } from "@/lib/portal";
import { cn, humanize } from "@/lib/utils";

type Company = Memberships["companies"][number];

// /auth/me is typed with the four fields every account has; anything else the
// backend sends about the person is shown too, under its own name. Fields
// already shown, and anything credential-like, are left out.
const SHOWN = new Set(["id", "email", "first_name", "last_name"]);
const PRIVATE = /pass|token|hash|secret|otp|salt/i;
// Database ids ("role_id", "companyId") mean nothing to the person reading.
const INTERNAL_ID = /(_id|Id)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

function formatValue(value: unknown): string | null {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value !== "string" || !value.trim()) return null;
  if (ISO_DATE.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
  }
  return value;
}

function initials(name: string, email: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0] ?? email).slice(0, 2).toUpperCase();
}

const STATUS_TONES = {
  good: "bg-[#1ee9b5]/25 text-[#0a5c46]",
  waiting: "bg-[#f5a524]/20 text-[#7a4a00]",
  stopped: "bg-[#b42318]/[0.08] text-[#b42318]",
  neutral: "bg-[#06180b]/[0.06] text-[#06180b]/75",
} as const;

function statusTone(status: string): keyof typeof STATUS_TONES {
  if (/^(active|approved|accepted|verified)$/i.test(status)) return "good";
  if (/pending|invited|review|awaiting/i.test(status)) return "waiting";
  if (/suspend|inactive|disabled|rejected|revoked|removed/i.test(status)) return "stopped";
  return "neutral";
}

function CompanyRow({ company }: { company: Company }) {
  const role = humanize(company.roleName);
  // The role usually says "admin" already ("Company admin"); only a role that
  // doesn't gets the extra mark.
  const showAdmin = company.isCompanyAdmin && !/admin/i.test(company.roleName);
  const tone = statusTone(company.status);

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#06180b] font-title type-small font-medium text-[#1ee9b5]"
        >
          {company.companyName.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="m-0 break-words type-lead font-medium">{company.companyName}</p>
          <p className="m-0 type-small text-[#06180b]/70">
            {role}
            {showAdmin && " · Admin"}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 type-caption font-medium",
          STATUS_TONES[tone],
        )}
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {humanize(company.status)}
      </span>
    </li>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
      <dt className="type-caption font-medium text-[#06180b]/60">{label}</dt>
      <dd className="m-0 break-words type-body">{children}</dd>
    </div>
  );
}

/**
 * The signed-in person's page: who they are, on the right, and the companies
 * they belong to — the main thing they come here to check. Companies are
 * created at checkout, where an Enterprise purchase needs one, so this page
 * only shows them. Same light world as the cart and checkout.
 */
export default async function AccountPage() {
  const token = await getAuthToken();
  if (!token) redirect("/login?redirect=/account");

  const [me, memberships] = await Promise.all([
    authApi<AuthUser & Record<string, unknown>>("/api/auth/me", { method: "GET", token }),
    authApi<Memberships>("/api/auth/memberships", { method: "GET", token }),
  ]);
  if (!me.ok) redirect("/login?redirect=/account");

  const user = me.data;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const extras = Object.entries(user)
    .filter(([key]) => !SHOWN.has(key) && !PRIVATE.test(key) && !INTERNAL_ID.test(key))
    .map(([key, value]) => [
      humanize(key),
      key === "role" && typeof value === "string" ? humanize(value) : formatValue(value),
    ] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null);

  const companies = memberships.ok ? memberships.data.companies : [];
  const portal = memberships.ok ? memberships.data.individual?.portal : null;

  return (
    <section className={PAGE}>
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:gap-12">
        <header className="flex items-center gap-5 sm:gap-6">
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full bg-[#06180b] font-title type-h4 font-medium text-[#1ee9b5] sm:size-20"
          >
            {initials(fullName, user.email)}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="m-0 break-words font-title type-h1 font-normal tracking-[-0.03em]">
              {fullName || "My account"}
            </h1>
            <p className="m-0 break-all type-body text-[#06180b]/70">{user.email}</p>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
          <section aria-labelledby="account-companies" className={cn(PANEL, "flex flex-col gap-6")}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id="account-companies" className={PANEL_TITLE}>
                Your companies
              </h2>
              {companies.length > 0 && (
                <span className="type-small tabular-nums text-[#06180b]/65">
                  {companies.length} {companies.length === 1 ? "company" : "companies"}
                </span>
              )}
            </div>

            {!memberships.ok ? (
              <Note tone="error">
                We couldn&apos;t load your companies just now.{" "}
                <a href="/account" className="underline underline-offset-[3px]">
                  Refresh the page
                </a>{" "}
                to try again.
              </Note>
            ) : companies.length > 0 ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-[#06180b]/12 p-0">
                {companies.map((company) => (
                  <CompanyRow key={company.companyId} company={company} />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-6 py-2">
                <div className="flex max-w-[56ch] flex-col gap-2">
                  <p className="m-0 type-lead font-medium">You&apos;re not part of a company yet.</p>
                  <p className="m-0 type-body text-[#06180b]/70">
                    A company lets you buy an Enterprise plan (6 seats or more) and give the
                    licences to your team. When you buy one, you&apos;ll name your company at
                    checkout and become its admin.
                  </p>
                </div>
                <PillAction href="/courses" className="sm:w-auto sm:min-w-[280px]">
                  Browse courses
                </PillAction>
              </div>
            )}
          </section>

          <aside aria-labelledby="account-profile" className={cn(PANEL, "flex flex-col gap-6")}>
            <h2 id="account-profile" className={PANEL_TITLE}>
              Profile
            </h2>
            <dl className="m-0 flex flex-col divide-y divide-[#06180b]/12">
              <DetailRow label="Full name">
                {fullName || <span className="text-[#06180b]/60">Not given</span>}
              </DetailRow>
              <DetailRow label="Email">{user.email}</DetailRow>
              {portal && (
                <DetailRow label="Personal portal">
                  {/^https?:\/\//.test(portal) ? (
                    <a href={portal} target="_blank" rel="noopener noreferrer" className={cn(LINK, "type-body break-all")}>
                      {portal}
                    </a>
                  ) : (
                    humanize(portal)
                  )}
                </DetailRow>
              )}
              {extras.map(([label, value]) => (
                <DetailRow key={label} label={label}>
                  {value}
                </DetailRow>
              ))}
            </dl>
            <div className={RULE} />
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className={cn(LINK, "self-start")}>
              Open the learning portal
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
