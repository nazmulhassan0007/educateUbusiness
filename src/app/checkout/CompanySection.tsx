"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Memberships } from "@/app/api/auth/memberships/route";
import { Plus } from "@/components/page-components/concepts/shared";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ERROR_TEXT, FIELD, FIELD_ERROR, LABEL, LINK, Note, PANEL_TITLE, PillAction } from "./checkout-ui";

type Company = Memberships["companies"][number];

async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch("/api/auth/memberships");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return (data.data as Memberships).companies;
}

/**
 * The company an Enterprise purchase is made for. Enterprise licences go into
 * a company's seat pool, so the order needs one: a buyer with no company
 * names one here (and becomes its admin), a buyer with several picks one, and
 * a buyer with one sees it filled in. Renders nothing for carts with no
 * Enterprise item.
 */
export default function CompanySection({ email }: { email: string | null }) {
  const items = useCartStore((state) => state.items);
  const updateCompanyId = useCartStore((state) => state.updateCompanyId);
  const enterpriseItems = items.filter((item) => item.purchaseType === "enterprise");
  const hasEnterprise = enterpriseItems.length > 0;

  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignAll = useCallback(
    (companyId: string) => {
      for (const item of useCartStore.getState().items) {
        if (item.purchaseType === "enterprise") updateCompanyId(item.course.slug, companyId);
      }
    },
    [updateCompanyId],
  );

  const loadCompanies = useCallback(
    () =>
      fetchCompanies().then((list) => {
        setCompanies(list);
        setLoadError(false);
        return list;
      }),
    [],
  );

  useEffect(() => {
    if (!hasEnterprise || !email || companies !== null) return;
    fetchCompanies()
      .then(setCompanies)
      .catch(() => setLoadError(true));
  }, [hasEnterprise, email, companies]);

  // One company: use it, so the buyer isn't asked to pick from a list of one.
  useEffect(() => {
    if (companies?.length !== 1) return;
    const [only] = companies;
    for (const item of enterpriseItems) {
      if (!item.companyId) updateCompanyId(item.course.slug, only.companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, items]);

  if (!hasEnterprise) return null;

  const heading = (
    <div className="flex flex-col gap-1.5">
      <h2 className={PANEL_TITLE}>Your company</h2>
      <p className="m-0 type-small text-[#06180b]/70">
        Enterprise licences go to a company, so its admin can give them to the team.
      </p>
    </div>
  );

  if (!email) {
    return (
      <div className="flex flex-col gap-5">
        {heading}
        <Note>
          <Link href="/login?redirect=/checkout" className="font-medium underline underline-offset-[3px]">
            Log in
          </Link>{" "}
          to choose or create the company for this order.
        </Note>
      </div>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = companyName.trim();
    if (!name) {
      setCreateError("Enter your company's name.");
      return;
    }
    setCreateError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: name, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCreateError(data.errors?.[0] ?? data.error ?? "We couldn't create the company. Please try again.");
        return;
      }
      // The new company becomes the one this order is for. The create
      // response may not carry its id, so it is found by name in the fresh list.
      const list = await loadCompanies();
      const created =
        list.find((c) => c.companyId === data.data?.companyId) ??
        [...list].reverse().find((c) => c.companyName.trim().toLowerCase() === name.toLowerCase());
      if (created) assignAll(created.companyId);
      setCompanyName("");
      setAdding(false);
    } catch {
      setCreateError("We couldn't reach the server. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const form = (
    <form onSubmit={handleCreate} noValidate className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>Company name</span>
        <input
          type="text"
          name="organization"
          autoComplete="organization"
          placeholder="e.g. Northwind Ltd"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          aria-invalid={Boolean(createError)}
          aria-describedby={createError ? "company-name-error" : "company-name-hint"}
          className={cn(FIELD, createError && FIELD_ERROR)}
        />
        {createError ? (
          <p id="company-name-error" className={ERROR_TEXT}>
            {createError}
          </p>
        ) : (
          <p id="company-name-hint" className="m-0 type-caption text-[#06180b]/65">
            You&apos;ll be its admin. You can see it any time on your account page.
          </p>
        )}
      </label>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
        <PillAction type="submit" tone="ink" disabled={isSubmitting} icon={<Plus />} className="sm:w-auto sm:min-w-[260px]">
          {isSubmitting ? "Creating company…" : "Create company"}
        </PillAction>
        {companies && companies.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setCreateError(null);
            }}
            className={LINK}
          >
            Use an existing company
          </button>
        )}
      </div>
    </form>
  );

  // The company every Enterprise line is set to, when they agree.
  const chosenIds = new Set(enterpriseItems.map((item) => item.companyId ?? ""));
  const chosenId = chosenIds.size === 1 ? [...chosenIds][0] : "";

  return (
    <div className="flex flex-col gap-5">
      {heading}
      {loadError ? (
        <div className="flex flex-col items-start gap-2">
          <Note tone="error">We couldn&apos;t load your companies.</Note>
          <button type="button" onClick={() => loadCompanies().catch(() => setLoadError(true))} className={LINK}>
            Try again
          </button>
        </div>
      ) : companies === null ? (
        <p aria-live="polite" className="m-0 type-small text-[#06180b]/65">
          Checking your companies…
        </p>
      ) : companies.length === 0 || adding ? (
        form
      ) : (
        <div className="flex flex-col items-start gap-3">
          {companies.length === 1 ? (
            <p className="m-0 type-body">
              This order is for <span className="font-medium">{companies[0].companyName}</span>.
            </p>
          ) : (
            <label className="flex w-full flex-col gap-1.5">
              <span className={LABEL}>Company this order is for</span>
              <select
                value={chosenId}
                onChange={(e) => e.target.value && assignAll(e.target.value)}
                className={cn(FIELD, "cursor-pointer")}
              >
                <option value="" disabled>
                  Choose a company
                </option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={() => setAdding(true)} className={LINK}>
            Create a new company instead
          </button>
        </div>
      )}
    </div>
  );
}
