"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { photoFor } from "./HeroCard";
import { Arrow, Check, EASE, toCartCourse } from "./shared";

// The six courses the design features, in its order. Any that are missing
// from the catalogue are filled from the rest of it.
const FEATURED = [/fire safety/i, /first aid/i, /^gdpr/i, /unconscious bias/i, /manual handling/i, /cybersecurity awareness/i];
const COUNT = 6;

function pickPopular(courses: HomeCourse[]) {
  const picked: HomeCourse[] = [];
  for (const re of FEATURED) {
    const c = courses.find((x) => re.test(x.title) && !picked.includes(x));
    if (c) picked.push(c);
  }
  for (const c of courses) {
    if (picked.length >= COUNT) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.slice(0, COUNT);
}

// "4 MODULES · 2 HOURS · CPD CERTIFICATE" (modules only when the course page lists them).
function meta(c: HomeCourse) {
  const n = c.detail?.modules.length ?? 0;
  return [n ? `${n} module${n === 1 ? "" : "s"}` : null, c.duration || null, "CPD certificate"].filter(Boolean).join(" · ");
}

// Phones (one column) show this many cards, then the "Explore all courses"
// button, so a visitor meets courses first and the button where they'd look next.
const PHONE_COUNT = 3;

/**
 * Popular courses: six course cards in three columns under a title and an
 * "Explore all courses" button. On phones the button follows the first three
 * cards instead. Each card links to its course; "Add to cart" adds it in
 * place (and opens the cart once it's there).
 */
export default function PopularCourses({ data, courses }: { data?: HomeCms["courses"]; courses: HomeCourse[] }) {
  const list = useMemo(() => pickPopular(courses), [courses]);
  if (!list.length) return null;
  // The label is the design's; the link still comes from the CMS when it has one.
  const cta = { url: data?.cta?.url || "/courses", text: "Explore all courses" };

  return (
    <section id="courses" aria-labelledby="popular-title" className="bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 md:py-28 lg:py-32">
      <div className="mx-auto max-w-site">
        <motion.div
          className="flex flex-wrap items-end justify-between gap-6"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <h2 id="popular-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            Popular courses
          </h2>
          <ExploreLink {...cta} className="hidden sm:inline-flex" />
        </motion.div>

        <ul className="m-0 mt-10 grid list-none gap-[22px] p-0 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {list.map((c, i) => (
            <motion.li
              key={c.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: EASE }}
              className={i >= PHONE_COUNT ? "max-sm:hidden" : undefined}
            >
              <CourseCard course={c} first={i < 3} />
            </motion.li>
          ))}
        </ul>
        <ExploreLink {...cta} className="mt-8 flex w-full justify-center sm:hidden" />
      </div>
    </section>
  );
}

function ExploreLink({ url, text, className }: { url: string; text: string; className: string }) {
  return (
    <Link
      href={url}
      className={`group h-[54px] items-center gap-3 rounded-[10px] bg-[#06180b] px-7 type-button font-medium text-white transition-colors duration-300 hover:bg-[#0c3a28] ${className}`}
    >
      {text}
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        <Arrow />
      </span>
    </Link>
  );
}

function CourseCard({ course: c, first }: { course: HomeCourse; first: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((it) => it.course.slug === c.slug));
  const onCart = () => (inCart ? useCartStore.getState().setIsOpen(true) : addItem(toCartCourse(c), undefined, undefined, undefined, false));

  return (
    <article className="group relative flex h-full flex-col overflow-hidden isolate rounded-[22px] border border-[#06180b]/[0.09] bg-[#f2efe6] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgb(6_24_11/0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#06180b]/10">
        <Image
          src={photoFor(c)}
          alt=""
          fill
          preload={first && /fire safety/i.test(c.title)}
          sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {c.category && (
          <span className="absolute left-4 top-4 rounded-[8px] bg-[#f2efe6] px-3 py-1.5 type-caption font-medium text-[#06180b]">{c.category}</span>
        )}
        {/* Every course is CPD certified: the mark, small, in the photo's corner. */}
        <span className="absolute bottom-3 right-3 rounded-[8px] bg-white/95 px-2 py-1.5 shadow-[0_6px_16px_-8px_rgb(6_24_11/0.45)]">
          <Image src="/all-courses/cpd-logo.avif" alt="CPD certified" width={128} height={96} className="block h-7 w-auto md:h-8" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-[26px] pt-5">
        <h3 className="m-0 font-title sm:min-h-16 type-h4 font-normal tracking-[-0.02em]">
          {/* The title's link covers the whole card; the cart button sits above it. */}
          <Link href={`/courses/${c.slug}`} className="line-clamp-2 after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none after:focus-visible:ring-[3px] after:focus-visible:ring-inset after:focus-visible:ring-[#0c7a5e]">
            {c.title}
          </Link>
        </h3>
        <p className="m-0 mt-2 type-caption uppercase tracking-[0.08em] text-[#06180b]/60">{meta(c)}</p>
        {/* The course's own short description from the catalogue; two lines keep the cards even. */}
        {c.description && <p className="m-0 mt-3 line-clamp-2 type-small text-[#06180b]/70">{c.description}</p>}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="m-0 font-title type-h4 tracking-[-0.02em]">
            {formatPrice(c.price)}
            {c.originalPrice ? <s className="ml-2 align-middle font-sans type-small text-[#06180b]/45">{formatPrice(c.originalPrice)}</s> : null}
          </p>
          <button
            type="button"
            onClick={onCart}
            aria-label={inCart ? `${c.title} is in your cart, open cart` : `Add ${c.title} to cart`}
            className={`relative z-10 inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[10px] px-4 type-button font-medium transition-colors duration-300 ${
              inCart ? "bg-[#1ee9b5] text-[#06180b] hover:bg-[#5ef0c9]" : "bg-[#06180b] text-white hover:bg-[#1ee9b5] hover:text-[#06180b]"
            }`}
          >
            {inCart && <Check size={12} />}
            {inCart ? "In cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
