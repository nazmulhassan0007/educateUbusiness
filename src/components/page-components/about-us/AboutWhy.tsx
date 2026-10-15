"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

type Feature = { title: string; description: string };
export type AboutWhyContent = { title?: string; sub_title?: string; features?: Feature[] };

const DEFAULT = {
  title: "Why educateU?",
  sub: "Many online learning platforms make simple learning harder than it needs to be.",
  features: [
    { title: "Clear enrolment with instant access", description: "Get started in minutes and begin learning without delays." },
    { title: "Flexible learning that fits around work and life", description: "Learn on your schedule, from anywhere, anytime." },
    { title: "Transparent outcomes and certification", description: "Know what you’ll achieve and earn certifications you can trust." },
  ],
};

// The CMS text, tidied to the design (its subtitle runs on; the design keeps the first sentence).
function fromCms(data?: AboutWhyContent) {
  const first = data?.sub_title?.trim().match(/^[^.!?]+[.!?]/)?.[0];
  const features = (data?.features ?? [])
    .map((f) => ({ title: f.title?.trim(), description: f.description?.trim().replace(/([^.!?])$/, "$1.") }))
    .filter((f): f is Feature => Boolean(f.title && f.description));
  return {
    title: data?.title?.trim() || DEFAULT.title,
    sub: first || DEFAULT.sub,
    features: features.length === 3 ? features : DEFAULT.features,
  };
}

/**
 * Why educateU: a pale panel with the three moments of a course (enrolment
 * confirmed, picking up where you left off, the certificate) above a
 * numbered track, and the three reasons beneath.
 *
 * Motion: when the panel arrives the cards rise one after another, the
 * check pops, the progress bar fills and the certificate settles into its
 * tilt; the dashed track draws from step to step, lighting each number.
 */
