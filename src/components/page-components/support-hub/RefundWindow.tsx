"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

const WINDOW = 14;
// Days shown: the day of purchase, the fourteen of the window, two after it.
const DAYS = Array.from({ length: WINDOW + 3 }, (_, i) => i);

// Mint on day 1 deepening to green on day 14.
function tint(d: number) {
  const t = (d - 1) / (WINDOW - 1);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(30, 21)} ${mix(233, 148)} ${mix(181, 111)})`;
}

const FACTS = ["One-off course access, not a subscription", "Nothing to auto-renew", "Nothing to cancel"];

// What a day means, for the line under the board when a day is pointed at.
function meaning(d: number) {
  if (d === 0) return "Day 0 · you buy the course";
  if (d <= WINDOW) {
    const left = WINDOW - d;
    return `Day ${d} · ${left ? `${left} day${left === 1 ? "" : "s"} left to ask for a refund` : "last day to ask for a refund"}`;
  }
  return `Day ${d} · the window has closed`;
}

/**
 * Refund policy: "14 days" large, the policy beside it, then the days laid out
 * as a board: the day you buy, the fourteen days you can ask for a refund in,
 * and the days after it closes.
 *
 * Motion: the 14 counts up as the days turn over one by one; pointing at a day
 * says where it falls in the window; the three facts tick in after.
 */
export default function RefundWindow() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-20%" });
  const [hover, setHover] = useState<number | null>(null);

  // The big number counts up with the board.
  const count = useMotionValue(reduce ? WINDOW : 0);
  const shown = useTransform(count, (v) => String(Math.round(v)));
  useEffect(() => {
    if (!seen || reduce) return;
    const c = animate(count, WINDOW, { duration: 1.6, delay: 0.35, ease: [0.3, 0, 0.2, 1] });
    return () => c.stop();
  }, [seen, reduce, count]);

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const fade: Variants = { hide: { opacity: 0, y: 24 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.85, delay: d, ease: EASE } }) };
  // Each day turns over in order, in step with the count.
  const tile: Variants = {
    hide: { opacity: 0, rotateX: -90 },
    show: (d: number) => ({ opacity: 1, rotateX: 0, transition: { duration: 0.55, delay: 0.3 + d * 0.1, ease: EASE } }),
  };

  return (
    <section aria-labelledby="refund-title" className="relative overflow-hidden bg-[#0b3a28] px-5 py-20 text-[#f2efe6] md:px-10 lg:pb-[135px] lg:pt-[118px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_95%_60%,#105a40_0%,transparent_70%),linear-gradient(160deg,#0c3a28_0%,#0a3424_60%,#0b3a28_100%)]"
      />

      <motion.div ref={ref} {...group} className="relative mx-auto max-w-site">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-[82px]">
          <motion.p variants={fade} custom={0} className="m-0 flex shrink-0 items-baseline gap-[25px] type-stat lg:mt-[48px]" aria-label={`${WINDOW} days`}>
            {/* Sized by the final number, so "days" stays put while it counts. */}
            <span aria-hidden="true" className="relative inline-block font-title tracking-[-0.05em]">
              <span className="invisible">{WINDOW}</span>
              <motion.span className="absolute inset-0 text-right">{shown}</motion.span>
            </span>
            <span aria-hidden="true" className="font-title text-[0.63em] tracking-[-0.04em] text-[#1ee9b5]">
              days
            </span>
          </motion.p>
          <div className="max-w-[620px]">
            <motion.h2 variants={fade} custom={0.1} id="refund-title" className="m-0 font-title type-h3 font-normal tracking-[-0.035em]">
              Refund policy
            </motion.h2>
            <motion.p variants={fade} custom={0.18} className="m-0 mt-4 type-lead text-white/80">
              If you’re unhappy with a course, or a technical issue prevents you from accessing it, contact our support team within {WINDOW} days of purchase. Every request is reviewed fairly, case by case, by a real person on our UK-based team.
            </motion.p>
          </div>
        </div>

        {/* The days. */}
        <motion.div
          variants={fade}
          custom={0.2}
          className="mt-12 rounded-[20px] border border-white/[0.08] bg-[#06180b]/30 px-5 pb-5 pt-6 md:px-[33px] md:pt-[33px] lg:mt-[62px]"
          onPointerLeave={() => setHover(null)}
        >
          <ol className="m-0 -mt-2 flex list-none gap-2 overflow-x-auto p-0 pb-1 pt-2 [mask-image:linear-gradient(to_right,black_82%,transparent)] [perspective:800px] lg:[mask-image:none] [scrollbar-width:none] md:gap-[8.5px] [&::-webkit-scrollbar]:hidden" aria-label="Refund window by day">
            {DAYS.map((d) => {
              const kind = d === 0 ? "buy" : d <= WINDOW ? "open" : "closed";
              const lit = hover === d;
              return (
                <motion.li
                  key={d}
                  variants={tile}
                  custom={d}
                  onPointerEnter={() => setHover(d)}
                  onFocus={() => setHover(d)}
                  tabIndex={0}
                  aria-label={meaning(d)}
                  className="shrink-0 origin-bottom rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {/* The tile itself, apart from the flip, so it can lift under the pointer. */}
                  <span
                    style={kind === "open" ? { backgroundColor: tint(d) } : undefined}
                    className={`flex h-[76px] w-[54px] cursor-default flex-col items-center justify-center rounded-[10px] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[84px] md:w-[60px] ${
                      kind === "buy" ? "bg-[#f2efe6] text-[#06180b]" : kind === "open" ? "text-[#06180b]" : "border border-dashed border-white/25 text-white/55"
                    } ${lit ? "-translate-y-1.5 shadow-[0_14px_24px_-12px_rgb(0_0_0/0.6)]" : ""}`}
                  >
                    <span className={`type-caption ${kind === "closed" ? "text-white/60" : "text-[#06180b]/70"}`}>Day</span>
                    <span className="mt-1 font-title type-h4 tracking-[-0.02em]">{d}</span>
                  </span>
                </motion.li>
              );
            })}
          </ol>

          <div className="mt-[18px] flex min-h-6 flex-wrap items-center justify-between gap-x-6 gap-y-1 type-small" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {hover === null ? (
                <motion.div key="key" className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="font-semibold">Day 0 · you buy the course</span>
                  <span className="font-medium text-[#1ee9b5]">Days 1–{WINDOW} · contact support for a refund</span>
                  <span className="text-white/60">Day {WINDOW + 1} onward · window closed</span>
                </motion.div>
              ) : (
                <motion.span
                  key={hover}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className={`font-semibold ${hover > 0 && hover <= WINDOW ? "text-[#1ee9b5]" : hover > WINDOW ? "text-white/60" : ""}`}
                >
                  {meaning(hover)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <ul className="m-0 mt-10 flex list-none flex-wrap gap-x-[30px] gap-y-3 p-0 lg:mt-[60px]">
          {FACTS.map((f, i) => (
            <motion.li key={f} variants={fade} custom={2 + i * 0.12} className="flex items-center gap-3 type-body">
              <span aria-hidden="true" className="grid size-[21px] shrink-0 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
                <Check size={10} />
              </span>
              {f}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
