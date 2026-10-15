"use client";

import Image from "next/image";
import Link from "next/link";
import { IoTrashOutline } from "react-icons/io5";
import QuantityStepper from "@/components/shared/QuantityStepper";
import { cn, formatPrice } from "@/lib/utils";
import {
  getCartTotal,
  useCartHydrated,
  useCartStore,
  type CartItem,
  type PurchaseType,
} from "@/store/cart-store";

const PLAN_OPTIONS: { id: PurchaseType; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "group", label: "Group" },
  { id: "enterprise", label: "Enterprise" },
];

const itemHref = (item: CartItem) =>
  `/${item.course.kind === "bundle" ? "bundles" : "courses"}/${item.course.slug}`;

export default function CartDropdown() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updatePurchaseType = useCartStore((state) => state.updatePurchaseType);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const hydrated = useCartHydrated();

  const showItems = hydrated && items.length > 0;
  const total = getCartTotal(items);

  return (
    // Full width of its slot below md (the navbar sizes it), a fixed card
    // from md up. Capped at the viewport under the bar, so on short screens
    // only the item list scrolls and the total and button stay in reach.
    <div className="flex max-h-[calc(100dvh-var(--navbar-height,84px)-24px)] w-full flex-col rounded-[20px] bg-primary-900 p-4 sm:py-[21px] sm:pl-[22px] sm:pr-[21px] md:w-[389px]">
      {!showItems ? (
        <p className="py-6 text-center type-small text-on-dark/70">
          Your cart is empty
        </p>
      ) : (
        <div className="flex min-h-0 flex-col items-start gap-6 sm:gap-8 md:gap-12">
          <div className="flex min-h-0 w-full flex-col items-start gap-6">
            <div className="flex min-h-0 w-full flex-col items-start gap-5">
              <p className="shrink-0 font-title type-small text-on-dark">
                You&rsquo;re selected{" "}
                <span className="font-bold text-primary-500">
                  {items.length} course{items.length > 1 ? "s" : ""}
                </span>
              </p>
              <div className="h-px w-full shrink-0 bg-white/9" />

              {/* `data-lenis-prevent` hands wheel/touch scrolling inside this
                  list back to the browser — otherwise the page's smooth
                  scroll (SmoothScroll.tsx) swallows it and scrolls the page
                  behind the dropdown instead. `overscroll-contain` stops the
                  scroll chaining to the page once the list hits its end. */}
              <div
                data-lenis-prevent
                className="scrollbar-thin scrollbar-thumb-primary-500/50 scrollbar-track-transparent flex max-h-[min(60vh,420px)] min-h-0 w-full flex-col items-start gap-5 overflow-y-auto overscroll-contain pr-1"
              >
                {items.map((item) => (
                  <div
                    key={item.course.slug}
                    className="flex w-full flex-col gap-5"
                  >
                    <div className="flex w-full items-center gap-3.5">
                      <Link
                        href={itemHref(item)}
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="relative h-[86px] w-20 shrink-0 sm:h-[102px] sm:w-24 overflow-hidden rounded-[6px] bg-[#d9d9d9]"
                      >
                        <Image
                          alt={item.course.title}
                          src={
                            item.course.thumbnailImage ||
                            "/courses/course-photo.jpeg"
                          }
                          fill
                          sizes="(min-width: 540px) 96px, 80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                        <div className="flex w-full flex-col items-start gap-2">
                          <div className="flex w-full items-start justify-between gap-2">
                            <span className="rounded-[5px] bg-primary-500/15 px-[9px] py-1.5 type-caption text-primary-500">
                              CPD CERTIFIED
                            </span>
                            <button
                              type="button"
                              aria-label="Remove course"
                              onClick={() => removeItem(item.course.slug)}
                              className="shrink-0 text-on-dark/70"
                            >
                              <IoTrashOutline className="size-[18px]" />
                            </button>
                          </div>
                          <Link
                            href={itemHref(item)}
                            onClick={() => setIsOpen(false)}
                            className="font-title type-body w-full font-semibold text-on-dark transition-colors hover:text-primary-500"
                          >
                            {item.course.title}
                          </Link>
                        </div>
                        <div className="flex items-end gap-1 whitespace-nowrap">
                          <p className="font-title type-body font-normal text-on-dark">
                            {formatPrice(item.course.price * item.quantity)}
                          </p>
                          {item.course.originalPrice && (
                            <p className="type-small tracking-[-1px] text-[#f08083] line-through">
                              {formatPrice(
                                item.course.originalPrice * item.quantity,
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3">
                      {/* Bundles are sold on the Personal plan only
                          (BundleSidebar), so they get no plan picker. */}
                      {item.course.kind !== "bundle" && (
                        <div className="flex w-full gap-1.5">
                          {PLAN_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={item.purchaseType === option.id}
                              onClick={() =>
                                updatePurchaseType(
                                  item.course.slug,
                                  option.id,
                                )
                              }
                              className={cn(
                                "h-8 flex-1 cursor-pointer rounded-lg type-caption font-medium transition-colors",
                                item.purchaseType === option.id
                                  ? "border border-primary-500 bg-primary-500/15 text-primary-500"
                                  : "border border-white/14 text-on-dark/70 hover:text-on-dark",
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="type-small font-light text-on-dark/70">
                          Quantity
                        </span>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(quantity) =>
                            updateQuantity(item.course.slug, quantity)
                          }
                        />
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/9" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-end gap-x-1.5">
              <p className="font-title type-h4 text-on-dark">
                Total:{" "}
                <span className="font-normal">{formatPrice(total.price)}</span>
              </p>
              {total.originalPrice > total.price && (
                <p className="type-body tracking-[-1px] text-[#f08083] line-through">
                  {formatPrice(total.originalPrice)}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="font-title flex w-full shrink-0 items-center justify-center rounded-xl bg-primary-500 py-3.5 type-button text-primary-950 sm:py-[17px]"
          >
            Go to Cart
          </Link>
        </div>
      )}
    </div>
  );
}
