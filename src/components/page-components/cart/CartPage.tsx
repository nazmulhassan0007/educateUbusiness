"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoTrashOutline } from "react-icons/io5";
import { ChevronDown } from "lucide-react";
import QuantityStepper from "@/components/shared/QuantityStepper";
import { cn, formatPrice } from "@/lib/utils";
import {
  getCartTotal,
  useCartHydrated,
  useCartStore,
  type CartItem,
} from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import type { Memberships } from "@/app/api/auth/memberships/route";
import {
  CheckoutHeader,
  FIELD,
  LABEL,
  LINK,
  Note,
  PAGE,
  PANEL,
  PANEL_TITLE,
  PillAction,
  RULE,
  SummaryRow,
  SummaryTotal,
} from "@/app/checkout/checkout-ui";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateCompanyId = useCartStore((state) => state.updateCompanyId);
  const hydrated = useCartHydrated();

  const showItems = hydrated && items.length > 0;
  const total = getCartTotal(items);

  // The Enterprise plan maps to the backend's company-owned purchase types
  // (company_card/company_po), which require a real companyId — so before
  // letting the buyer proceed, confirm they actually have a company to buy
  // it under.
  const hasEnterpriseItem = items.some(
    (item) => item.purchaseType === "enterprise",
  );
  const authUser = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const fetchAuthUser = useAuthStore((state) => state.fetchUser);
  const [companies, setCompanies] = useState<Memberships["companies"] | null>(
    null,
  );
  const [companiesError, setCompaniesError] = useState(false);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  useEffect(() => {
    if (
      !hasEnterpriseItem ||
      authStatus !== "ready" ||
      !authUser ||
      companies !== null
    ) {
      return;
    }
    fetch("/api/auth/memberships")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error();
        setCompanies((data.data as Memberships).companies);
      })
      .catch(() => setCompaniesError(true));
  }, [hasEnterpriseItem, authStatus, authUser, companies]);

  const needsLogin = hasEnterpriseItem && authStatus === "ready" && !authUser;
  const needsCompany =
    hasEnterpriseItem &&
    authStatus === "ready" &&
    Boolean(authUser) &&
    companies !== null &&
    companies.length === 0;
  const stillChecking =
    hasEnterpriseItem &&
    !needsLogin &&
    !needsCompany &&
    (authStatus !== "ready" || (Boolean(authUser) && companies === null && !companiesError));

  const enterpriseItems = items.filter(
    (item) => item.purchaseType === "enterprise",
  );

  // Auto-assign the buyer's only company so they're not forced to pick from
  // a list of one. With multiple companies, `updateCompanyId` only runs
  // from the picker below — the buyer must choose explicitly.
  useEffect(() => {
    if (!companies || companies.length !== 1) return;
    const [onlyCompany] = companies;
    for (const item of enterpriseItems) {
      if (!item.companyId) updateCompanyId(item.course.slug, onlyCompany.companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, items]);

  const needsCompanySelection =
    !needsLogin &&
    !needsCompany &&
    companies !== null &&
    companies.length > 1 &&
    enterpriseItems.some((item) => !item.companyId);

  // Fails closed on a network/backend hiccup rather than silently letting
  // an unverified Enterprise purchase through.
  const checkoutBlocked =
    needsLogin ||
    needsCompany ||
    stillChecking ||
    companiesError ||
    needsCompanySelection;

  const seatCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const savings = total.originalPrice - total.price;

  return (
    <section className={PAGE}>
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:gap-12">
        <CheckoutHeader
          step="Cart"
          title="Your cart"
          aside={
            showItems && (
              <p className="m-0 type-body text-[#06180b]/70 tabular-nums">
                {items.length} {items.length === 1 ? "course" : "courses"} ·{" "}
                {seatCount} {seatCount === 1 ? "seat" : "seats"}
              </p>
            )
          }
        />

        {!hydrated ? (
          <div aria-busy="true" className="min-h-[40svh]" />
        ) : !showItems ? (
          <div className={cn(PANEL, "flex flex-col items-start gap-6 sm:p-10")}>
            <div className="flex flex-col gap-2">
              <h2 className={PANEL_TITLE}>Your cart is empty.</h2>
              <p className="m-0 type-body text-[#06180b]/70">
                Courses you add will wait here until you check out.
              </p>
            </div>
            <PillAction href="/courses" className="sm:w-auto sm:min-w-[280px]">
              Browse courses
            </PillAction>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
            <ul
              aria-label="Courses in your cart"
              className={cn(PANEL, "m-0 list-none py-1 sm:py-2")}
            >
              {items.map((item) => (
                <li
                  key={item.course.slug}
                  className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-4 border-t border-[#06180b]/12 py-6 first:border-t-0 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-x-6"
                >
                  <Link
                    href={itemHref(item)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="group relative aspect-[4/3] w-full self-start overflow-hidden isolate rounded-[14px] bg-[#06180b]/10 sm:row-span-2"
                  >
                    <Image
                      alt=""
                      src={
                        item.course.thumbnailImage ||
                        "/courses/course-photo.jpeg"
                      }
                      fill
                      sizes="(min-width: 540px) 144px, 80px"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col items-start gap-2">
                        <span className="rounded-full bg-[#1ee9b5]/25 px-2.5 py-1 type-caption font-medium uppercase tracking-[0.06em] text-[#0c7a5e]">
                          CPD certified
                        </span>
                        <Link
                          href={itemHref(item)}
                          className="font-title type-h4 font-medium tracking-[-0.02em] text-[#06180b] transition-colors hover:text-[#0c7a5e] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                        >
                          {item.course.title}
                        </Link>
                        <p className="m-0 type-small text-[#06180b]/70">
                          <span className="capitalize">{item.purchaseType}</span>{" "}
                          plan
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.course.title} from your cart`}
                        onClick={() => removeItem(item.course.slug)}
                        className="-mr-2 -mt-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#06180b]/60 transition-colors hover:bg-[#b42318]/10 hover:text-[#b42318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                      >
                        <IoTrashOutline className="size-[18px]" />
                      </button>
                  </div>

                  <div className="col-span-2 flex min-w-0 flex-col gap-4 sm:col-span-1 sm:col-start-2">

                    {item.purchaseType === "enterprise" &&
                      companies &&
                      companies.length > 1 && (
                        <label className="flex flex-col gap-1.5">
                          <span className={LABEL}>Buying for</span>
                          <span className="group relative">
                            <select
                              value={item.companyId ?? ""}
                              onChange={(e) =>
                                updateCompanyId(
                                  item.course.slug,
                                  e.target.value,
                                )
                              }
                              className={cn(
                                FIELD,
                                "cursor-pointer appearance-none pr-11",
                              )}
                            >
                              <option value="" disabled>
                                Select a company for this purchase
                              </option>
                              {companies.map((company) => (
                                <option
                                  key={company.companyId}
                                  value={company.companyId}
                                >
                                  {company.companyName}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#06180b]/60 transition-colors group-focus-within:text-[#0c7a5e]"
                              aria-hidden="true"
                            />
                          </span>
                        </label>
                      )}

                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                      <div className="flex items-center gap-3 rounded-full border border-[#06180b]/12 py-1 pl-4 pr-1">
                        <span className="type-small text-[#06180b]/70">
                          Seats
                        </span>
                        <QuantityStepper
                          variant="light"
                          value={item.quantity}
                          onChange={(quantity) =>
                            updateQuantity(item.course.slug, quantity)
                          }
                        />
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <p className="m-0 flex items-baseline gap-2 whitespace-nowrap">
                          {item.course.originalPrice && (
                            <span className="type-small text-[#06180b]/50 line-through tabular-nums">
                              {formatPrice(
                                item.course.originalPrice * item.quantity,
                              )}
                            </span>
                          )}
                          <span className="font-title type-h4 tracking-[-0.02em] tabular-nums">
                            {formatPrice(item.course.price * item.quantity)}
                          </span>
                        </p>
                        {item.quantity > 1 && (
                          <span className="type-caption text-[#06180b]/60 tabular-nums">
                            {formatPrice(item.course.price)} per seat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside
              aria-labelledby="cart-summary-title"
              className={cn(PANEL, "flex flex-col gap-6 lg:sticky")}
              style={{ top: "calc(var(--navbar-height, var(--home-nav-h)) + 24px)" }}
            >
              <h2 id="cart-summary-title" className={PANEL_TITLE}>
                Order summary
              </h2>
              <div className="flex flex-col gap-3">
                <SummaryRow
                  label={`Subtotal (${seatCount} ${seatCount === 1 ? "seat" : "seats"})`}
                  value={formatPrice(total.originalPrice)}
                />
                {savings > 0 && (
                  <SummaryRow
                    tone="saving"
                    label="Savings"
                    value={`−${formatPrice(savings)}`}
                  />
                )}
              </div>
              <div className={RULE} />
              <SummaryTotal value={formatPrice(total.price)} />

              <div className="flex flex-col gap-3">
                {needsLogin ? (
                  <>
                    <Note>The Enterprise plan requires an account.</Note>
                    <PillAction href="/login?redirect=/cart">
                      Log in to continue
                    </PillAction>
                  </>
                ) : needsCompany ? (
                  <>
                    <Note>
                      The Enterprise plan is bought for a company. You&apos;ll
                      name yours at checkout.
                    </Note>
                    <PillAction href="/checkout">Proceed to checkout</PillAction>
                  </>
                ) : companiesError ? (
                  <Note tone="error">
                    Couldn&apos;t verify your company eligibility for the
                    Enterprise plan. Please refresh and try again.
                  </Note>
                ) : needsCompanySelection ? (
                  <Note>
                    Select which company each Enterprise item is for, above.
                  </Note>
                ) : (
                  <PillAction href="/checkout" disabled={checkoutBlocked}>
                    {checkoutBlocked
                      ? "Checking eligibility…"
                      : "Proceed to checkout"}
                  </PillAction>
                )}
                {hasEnterpriseItem && !needsLogin && !needsCompany && (
                  <PillAction tone="outline" href="/checkout/purchase-order">
                    Pay by purchase order instead
                  </PillAction>
                )}
              </div>

              <Link href="/courses" className={cn(LINK, "self-center")}>
                Continue browsing courses
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

const itemHref = (item: CartItem) =>
  `/${item.course.kind === "bundle" ? "bundles" : "courses"}/${item.course.slug}`;
