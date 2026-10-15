"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AuthPromptModal from "@/app/checkout/AuthPromptModal";
import { Plus } from "@/components/page-components/concepts/shared";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import { formatPrice } from "@/lib/utils";
import CourseDockCard from "./CourseDockCard";
import CoursePurchaseCard from "./CoursePurchaseCard";
import { heroStatsOf, pad2, splitTitle } from "./course-view";
import { useCoursePricing } from "./useCoursePricing";

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK_PHOTO = "/course-details/hero-fallback.jpg";

/**
 * The course hero (Figma 183:173): the course's own photo full bleed under the
 * navbar, the title in two lines with the last word in mint, the purchase
 * card on the right and the course's facts along the bottom.
 *
 * Motion — the page's one authored moment: the photo opens out of a rounded
 * frame and settles, the title's lines rise out of their masks, the card
 * lifts in, and the facts' rules sweep across. Scrolling away pushes into
 * the photo. Reduced motion shows the finished layout, still.
 *
 * Owns the pricing state, so the small buy bar that takes over on phones once
 * the card has scrolled away is always in step with it.
 */
export default function CourseHero({ course }: { course: ApiCourseDetail }) {
  const pricing = useCoursePricing(course);
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const still = !!useReducedMotion();
  const [cardGone, setCardGone] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  // The phone buy bar and the wide screens' docked card show once the card is
  // above the viewport, not merely off it, and step aside again when related
  // courses (the docked card) or the footer (both) arrive.
  const [atFooter, setAtFooter] = useState(false);
  const [atRelated, setAtRelated] = useState(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const card = new IntersectionObserver(([e]) => setCardGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    card.observe(el);
    const footer = document.querySelector("footer");
    const end = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting));
    if (footer) end.observe(footer);
    const related = document.querySelector('[aria-labelledby="related-title"]');
    const near = new IntersectionObserver(([e]) => setAtRelated(e.isIntersecting || e.boundingClientRect.top < 0), { rootMargin: "0px 0px -35% 0px" });
    if (related) near.observe(related);
    return () => {
      card.disconnect();
      end.disconnect();
      near.disconnect();
    };
  }, []);

  const { lead, accent } = splitTitle(course.title);
  const stats = heroStatsOf(course);
  const photo = course.heroImage?.url || course.thumbnailImage?.url || FALLBACK_PHOTO;

  const rise = (delay: number) =>
    still
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay, ease: EASE } };
  const line = (delay: number) =>
    still ? {} : { initial: { y: "105%" }, animate: { y: "0%" }, transition: { duration: 1, delay, ease: EASE } };

  return (
    <>
      <section
        ref={ref}
        aria-labelledby="course-title"
        className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#06180b] text-[#f2efe6] lg:min-h-[max(100svh,860px)]"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          initial={still ? false : { clipPath: "inset(12% 8% 12% 8% round 40px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
          transition={{ duration: 1.5, ease: EASE }}
        >
          <motion.div className="absolute inset-0" style={still ? undefined : { scale: photoScale }}>
            <Image src={photo} alt="" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
        </motion.div>

        {/* The design's three washes: ink from the left for the copy, from the bottom for the facts, and a little from the top for the navbar. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(6_24_11/0.82)_0%,rgb(6_24_11/0.35)_45%,rgb(11_58_40/0.1)_75%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_24_11/0)_40%,rgb(6_24_11/0.55)_72%,rgb(6_24_11/0.92)_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_24_11/0.6)_0%,rgb(6_24_11/0)_16%)]" />

        <div className="w-full px-5 pb-10 pt-32 md:px-10 lg:pb-12 lg:pt-40">
          <div className="mx-auto max-w-site">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col items-start gap-5">
              <motion.nav {...rise(0.3)} aria-label="Breadcrumb">
                <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 type-small">
                  <li>
                    <Link href="/courses" className="text-[#f2efe6]/75 transition-colors hover:text-[#1ee9b5]">
                      Courses
                    </Link>
                  </li>
                  {course.category?.name && (
                    <>
                      <li aria-hidden="true" className="text-[#f2efe6]/45">
                        /
                      </li>
                      <li>
                        <Link
                          href={`/courses?category=${encodeURIComponent(course.category.slug)}`}
                          className="text-[#f2efe6]/75 transition-colors hover:text-[#1ee9b5]"
                        >
                          {course.category.name}
                        </Link>
                      </li>
                    </>
                  )}
                </ol>
              </motion.nav>

              {/* Every course is CPD certified, so the mark shows on all of them. */}
              <motion.p
                {...rise(0.4)}
                className="m-0 inline-flex items-center gap-2.5 rounded-full border border-[#f2efe6]/30 bg-[#06180b]/35 py-1.5 pl-1.5 pr-4 backdrop-blur-sm"
              >
                <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-white p-1">
                  <Image src="/all-courses/cpd-logo.avif" alt="" width={40} height={30} className="h-auto w-full" />
                </span>
                <span className="type-small font-medium">CPD Certified</span>
              </motion.p>

              <h1
                id="course-title"
                className="m-0 max-w-[15ch] font-title type-h1 font-normal tracking-[-0.03em] text-balance [overflow-wrap:anywhere] md:max-w-[18ch] lg:max-w-none"
              >
                {lead && (
                  <span className="block overflow-hidden pb-[0.04em]">
                    <motion.span className="block" {...line(0.45)}>
                      {lead}
                    </motion.span>
                  </span>
                )}
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span className="block text-[#1ee9b5]" {...line(0.55)}>
                    {accent}
                  </motion.span>
                </span>
              </h1>

              {course.shortDescription && (
                <motion.p {...rise(0.75)} className="m-0 max-w-[640px] type-lead text-[#f2efe6]/[0.88]">
                  {course.shortDescription}
                </motion.p>
              )}
            </div>

            <motion.div
              ref={cardRef}
              className="shrink-0"
              initial={still ? false : { opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
            >
              <CoursePurchaseCard pricing={pricing} hasCertificate={course.hasCertificate} />
            </motion.div>
          </div>

          {stats.length > 0 && (
            <ul className="m-0 mt-12 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 lg:mt-10 lg:grid-cols-4">
              {stats.map((s, i) => (
                <motion.li key={s.title} {...rise(0.9 + i * 0.08)} className="group/stat relative pt-4">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[#f2efe6]/40" />
                  <motion.span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-0.5 origin-left transition-colors duration-500 ${
                      i === 0 ? "bg-[#1ee9b5]" : "bg-transparent group-hover/stat:bg-[#1ee9b5]/70"
                    }`}
                    initial={still ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 1 + i * 0.12, ease: EASE }}
                  />
                  <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center rounded-full border bg-[#06180b]/20 font-[family-name:var(--font-geist-mono)] type-caption transition-colors duration-500 sm:size-[34px] ${
                        i === 0
                          ? "border-[#1ee9b5] text-[#1ee9b5]"
                          : "border-[#f2efe6]/50 text-[#f2efe6] group-hover/stat:border-[#1ee9b5] group-hover/stat:text-[#1ee9b5]"
                      }`}
                    >
                      {pad2(i + 1)}
                    </span>
                    <p className="m-0 font-title type-h4 tracking-[-0.025em] lg:type-lead xl:type-h4">{s.title}</p>
                  </div>
                  <p className="m-0 mt-3 type-small text-[#f2efe6]/75 sm:mt-4 sm:pl-12">{s.body}</p>
                </motion.li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </section>

      {/* Wide screens: the card docks on the right once its place in the hero has scrolled away. */}
      <CourseDockCard course={course} pricing={pricing} show={cardGone && !atFooter && !atRelated} />

      {/* Phones and laptops: once the card has scrolled away, price and Add to cart stay to hand. */}
      <AnimatePresence>
        {cardGone && !atFooter && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-3 bottom-3 z-[80] flex items-center gap-3 rounded-full bg-[#06180b] py-2 pl-5 pr-2 text-[#f2efe6] shadow-[0_20px_40px_-12px_rgb(0_0_0/0.5)] xl:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate type-small text-[#f2efe6]/70">{course.title}</p>
              <p className="m-0 font-title type-h4 tabular-nums">{formatPrice(pricing.discountedUnitPrice)}</p>
            </div>
            <button
              type="button"
              onClick={() => pricing.handleAddToCart()}
              className="flex h-12 shrink-0 cursor-pointer items-center gap-2.5 rounded-full bg-[#1ee9b5] pl-5 pr-1.5 type-button font-medium text-[#06180b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
            >
              Add to cart
              <span className="grid size-9 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5]">
                <Plus size={12} />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthPromptModal
        open={pricing.showAuthPrompt}
        onClose={() => pricing.setShowAuthPrompt(false)}
        redirectTo={`/courses/${course.slug}`}
      />
    </>
  );
}