export default function AboutWhy({ data, price }: { data?: AboutWhyContent; price: string }) {
  const { title, sub, features } = fromCms(data);
  const reduce = useReducedMotion();
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };

  const card: Variants = {
    hide: { opacity: 0, y: 50 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.15 + i * 0.2, ease: EASE } }),
  };
  const dot: Variants = {
    hide: { scale: 0.4, opacity: 0 },
    show: (i: number) => ({ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 16, delay: 0.9 + i * 0.45 } }),
  };
  const line: Variants = {
    hide: { scaleX: 0 },
    show: (i: number) => ({ scaleX: 1, transition: { duration: 0.5, delay: 1.05 + i * 0.45, ease: "linear" } }),
  };
  const fade: Variants = {
    hide: { opacity: 0, y: 20 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: EASE } }),
  };

  // Column starts in the design: 56px in, then every 456px.
  const cols = "lg:grid-cols-[456fr_456fr_344fr] 2xl:grid-cols-[456px_456px_minmax(0,1fr)]";

  return (
    <section aria-labelledby="why-title" className="ragged bg-[#f7f6f1] px-5 py-24 text-[#06180b] md:px-10 lg:pb-[120px] lg:pt-[140px]">
      <div className="mx-auto max-w-site">
        <motion.div {...group} className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <motion.h2 id="why-title" variants={fade} custom={0} className="m-0 font-title type-h2 font-normal tracking-[-0.035em]">
            {title}
          </motion.h2>
          <motion.p variants={fade} custom={0.12} className="m-0 max-w-[440px] type-lead text-[#06180b]/75 lg:mt-1">
            {sub}
          </motion.p>
        </motion.div>

        {/* The panel. */}
        <motion.div
          {...group}
          className="relative mt-12 overflow-hidden rounded-[26px] bg-[#f2efe6] px-6 pb-8 pt-10 md:px-14 lg:mt-[60px] lg:h-[520px] lg:pb-0 lg:pt-0"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_54%_48%,rgb(30_233_181/0.3),transparent_75%)]"
            variants={{ hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.4 } } }}
          />

          <div className={`relative grid gap-6 sm:grid-cols-2 lg:h-full lg:gap-0 ${cols}`}>
            {/* 1. Enrolment confirmed. */}
            <motion.div variants={card} custom={0} className="lg:pt-[150px]">
              <div className="w-full max-w-[340px] rounded-[16px] bg-white p-6 shadow-[0_24px_50px_-28px_rgb(6_24_11/0.3)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5">
                <div className="flex items-start gap-3.5">
                  <motion.span
                    aria-hidden="true"
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]"
                    variants={{ hide: { scale: 0 }, show: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 12, delay: 0.75 } } }}
                  >
                    <Check size={13} />
                  </motion.span>
                  <div>
                    <p className="m-0 type-body font-medium">Enrolment confirmed</p>
                    <p className="m-0 mt-0.5 type-small text-[#06180b]/65">Fire Safety Awareness · {price}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#06180b]/10 pt-5">
                  <Link
                    href="/courses"
                    className="group inline-flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#06180b] px-[18px] type-button font-medium text-white transition-colors hover:bg-[#0c3a28]"
                  >
                    Start module 1
                    <span className="text-[#1ee9b5] transition-transform duration-300 group-hover:translate-x-0.5">
                      <Arrow size={12} />
                    </span>
                  </Link>
                  <span className="whitespace-nowrap type-small font-medium text-[#0c7a5e]">
                    Available now
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 2. Pick up where you left off. */}
            <motion.div variants={card} custom={1} className="lg:pt-[72px]">
              <div className="group w-full max-w-[340px] rounded-[16px] bg-white p-3.5 shadow-[0_24px_50px_-28px_rgb(6_24_11/0.3)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5">
                <div className="relative aspect-[312/150] overflow-hidden isolate rounded-[10px]">
                  <Image
                    src="/hero/fire-safety.jpg"
                    alt="Firefighters training with a hose"
                    fill
                    sizes="312px"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <div className="px-2 pb-2 pt-4">
                  <p className="m-0 type-body font-medium">Fire Safety Awareness</p>
                  <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-[#06180b]/10" role="progressbar" aria-label="Course progress" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
                    <motion.span
                      className="block h-full w-[42%] origin-left rounded-full bg-[#0c7a5e]"
                      variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, delay: 0.9, ease: EASE } } }}
                    />
                  </div>
                  <div className="mt-3.5 flex items-center justify-between type-small">
                    <span className="text-[#06180b]/65">Pick up where you left off</span>
                    <span className="flex items-center gap-1.5 font-medium text-[#0c7a5e]">
                      Resume
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        <Arrow size={12} />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. The certificate. */}
            <motion.div variants={card} custom={2} className="sm:col-span-2 lg:col-span-1 lg:pt-[120px]">
              <motion.div
                className="w-full max-w-[345px] rounded-[12px] bg-white p-2.5 2xl:w-[340px] 2xl:max-w-none shadow-[0_28px_56px_-28px_rgb(6_24_11/0.35)]"
                initial={reduce ? false : { rotate: -6 }}
                whileInView={{ rotate: 2 }}
                whileHover={reduce ? undefined : { rotate: 0, scale: 1.03 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.5 }}
              >
                <div className="flex flex-col items-center rounded-[8px] border border-[#0c7a5e]/45 px-6 pb-6 pt-7 text-center">
                  <span aria-hidden="true" className="grid size-[58px] place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
                    <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                      <circle cx="11" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                      <path d="m7 13.5-1.5 8.5 5.5-3 5.5 3-1.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="m-0 mt-4 type-small font-medium text-[#0c7a5e]">Certificate of completion</p>
                  <p className="m-0 mt-2 font-title type-h3 tracking-[-0.03em]">Your name here</p>
                  <span aria-hidden="true" className="mt-1.5 h-px w-[60%] bg-[#06180b]/15" />
                  <p className="m-0 mt-3 type-small text-[#06180b]/80">Fire Safety Awareness · CPD certified</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* The numbered track along the bottom of the panel. */}
          <div className={`absolute inset-x-14 bottom-[30px] hidden lg:grid ${cols}`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative flex items-center">
                <motion.span
                  variants={dot}
                  custom={i}
                  className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-[#06180b] type-caption font-medium text-[#1ee9b5] shadow-[0_0_0_6px_rgb(30_233_181/0.12)]"
                >
                  {i + 1}
                </motion.span>
                {i < 2 && (
                  <motion.span
                    aria-hidden="true"
                    variants={line}
                    custom={i}
                    className="h-px flex-1 origin-left border-t border-dashed border-[#06180b]/35"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* The three reasons. */}
        <ol className={`m-0 mt-12 grid list-none gap-10 p-0 sm:grid-cols-3 lg:mt-[58px] lg:gap-0 lg:px-14 ${cols}`}>
          {features.map((f, i) => (
            <motion.li key={f.title} {...group} variants={fade} custom={0.1 + i * 0.12} className="lg:pr-12 2xl:last:w-[336px] 2xl:last:pr-0">
              <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">
                <span className="mr-2 font-[family-name:var(--font-geist-mono)] type-caption text-[#0c7a5e] lg:hidden">0{i + 1}</span>
                {f.title}
              </h3>
              <p className="m-0 mt-4 max-w-[340px] type-body text-[#06180b]/70">{f.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
