"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  CloudUpload,
  FileCheck2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Check } from "@/components/page-components/concepts/shared";
import { cn, formatPrice } from "@/lib/utils";
import { useCartHydrated, useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import type { Memberships } from "@/app/api/auth/memberships/route";
import {
  CheckoutHeader,
  ERROR_TEXT,
  FIELD,
  LABEL,
  LINK,
  Note,
  PAGE,
  PANEL,
  PANEL_TITLE,
  PillAction,
  RULE,
  SummaryTotal,
} from "../checkout-ui";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
// Stated on the dropzone, so it is enforced here rather than left for the
// upload to fail on later.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// A network-level failure (server unreachable, connection dropped, request
// blocked before it left the browser) rejects with a bare "Failed to
// fetch", which tells a buyer nothing and hides which step broke. Every
// call the submit makes goes through here so the message names the step
// instead.
async function fetchStep(url: string, init: RequestInit, step: string) {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(
      `Couldn't reach the server to ${step}. Check your connection and try again.`,
    );
  }
}

// Purchase orders are a separate, Stripe-free flow: no card, one PO
// reference + document for the whole request (the backend's company_po
// purchaseType is request-level, not per-item), landing as status:
// "pending" until an admin approves it — see the API reference's
// "company · purchase order" section. Reached from the Payment Method
// selector on /checkout, or the Enterprise tier's alternate CTA on /cart.
export default function PurchaseOrderPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const hydrated = useCartHydrated();
  const authUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const fetchAuthUser = useAuthStore((state) => state.fetchUser);

  const [companies, setCompanies] = useState<Memberships["companies"] | null>(
    null,
  );
  const [companiesError, setCompaniesError] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  useEffect(() => {
    if (authStatus !== "ready" || !authUser || companies !== null) return;
    fetch("/api/auth/memberships")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error();
        const list = (data.data as Memberships).companies;
        setCompanies(list);
        if (list.length === 1) setCompanyId(list[0].companyId);
      })
      .catch(() => setCompaniesError(true));
  }, [authStatus, authUser, companies]);

  // No guest checkout — same rule the backend enforces on every /checkout
  // call. /cart only ever links here once a buyer already has a company,
  // but this page is also directly reachable by URL, so it needs its own
  // gate rather than leaving an anonymous visitor staring at an empty,
  // permanently-disabled form with no explanation.
  const needsLogin = authStatus === "ready" && !authUser;
  const needsCompany =
    authStatus === "ready" &&
    Boolean(authUser) &&
    companies !== null &&
    companies.length === 0;
  const stillChecking =
    !needsLogin &&
    !needsCompany &&
    (authStatus !== "ready" ||
      (Boolean(authUser) && companies === null && !companiesError));

  const enterpriseItems = items.filter(
    (item) => item.purchaseType === "enterprise",
  );
  const total = enterpriseItems.reduce(
    (sum, item) => sum + item.course.price * item.quantity,
    0,
  );

  const canSubmit =
    !stillChecking &&
    !companiesError &&
    Boolean(companyId) &&
    reference.trim().length > 0 &&
    Boolean(file) &&
    enterpriseItems.length > 0;

  const selectFile = (chosen: File | null) => {
    if (!chosen) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setFile(null);
      setFileError("That file must be a PDF, JPG or PNG.");
      return;
    }
    if (chosen.size > MAX_FILE_BYTES) {
      setFile(null);
      setFileError("That file is over 10MB — please upload a smaller one.");
      return;
    }
    setFileError(null);
    setFile(chosen);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // One call, and it only ever talks to this app's own origin — the
      // signed-URL request and the upload itself both happen server-side
      // (see /api/checkout/po-document for why the browser can't do the
      // upload directly).
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadResponse = await fetchStep(
        "/api/checkout/po-document",
        { method: "POST", body: uploadForm },
        "upload the PO document",
      );
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error ?? "Could not upload the PO document.",
        );
      }
      const { publicUrl } = uploadData.data as { publicUrl: string };

      const orderResponse = await fetchStep(
        "/api/checkout/purchase-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: enterpriseItems.map((item) => ({
              slug: item.course.slug,
              quantity: item.quantity,
            })),
            companyId,
            purchaseOrderReference: reference.trim(),
            purchaseOrderDocumentUrl: publicUrl,
            couponCode:
              enterpriseItems.find((item) => item.couponCode)?.couponCode ??
              null,
          }),
        },
        "place the order",
      );
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.error ?? "Could not submit the order.");
      }

      for (const item of enterpriseItems) removeItem(item.course.slug);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hydrated) return <section className={PAGE} aria-busy="true" />;

  if (submitted) {
    return (
      <Shell>
        <Message
          done
          title="Purchase order submitted"
          body="Your order is pending approval. We'll be in touch once it's reviewed."
          action={<PillAction href="/courses">Continue browsing</PillAction>}
        />
      </Shell>
    );
  }

  if (enterpriseItems.length === 0) {
    return (
      <Shell>
        <Message
          title="Nothing to put on a purchase order"
          body="Purchase orders cover Enterprise-plan items, and there aren't any in your cart."
          action={<PillAction href="/courses">Browse courses</PillAction>}
        />
      </Shell>
    );
  }

  if (needsLogin) {
    return (
      <Shell>
        <Message
          title="Log in required"
          body="Paying by purchase order requires a company account. Log in to continue."
          action={
            <PillAction href="/login?redirect=/checkout/purchase-order">
              Log in
            </PillAction>
          }
        />
      </Shell>
    );
  }

  if (needsCompany) {
    return (
      <Shell>
        <Message
          title="Company account required"
          body="Paying by purchase order requires a company account. Create one to continue."
          action={<PillAction href="/account">Create a company</PillAction>}
        />
      </Shell>
    );
  }

  // Hidden when there's nothing to choose — the single company is already
  // selected, and a one-option dropdown is just a question with one answer.
  const showCompanyPicker = companiesError || (companies?.length ?? 0) > 1;

  return (
    <Shell>
      <CheckoutHeader
        step="Payment"
        title="Purchase order"
        aside={
          <Link href="/checkout" className={LINK}>
            Back to checkout
          </Link>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
        {/* The purchase order itself */}
        <div className={cn(PANEL, "flex flex-col gap-8")}>
          <div className="flex flex-col gap-4">
            <h2 className={PANEL_TITLE}>Purchase order details</h2>
            <div className="flex items-start gap-3 rounded-[14px] bg-[#1ee9b5]/15 px-4 py-3.5">
              <Info
                className="mt-0.5 size-4 shrink-0 text-[#0c7a5e]"
                aria-hidden="true"
              />
              <p className="m-0 type-small text-[#06180b]/80">
                Both a reference number and a document are required — the
                number is what finance matches against your PO, the document
                is what they review.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {showCompanyPicker && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="po-company" className={LABEL}>
                  Company <Required />
                </label>
                <div className="group relative">
                  <select
                    id="po-company"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    disabled={stillChecking || companiesError}
                    className={cn(
                      FIELD,
                      "cursor-pointer appearance-none pr-11 disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <option value="" disabled>
                      {stillChecking
                        ? "Checking your companies…"
                        : "Select a company"}
                    </option>
                    {(companies ?? []).map((company) => (
                      <option key={company.companyId} value={company.companyId}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#06180b]/60 transition-colors group-focus-within:text-[#0c7a5e]"
                    aria-hidden="true"
                  />
                </div>
                {companiesError && (
                  <p className={ERROR_TEXT}>
                    Couldn&apos;t load your companies. Please refresh and try
                    again.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="po-reference" className={LABEL}>
                PO reference number <Required />
              </label>
              <input
                id="po-reference"
                type="text"
                autoComplete="off"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-2026-0042"
                className={FIELD}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span id="po-file-label" className={LABEL}>
                PO document <Required />
              </span>
              <input
                id="po-file"
                type="file"
                aria-labelledby="po-file-label"
                aria-describedby={fileError ? "po-file-error" : undefined}
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
                className="peer sr-only"
              />
              <label
                htmlFor="po-file"
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-[16px] border px-5 py-6 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0c7a5e]",
                  file
                    ? "border-[#0c7a5e] bg-[#1ee9b5]/10"
                    : "border-dashed border-[#06180b]/25 bg-white hover:border-[#0c7a5e] hover:bg-[#1ee9b5]/[0.06]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full",
                    file
                      ? "bg-[#06180b] text-[#1ee9b5]"
                      : "bg-[#06180b]/[0.06] text-[#06180b]/70",
                  )}
                >
                  {file ? (
                    <FileCheck2 className="size-5" />
                  ) : (
                    <CloudUpload className="size-5" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate type-small font-medium text-[#06180b]">
                    {file ? file.name : "Choose a file to upload"}
                  </span>
                  <span className="type-caption text-[#06180b]/65">
                    {file
                      ? "Choose again to replace it"
                      : "PDF, JPG or PNG · up to 10MB"}
                  </span>
                </span>
              </label>
              {fileError && (
                <p id="po-file-error" className={ERROR_TEXT}>
                  {fileError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {/* Says which of the two required things is still missing,
                  rather than only greying the button out. */}
              {!canSubmit && !stillChecking && (
                <Note>
                  {!companyId
                    ? "Select the company this purchase order is for to continue."
                    : !reference.trim()
                      ? "Provide a PO reference number and upload a PO document to continue."
                      : "Upload a PO document to continue."}
                </Note>
              )}

              {error && <Note tone="error">{error}</Note>}

              <PillAction type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Placing order…" : "Place purchase order"}
              </PillAction>

              <p className="m-0 flex items-center justify-center gap-2 type-caption text-[#06180b]/65">
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                Seats are reserved until finance approves your PO.
              </p>
            </div>
          </form>
        </div>

        {/* What is being ordered */}
        <aside
          aria-labelledby="po-summary-title"
          className={cn(PANEL, "flex flex-col gap-6 lg:sticky")}
          style={{ top: "calc(var(--navbar-height, var(--home-nav-h)) + 24px)" }}
        >
          <h2 id="po-summary-title" className={PANEL_TITLE}>
            Order summary
          </h2>

          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {enterpriseItems.map((item) => (
              <li key={item.course.slug} className="flex items-start gap-3">
                <span className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#06180b]/10">
                  {item.course.thumbnailImage && (
                    <Image
                      alt=""
                      src={item.course.thumbnailImage}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="m-0 type-small font-medium">
                    {item.course.title}
                  </p>
                  <p className="m-0 type-caption text-[#06180b]/65 tabular-nums">
                    Enterprise plan · {item.quantity} seats
                  </p>
                </div>
                <p className="m-0 shrink-0 whitespace-nowrap type-small tabular-nums">
                  {formatPrice(item.course.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className={RULE} />
          <SummaryTotal label="Total due" value={formatPrice(total)} />
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className={PAGE}>
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:gap-12">
        {children}
      </div>
    </section>
  );
}

function Required() {
  return (
    <>
      <span aria-hidden="true" className="text-[#b42318]">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  );
}

function Message({
  title,
  body,
  action,
  done = false,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
  done?: boolean;
}) {
  return (
    <div className={cn(PANEL, "flex max-w-[640px] flex-col items-start gap-6 sm:p-10")}>
      {done && (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]"
        >
          <Check size={18} />
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">
          {title}
        </h1>
        <p className="m-0 type-body text-[#06180b]/70">{body}</p>
      </div>
      <div className="w-full sm:w-auto sm:min-w-[280px]">{action}</div>
    </div>
  );
}
