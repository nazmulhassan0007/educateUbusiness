"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

export type AuthStep = { title: string; body?: string };

/**
 * The ground every auth page stands on: the dark hero the redesigned pages
 * share (it runs under the clear navbar — see OVER_FILM in SiteNav), the
 * headline on the left, the cream form card on the right, and under the
 * headline the steps of this flow.
 *
 * Motion: the headline rises line by line and the card slides in; the steps'
 * rail fills mint as the form moves on, each step lighting in turn. A new
 * `stage` swaps the card's contents with a short blur cross-fade.
 */
export default function AuthShell({
  crumb,
  title,
  subtitle,
  steps,
  current,
  stage,
  children,
}: {
  crumb: string;
  /** The headline, one entry per line; the last line is set in mint. */
  title: string[];
  subtitle: string;
  steps: AuthStep[];
  /** Index of the step in progress; `steps.length` means all are done. */
  current: number;
  /** Changes whenever the card shows a different step. */
  stage: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", animate: "show" };
  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };
  const line: Variants = {
    hide: { y: "105%" },
    show: (d: number) => ({ y: "0%", transition: { duration: 1, delay: d, ease: EASE } }),
  };
  // How far down the rail the mint has run: to the step in progress.
  const fill = steps.length > 1 ? Math.min(current, steps.length - 1) / (steps.length - 1) : 1;

  return (
    <section
      aria-labelledby="auth-title"
      className="relative overflow-hidden bg-[#04140a] px-5 pb-20 pt-[calc(var(--home-nav-h)+40px)] text-[#f2efe6] md:px-10 lg:min-h-svh lg:pb-[120px] lg:pt-[calc(var(--home-nav-h)+88px)]"
    >
      {/* The light falling from the top left, the same ground as Contact's hero. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_15%_10%,#0e3d24_0%,rgb(9_42_24/0.5)_45%,transparent_78%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-[20%] top-[35%] size-[760px] rounded-full bg-[#1ee9b5]/[0.045] blur-[120px] motion-safe:animate-[glow-drift_22s_ease-in-out_infinite]"
      />

      <motion.div
        {...group}
        className="relative mx-auto flex max-w-site flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-start lg:gap-x-20 xl:gap-x-28"
      >
        {/* Headline and steps share the left column from lg; on a phone this
            wrapper dissolves (`contents`) so the card can sit between them. */}
        <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-14">
          <div className="order-1 min-w-0 lg:order-none">
            <motion.nav variants={fade} custom={0} aria-label="Breadcrumb" className="type-small font-medium">
              <ol className="m-0 flex list-none items-center gap-2.5 p-0">
                <li>
                  <Link href="/" className="text-white/85 transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/40">
                  /
                </li>
                <li aria-current="page" className="text-[#1ee9b5]">
                  {crumb}
                </li>
              </ol>
            </motion.nav>
            <h1
              id="auth-title"
              className="m-0 mt-7 text-balance font-title type-h1 font-normal tracking-[-0.04em] lg:mt-[30px]"
            >
              {title.map((l, i) => (
                <span key={l} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                  <motion.span
                    className={`block ${i === title.length - 1 && title.length > 1 ? "text-[#1ee9b5]" : ""}`}
                    variants={line}
                    custom={0.1 + i * 0.1}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              variants={fade}
              custom={0.35}
              className="m-0 mt-6 max-w-[480px] type-lead text-white/80"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* The flow, lit up to where you are. */}
          <motion.div variants={fade} custom={0.5} className="order-3 min-w-0 lg:order-none">
            <ol aria-label="Steps" className="relative m-0 max-w-[440px] list-none p-0">
              <span aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px bg-white/15" />
              <span
                aria-hidden="true"
                className="absolute bottom-4 left-4 top-4 w-px origin-top bg-[#1ee9b5] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `scaleY(${fill})` }}
              />
              {steps.map((s, i) => {
                const done = i < current;
                const now = i === current;
                return (
                  <li key={s.title} aria-current={now ? "step" : undefined} className="relative flex gap-5 pb-7 last:pb-0">
                    <span
                      className={`relative grid size-8 shrink-0 place-items-center rounded-full type-small font-semibold transition-colors duration-500 ${
                        done || now ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#24503f] text-white"
                      }`}
                      style={{ transitionDelay: done ? `${i * 120}ms` : "0ms" }}
                    >
                      <span className="relative">{done ? <Check size={12} /> : i + 1}</span>
                    </span>
                    <div className="pt-0.5">
                      <p className={`m-0 type-lead font-medium transition-colors duration-500 ${done || now ? "text-white" : "text-white/70"}`}>
                        {s.title}
                        {done && <span className="sr-only"> (done)</span>}
                      </p>
                      {s.body && <p className="m-0 mt-1 type-small text-white/70">{s.body}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        </div>

        {/* The card: first after the headline on a phone, beside it from lg. */}
        <motion.div
          variants={{ hide: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.25, ease: EASE } } }}
          className="order-2 min-w-0 rounded-[18px] bg-[#f2efe6] px-6 py-8 text-[#06180b] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.65)] selection:bg-[#1ee9b5]/40 sm:px-9 sm:py-10 lg:order-none lg:col-start-2 lg:row-start-1"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage}
              initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } }}
              exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.22 } }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </section>
  );
}
