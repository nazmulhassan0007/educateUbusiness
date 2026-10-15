"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import { MagicCard } from "@/components/ui/magic-card";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatPrice } from "@/lib/utils";
import { useCartStore, type PurchaseType } from "@/store/cart-store";

export type Course = {
  slug: string;
  title: string;
  description: string;
  rating?: string;
  price: number;
  originalPrice?: number;
  thumbnailImage?: string | null;
  categoryName?: string;
  // Not rendered — carried so course search (src/lib/courses/search.ts) can
  // match a course by its subject and its backend keywords, neither of which
  // is necessarily in the title or the summary.
  categorySlug?: string;
  keywords?: string[];
  // Cart-only. Bundles share this shape as a single cart line, so the cart
  // needs to know which detail page a line links back to.
  kind?: "course" | "bundle";
  // Cart-only, set from the course page. Lets the cart dropdown reprice a
  // line when its plan changes there — list cards don't have tier prices,
  // so lines added from them keep their add-time price.
  planPrices?: Record<PurchaseType, { price: number; originalPrice?: number }>;
};

// The API's rating is null for every course right now — falls back to the
// original static placeholder rating until real review data exists.
const DEFAULT_RATING = "20+ Student Rated 5 Star";

export default function CourseCard({
  course,
  variant = "dark",
}: {
  course: Course;
  variant?: "dark" | "light";
}) {
  const addItem = useCartStore((state) => state.addItem);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const isLight = variant === "light";

  const discountPercent =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(
          ((course.originalPrice - course.price) / course.originalPrice) * 100,
        )
      : null;

  return (
    <div className="relative h-full w-full">
      <MagicCard
        className="h-full w-full rounded-[30px]"
        gradientSize={240}
        gradientFrom="#1ee9b5"
        gradientTo="#128c6d"
        backgroundColor={isLight ? "#ffffff" : "#0e2915"}
        borderColor={isLight ? "#a5f6e1" : "rgba(255, 255, 255, 0.09)"}
        showGlow={false}
      >
        <div
          className={`relative z-10 flex h-full flex-col items-center gap-6 backdrop-blur-[75px] lg:gap-4 ${
            isLight ? "bg-white" : "bg-[#0e2915]"
          }`}
        >
          {/* Stretched-link: makes the whole card clickable through to the
              preview page, since there's no longer a dedicated "Preview
              Course" CTA. Sits above the image/title/description (none of
              which have their own z-index, so this z-10 layer covers them),
              but "Add to Cart" below is given a higher z-index so it stays
              independently clickable instead of being swallowed by this. */}
          <Link
            href={`/courses/${course.slug}`}
            aria-label={`Preview ${course.title}`}
            className="absolute inset-0 z-10 rounded-[30px]"
          />
          <div className="relative h-55 w-full shrink-0 overflow-hidden rounded-t-[30px] md:h-75 lg:h-86">
            <Image
              alt={course.title}
              src={course.thumbnailImage || "/courses/course-photo.jpeg"}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
            {discountPercent !== null && (
              <div className="absolute left-4 top-4 z-10 flex items-center justify-center rounded-[9px] bg-primary-500/90 px-[10px] py-2 text-surface-dark shadow-md">
                <span className="type-caption font-semibold">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-white p-1.5 shadow-md md:size-14">
                <Image
                  alt="CPD certified"
                  src="/all-courses/cpd-logo.avif"
                  width={56}
                  height={56}
                  className="size-full object-contain"
                />
              </span>
            </div>
          </div>

          <div className="flex h-full w-full flex-col gap-3 px-4 pb-6 md:gap-6 md:px-6 lg:px-8 lg:pb-8">
            <div className="flex flex-1 flex-col items-start gap-[22px]">
              {/* <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[7px] bg-primary-500/15 px-4 py-2 type-caption text-primary-500">
                  CPD CERTIFIED
                </span>
                {course.categoryName && (
                  <span className="rounded-[7px] bg-white/10 px-4 py-2 type-caption text-on-dark/80">
                    {course.categoryName}
                  </span>
                )}
              </div> */}
              <div className="flex w-full flex-col gap-[11px]">
                {/* <div className="flex items-center gap-[9px]">
                  <img
                    alt="5 stars"
                    className="h-6 w-[120px]"
                    src="/courses/stars-rating.svg"
                  />
                  <p className="type-small font-light text-on-dark">
                    {course.rating || DEFAULT_RATING}
                  </p>
                </div> */}
                <h3
                  className={`line-clamp-2 min-h-14 min-w-0 font-title type-h4 md:min-h-17.5 lg:min-h-18.25 ${
                    isLight ? "text-[#06180b]" : "text-on-dark"
                  }`}
                >
                  {course.title}
                </h3>
                <p
                  className={`line-clamp-2 type-small font-light ${
                    isLight ? "text-[#7a9dad]" : "text-on-dark"
                  }`}
                >
                  {course.description}
                </p>
              </div>
            </div>

            {/* One row at every width. Below `md` a compact, label-sized
                button on the left and the price pushed to the right edge.
                From `md` each takes half the row, which is where the
                button's `justify-between` earns the cart icon's position. */}
            <div className="flex items-center justify-between gap-3 md:gap-[18px]">
              <div
                ref={addToCartRef}
                className="relative z-20 shrink-0 md:w-full md:flex-1 md:shrink"
              >
                <PrimaryButton
                  label="Add to Cart"
                  onClick={() => {
                    flyToCart(addToCartRef.current);
                    addItem(course, undefined, undefined, undefined, false);
                  }}
                  icon="/offer/icon-cart-mint.svg"
                  // Compact pill below `md`, so the price fits beside it:
                  // tighter padding and a smaller icon circle.
                  className="max-md:gap-1.5 max-md:py-1.5 max-md:pl-3.5 max-md:pr-1.5 max-md:[&>span:last-child]:size-8 max-md:[&_img]:size-4 md:w-full md:justify-between"
                />
              </div>
              <div className="flex items-baseline gap-2 whitespace-nowrap md:flex-1 md:justify-end">
                <span
                  className={`type-h4 font-semibold ${
                    isLight ? "text-[#062f24]" : "text-primary-500"
                  }`}
                >
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice && (
                  <span className="type-body tracking-[-1px] text-[#f08083] line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  );
}
