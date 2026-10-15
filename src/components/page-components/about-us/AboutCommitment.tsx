"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import Link from "next/link";
import { Arrow, Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

export type AboutCommitmentContent = {
  title?: string;
  sub_title?: string;
  description?: string;
  commitment?: { label?: string }[];
};

const DEFAULT = {
  title: "Our commitment",
  tagline: "Accessible. Professional. Built for real-world growth.",
  intro: "When you choose educateU, you can expect:",
  promises: [
    "Career-focused progression",
    "Industry-relevant content",
    "Dedicated learner support",
    "Transparent & fair pricing",
    "Flexible online access",
    "Seamless digital experience",
  ],
};

// The CMS writes these in title case ("Industry Relevant Content"); the design uses sentence case.
function sentence(label: string) {
  const t = label.trim().replace(/^Industry Relevant/i, "Industry-relevant");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function fromCms(data?: AboutCommitmentContent) {
  const promises = (data?.commitment ?? []).map((c) => c.label?.trim()).filter((l): l is string => Boolean(l)).map(sentence);
  const sub = data?.sub_title?.trim();
  const tagline = data?.description?.trim();
  return {
    title: data?.title?.trim() ? sentence(data.title) : DEFAULT.title,
    tagline: tagline ? tagline.replace(/Real-World Growth/i, "real-world growth") : DEFAULT.tagline,
    intro: sub ? `${sub.replace(/:?$/, "")}:` : DEFAULT.intro,
    promises: promises.length ? promises : DEFAULT.promises,
  };
}

/**
 * Our commitment: the title, tagline and a button on the left; on the right
 * the learner promise as a signed card, lying on a dark green sheet.
 *
 * Motion: the card drops onto its sheet and the sheet swings out behind it;
 * each promise ticks in turn; the signature writes itself; the seal pops.
 * The card tilts toward the pointer.
 */
export default function AboutCommitment({ data }: { data?: AboutCommitmentContent }) {
  const { title, tagline, intro, promises } = fromCms(data);
  const reduce = useReducedMotion();
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };

  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };
  const tick: Variants = {
    hide: { scale: 0, rotate: -45 },
    show: (i: number) => ({ scale: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 14, delay: 0.8 + i * 0.12 } }),
  };

  // Pointer tilt.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 120, damping: 16 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), spring);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  const words = title.split(" ");

  return (
    <section aria-labelledby="commitment-title" className="ragged overflow-hidden bg-[#f7f6f1] px-5 py-24 text-[#06180b] md:px-10 lg:py-[150px]">
      <div className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] items-center gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_772px]">
        <motion.div {...group}>
          <motion.h2 id="commitment-title" variants={fade} custom={0} className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
            {words[0]}
            {words.length > 1 && <br />}
            {words.slice(1).join(" ")}
          </motion.h2>
          <motion.p variants={fade} custom={0.12} className="m-0 mt-11 max-w-[420px] font-title type-h3 tracking-[-0.03em] text-[#0c7a5e]">
            {tagline}
          </motion.p>
          <motion.p variants={fade} custom={0.2} className="m-0 mt-5 type-lead text-[#06180b]/75">
            {intro}
          </motion.p>
          <motion.div variants={fade} custom={0.28} className="mt-12">
            <Link
              href="/courses"
              className="group relative inline-flex h-[60px] items-center gap-4 overflow-hidden rounded-full bg-[#06180b] py-1.5 pl-7 pr-1.5 type-button font-medium text-white"
            >
              <span aria-hidden="true" className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#0c3a28] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
              <span className="relative">Explore Courses</span>
              <span className="relative grid size-[46px] place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 group-hover:-rotate-45">
                <Arrow size={14} />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div {...group} className="relative mx-auto w-full max-w-[726px] [perspective:1600px] lg:mx-0">
          {/* The dark sheet, swinging out behind the card. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 origin-bottom-left rounded-[18px] bg-[#0c3a28]"
            variants={{
              hide: { rotate: 0, x: 0, y: 0 },
              show: { rotate: 2.6, x: 22, y: 18, transition: { type: "spring", stiffness: 70, damping: 14, delay: 0.45 } },
            }}
          />
          <motion.div
            onPointerMove={onMove}
            onPointerLeave={reset}
            style={reduce ? undefined : { rotateX, rotateY }}
            variants={{
              hide: { opacity: 0, y: -40, rotate: -3 },
              show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 1, ease: EASE } },
            }}
            className="relative rounded-[18px] bg-[#f2efe6] p-3 shadow-[0_40px_80px_-40px_rgb(6_24_11/0.45)]"
          >
            <div className="rounded-[10px] border border-[#0c7a5e]/30 px-6 pb-10 pt-12 md:px-11">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <p className="m-0 font-title type-h4 tracking-[-0.03em]">The educateU learner promise</p>
                <p className="m-0 type-caption font-medium text-[#0c7a5e]">Every course · every learner</p>
              </div>

              <ul className="m-0 mt-8 grid list-none gap-x-10 p-0 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {promises.map((label, i) => (
                  <li key={label} className="flex min-h-[104px] items-center gap-[15px] border-b border-[#06180b]/12 py-4 first:border-t sm:[&:nth-child(2)]:border-t lg:min-h-[72px] lg:[&:nth-child(2)]:border-t-0 xl:min-h-[104px] xl:[&:nth-child(2)]:border-t">
                    <motion.span variants={tick} custom={i} className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5]">
                      <Check size={12} />
                    </motion.span>
                    <motion.span variants={fade} custom={0.75 + i * 0.12} className="font-title type-h4 tracking-[-0.025em]">
                      {label}
                    </motion.span>
                  </li>
                ))}
              </ul>

              <div className="mt-11 flex items-end justify-between gap-6">
                <div>
                  <svg width="176" height="32" viewBox="0 0 176 32" fill="none" aria-hidden="true" className="text-[#0c7a5e]">
                    <motion.path
                      d="M2 26c6-10 12-16 16-12s-2 14 4 10 10-16 15-14 0 13 6 10 9-13 15-12 2 10 8 9 10-9 16-9 8 6 14 5 20-8 34-10 22-1 24-1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={{ hide: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.6, delay: 1.6, ease: "easeInOut" } } }}
                    />
                  </svg>
                  <p className="m-0 mt-3 type-small text-[#06180b]/70">Signed by the educateU team</p>
                </div>
                <motion.span
                  aria-hidden="true"
                  className="grid size-[92px] shrink-0 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] shadow-[0_14px_30px_-12px_rgb(12_122_94/0.6)]"
                  variants={{ hide: { scale: 0, rotate: -60 }, show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 220, damping: 12, delay: 2 } } }}
                  whileHover={reduce ? undefined : { rotate: 12, scale: 1.06 }}
                >
                  <svg width="30" height="36" viewBox="0 0 22 24" fill="none">
                    <circle cx="11" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m7 13.5-1.5 8.5 5.5-3 5.5 3-1.5-8.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
