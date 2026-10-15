"use client";

import { BarChart3, BookOpen, Clock, Maximize2, Minus as Collapse, Award } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Plus } from "@/components/page-components/concepts/shared";
import QuantityStepper from "@/components/shared/QuantityStepper";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import { cn, formatPrice } from "@/lib/utils";
import { PAYMENT_OPTIONS, type CoursePricingState } from "./useCoursePricing";

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK_PHOTO = "/course-details/hero-fallback.jpg";
// Whether the buyer folded the card away, kept for the visit so it doesn't spring open on every page.
const FOLDED_KEY = "course-dock-folded";

/**
 * The purchase card that docks on the right once the hero's own card has
 * scrolled away (wide screens only; phones keep their buy bar). It sits over
 * the sections rather than taking a column from them, so it folds down into
 * a slim price pill whenever the buyer wants the page back.
 *
 * Motion: it swings in from the right edge like a door closing, the photo
 * opens out of a slit, then the title, the facts and the buttons follow one
 * after another; a mint light runs round its edge while it's docked. Folding
 * morphs the card into the pill in the corner (and back), and it swings away
 * again when related courses or the footer arrive.
 */
export default function CourseDockCard({
  course,
  pricing,
  show,
}: {
  course: ApiCourseDetail;
  pricing: CoursePricingState;
  show: boolean;
}) {
  const still = !!useReducedMotion();
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the visit's choice
      if (sessionStorage.getItem(FOLDED_KEY) === "1") setFolded(true);
    } catch {}
  }, []);
  const fold = (next: boolean) => {
    setFolded(next);
    try {
      sessionStorage.setItem(FOLDED_KEY, next ? "1" : "0");
    } catch {}
  };

  const photo = course.thumbnailImage?.url || course.heroImage?.url || FALLBACK_PHOTO;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden [perspective:1600px] xl:block">
      <AnimatePresence mode="popLayout">
        {show && !folded && (
          <motion.aside
            key="card"
            layoutId={still ? undefined : "course-dock"}
            aria-label="Buy this course"
            initial={still ? { opacity: 0 } : { opacity: 0, x: 140, rotateY: -38, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
            exit={still ? { opacity: 0 } : { opacity: 0, x: 120, rotateY: 30, scale: 0.94 }}
            transition={{ duration: 0.75, ease: EASE }}
            style={{ borderRadius: 24, transformOrigin: "100% 50%" }}
            className="pointer-events-auto absolute right-6 top-[calc(var(--home-nav-h)+16px)] w-[360px] 2xl:right-8 2xl:w-[380px]"
          >
            <DockCard course={course} pricing={pricing} photo={photo} onFold={() => fold(true)} still={still} />
          </motion.aside>
        )}

        {show && folded && (
          <motion.div
            key="pill"
            layoutId={still ? undefined : "course-dock"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ borderRadius: 999 }}
            className="pointer-events-auto absolute bottom-[92px] right-6 flex items-center gap-3 bg-[#06180b] py-2 pl-2 pr-2 text-[#f2efe6] shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)] ring-1 ring-[#1ee9b5]/25 2xl:right-8"
          >
            <button
              type="button"
              onClick={() => fold(false)}
              aria-label="Show the course card"
              className="group flex cursor-pointer items-center gap-3 rounded-full pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                <Image src={photo} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <span className="flex flex-col items-start">
                <span className="max-w-[180px] truncate type-caption text-[#f2efe6]/65">{course.title}</span>
                <span className="font-title type-h4 leading-none tabular-nums text-[#1ee9b5]">{formatPrice(pricing.discountedUnitPrice)}</span>
              </span>
              <Maximize2 aria-hidden="true" size={15} className="text-[#f2efe6]/60 transition-colors group-hover:text-[#1ee9b5]" />
            </button>
            <button
              type="button"
              onClick={() => pricing.handleAddToCart()}
              className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#1ee9b5] pl-4 pr-1.5 type-small font-medium text-[#06180b] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
            >
              Add to cart
              <span className="grid size-8 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5]">
                <Plus size={11} />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes dock-beam { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DockCard({
  course,
  pricing,
  photo,
  onFold,
  still,
}: {
  course: ApiCourseDetail;
  pricing: CoursePricingState;
  photo: string;
  onFold: () => void;
  still: boolean;
}) {
  const {
    selectedPlan,
    quantity,
    selectPlan,
    changeQuantity,
    coupon,
    setCoupon,
    couponState,
    applyCoupon,
    removeCoupon,
    discountedUnitPrice,
    displayOriginalPrice,
  } = pricing;
  const [couponOpen, setCouponOpen] = useState(couponState.status !== "idle");
  const id = useId();

  const facts = [
    course.durationLabel && { icon: Clock, label: course.durationLabel },
    course.deliveryMode && { icon: BookOpen, label: course.deliveryMode },
    course.skillLevel && { icon: BarChart3, label: course.skillLevel },
    course.hasCertificate && { icon: Award, label: course.certificateType || "Certificate of Completion" },
  ].filter((f): f is { icon: typeof Clock; label: string } => !!f);

  // The card's parts arrive one after another once it has swung in.
  const part: Variants = {
    hide: still ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.3 + i * 0.07, ease: EASE } }),
  };

  return (
    // The edge light: a slowly turning conic gradient behind a 1px gap round the card.
    <div className="relative overflow-hidden rounded-[24px] p-px shadow-[0_40px_80px_-24px_rgb(0_0_0/0.6)]">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,rgb(30_233_181/0.9)_320deg,transparent_360deg)] motion-safe:animate-[dock-beam_6s_linear_infinite]"
      />
      <motion.div
        initial="hide"
        animate="show"
        className="relative flex max-h-[calc(100svh-var(--home-nav-h)-40px)] flex-col overflow-y-auto rounded-[23px] bg-[radial-gradient(120%_70%_at_50%_0%,#123d2a_0%,#071a0e_60%)] p-3 text-[#f2efe6] [scrollbar-width:none]"
      >
        {/* The photo opens out of a slit. */}
        <motion.div
          className="relative h-[150px] shrink-0 overflow-hidden rounded-[16px]"
          variants={{ hide: still ? {} : { clipPath: "inset(48% 0% 48% 0% round 16px)" }, show: { clipPath: "inset(0% 0% 0% 0% round 16px)", transition: { duration: 0.9, delay: 0.15, ease: EASE } } }}
        >
          <motion.div className="absolute inset-0" variants={{ hide: still ? {} : { scale: 1.25 }, show: { scale: 1, transition: { duration: 1.2, delay: 0.15, ease: EASE } } }}>
            <Image src={photo} alt="" fill sizes="380px" className="object-cover" />
          </motion.div>
          {course.hasCertificate && (
            <motion.span
              variants={part}
              custom={2}
              className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full bg-[#06180b]/55 py-1.5 pl-1.5 pr-4 backdrop-blur-md"
            >
              <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white p-1">
                <Image src="/all-courses/cpd-logo.avif" alt="" width={36} height={27} className="h-auto w-full" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="type-caption uppercase tracking-[0.12em] text-[#f2efe6]/60">Certified by</span>
                <span className="type-small font-semibold">CPD</span>
              </span>
            </motion.span>
          )}
          <button
            type="button"
            onClick={onFold}
            aria-label="Minimise the course card"
            className="absolute right-2.5 top-2.5 grid size-8 cursor-pointer place-items-center rounded-full bg-[#06180b]/55 text-[#f2efe6] backdrop-blur-md transition-colors hover:bg-[#1ee9b5] hover:text-[#06180b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
          >
            <Collapse size={15} />
          </button>
        </motion.div>

        <div className="flex flex-col px-2 pb-2 pt-4">
          <motion.h2 variants={part} custom={0} className="m-0 font-title type-h4 font-medium leading-tight tracking-[-0.02em]">
            {course.title}
          </motion.h2>

          {facts.length > 0 && (
            <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-4 gap-y-2 border-y border-[#f2efe6]/12 p-0 py-3.5">
              {facts.map((f, i) => (
                <motion.li key={f.label} variants={part} custom={1 + i * 0.5} className="flex items-center gap-1.5 type-small text-[#f2efe6]/75">
                  <f.icon aria-hidden="true" size={15} strokeWidth={1.6} className="text-[#1ee9b5]" />
                  <span className="first-letter:uppercase">{f.label}</span>
                </motion.li>
              ))}
            </ul>
          )}

          {/* Same plan state as the hero card, so a plan picked in either shows in both. */}
          <motion.div variants={part} custom={2.5} className="mt-4">
            <div role="radiogroup" aria-label="Plan" className="grid grid-cols-3 gap-1 rounded-full bg-[#f2efe6]/[0.08] p-1">
              {PAYMENT_OPTIONS.map((option) => {
                const active = selectedPlan === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectPlan(option.id)}
                    className={cn(
                      "h-8 cursor-pointer rounded-full type-caption font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1ee9b5]",
                      active ? "bg-[#1ee9b5] text-[#06180b]" : "text-[#f2efe6]/70 hover:text-[#f2efe6]",
                    )}
                  >
                    {option.label.replace(" Plan", "")}
                  </button>
                );
              })}
            </div>
            {selectedPlan !== "personal" && (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#f2efe6]/12 px-4 py-2">
                <span className="type-small text-[#f2efe6]/70">Seats</span>
                <QuantityStepper value={quantity} onChange={changeQuantity} />
              </div>
            )}
          </motion.div>

          <motion.div variants={part} custom={3} className="mt-4 flex items-center justify-between gap-3">
            <p className="m-0 flex items-baseline gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={discountedUnitPrice}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="font-title type-h2 leading-none tabular-nums text-[#1ee9b5]"
                >
                  {formatPrice(discountedUnitPrice)}
                </motion.span>
              </AnimatePresence>
              {displayOriginalPrice !== undefined && (
                <span className="type-small text-[#f2efe6]/45 line-through tabular-nums">{formatPrice(displayOriginalPrice)}</span>
              )}
              {selectedPlan !== "personal" && <span className="type-small text-[#f2efe6]/60">per seat</span>}
            </p>
          </motion.div>

          <motion.div variants={part} custom={4} className="mt-4">
            <AnimatePresence mode="wait" initial={false}>
              {couponState.status === "applied" ? (
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex h-11 items-center justify-between gap-3 rounded-full bg-[#1ee9b5]/15 pl-4 pr-1.5"
                >
                  <span className="truncate type-small font-medium text-[#1ee9b5]">{couponState.code} applied</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponOpen(false);
                    }}
                    className="h-8 shrink-0 cursor-pointer rounded-full px-3 type-small text-[#f2efe6]/70 transition-colors hover:bg-[#f2efe6]/10 hover:text-[#f2efe6]"
                  >
                    Remove
                  </button>
                </motion.div>
              ) : couponOpen ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, width: "50%" }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyCoupon();
                  }}
                  className="flex h-11 items-center gap-2 rounded-full border border-dashed border-[#1ee9b5]/50 bg-[#0b3a28]/60 pl-4 pr-1.5 focus-within:border-solid focus-within:border-[#1ee9b5]"
                >
                  <label htmlFor={`${id}-coupon`} className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id={`${id}-coupon`}
                    autoFocus
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    autoComplete="off"
                    className="h-full min-w-0 flex-1 bg-transparent type-small uppercase text-[#f2efe6] placeholder:normal-case placeholder:text-[#f2efe6]/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponState.status === "checking" || !coupon.trim()}
                    className="h-8 shrink-0 cursor-pointer rounded-full bg-[#1ee9b5] px-3.5 type-small font-medium text-[#06180b] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {couponState.status === "checking" ? "Checking…" : "Apply"}
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="open"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCouponOpen(true)}
                  className="h-10 cursor-pointer rounded-full border border-dashed border-[#1ee9b5]/50 bg-[#0b3a28]/60 px-4 type-small font-medium text-[#f2efe6] transition-colors hover:border-solid hover:border-[#1ee9b5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
                >
                  Apply coupon
                </motion.button>
              )}
            </AnimatePresence>
            {couponState.status === "error" && (
              <p role="alert" className="m-0 mt-2 pl-4 type-small text-[#ff8a80]">
                {couponState.message}
              </p>
            )}
          </motion.div>

          <motion.div variants={part} custom={5} className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => pricing.handleAddToCart()}
              className={cn(
                "group relative h-12 cursor-pointer overflow-hidden rounded-[14px] bg-[#1ee9b5] type-button font-medium text-[#06180b] transition-transform active:scale-[0.97]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]",
              )}
            >
              {/* A sheen across the button on hover. */}
              <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/50 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[450%]" />
              <span className="relative">Add to cart</span>
            </button>
            <button
              type="button"
              onClick={pricing.handleBuyNow}
              className="h-12 cursor-pointer rounded-[14px] border border-[#1ee9b5]/70 type-button font-medium text-[#1ee9b5] transition-[background-color,color,transform] duration-300 hover:bg-[#1ee9b5] hover:text-[#06180b] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
            >
              Buy now
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
