"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import { Arrow } from "@/components/page-components/concepts/shared";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import { htmlToLines } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export type SupportBannerContent = {
  title: string;
  subtitle?: string;
  breadcrumb_label: string;
};

/** A section further down the page the header's board jumps to. */
export type SupportTopic = { label: string; id: string; hint: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Support Hub's header, built like the other pages' headers: breadcrumb,
 * a two-line display title with the second line in mint, the CMS's subtitle,
 * and on the right a board of the help on this page that jumps to each part.
 *
 * Motion: as on the other headers, the title rises line by line and the rest
 * fades up after it; the board's rows then slide in one after another. The
 * mint row follows the pointer and its arrow turns to point down the page.
 */
export default function SupportBanner({
  title,
  subtitle,
  breadcrumb_label,
  topics,
}: SupportBannerContent & { topics: SupportTopic[] }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const [active, setActive] = useState(0);

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", animate: "show" };
  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };
  const line: Variants = {
    hide: { y: "105%" },
    show: (d: number) => ({ y: "0%", transition: { duration: 1, delay: d, ease: EASE } }),
  };

  // Two lines as on the other headers: the CMS's own break, else the last word on its own line.
  const given = htmlToLines(title);
  const words = (given[0] ?? "").split(" ");
  const lines = given.length > 1 ? given.slice(0, 2) : words.length > 1 ? [words.slice(0, -1).join(" "), words.at(-1)!] : given;

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(`#${id}`, { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84), immediate: !!reduce });
  };

  return (
    <section
      aria-labelledby="support-title"
      className="ragged relative overflow-hidden bg-[#04140a] px-5 pb-24 pt-[calc(var(--home-nav-h)+56px)] text-[#f2efe6] md:px-10 lg:pb-[136px] lg:pt-[calc(var(--home-nav-h)+115px)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_85%_30%,#0e3d24_0%,rgb(9_42_24/0.55)_40%,transparent_75%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-[-20%] size-[900px] rounded-full bg-[#1ee9b5]/[0.05] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]" />

      <motion.div {...group} className="relative mx-auto flex max-w-site flex-col gap-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="min-w-0">
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
                {breadcrumb_label}
              </li>
            </ol>
          </motion.nav>

          <h1 id="support-title" className="m-0 mt-8 font-title type-display font-normal tracking-[-0.055em] lg:mt-[30px]">
            {lines.map((l, i) => (
              <span key={l} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <motion.span className={`block ${i === lines.length - 1 && lines.length > 1 ? "text-[#1ee9b5]" : ""}`} variants={line} custom={0.1 + i * 0.1}>
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          {subtitle && (
            <motion.p variants={fade} custom={0.35} className="m-0 mt-6 max-w-[540px] type-lead text-white/80 lg:mt-[22px]">
              {subtitle}
            </motion.p>
          )}
        </div>

        {topics.length > 0 && (
          <motion.nav
            aria-label="On this page"
            variants={fade}
            custom={0.45}
            onPointerLeave={() => setActive(0)}
            className="w-full shrink-0 overflow-hidden rounded-[16px] border border-white/[0.09] bg-[#051d14]/90 lg:mb-[3px] lg:w-[460px]"
          >
            <p className="m-0 flex h-[54px] items-center justify-between border-b border-white/[0.07] px-6 font-[family-name:var(--font-geist-mono)] type-caption uppercase tracking-[0.08em] text-white/60">
              <span>On this page</span>
              <span>{pad(topics.length)}</span>
            </p>
            <ul className="m-0 list-none p-0">
              {topics.map((t, i) => {
                const on = i === active;
                return (
                  <motion.li
                    key={t.id}
                    variants={{ hide: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.55 + i * 0.07, ease: EASE } } }}
                    className="relative border-b border-white/[0.06] last:border-b-0"
                  >
                    {on && (
                      <motion.span
                        layoutId="support-board-row"
                        aria-hidden="true"
                        className="absolute inset-0 bg-[#0b3a2c]"
                        transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      />
                    )}
                    <a
                      href={`#${t.id}`}
                      onClick={jump(t.id)}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className="relative grid grid-cols-[32px_minmax(0,1fr)_36px] items-center gap-3 px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1ee9b5]"
                    >
                      <span className={`font-[family-name:var(--font-geist-mono)] type-caption tabular-nums transition-colors duration-300 ${on ? "text-[#1ee9b5]" : "text-white/45"}`}>{pad(i + 1)}</span>
                      <span className="min-w-0">
                        <span className={`block truncate type-h4 font-medium transition-colors duration-300 ${on ? "text-[#1ee9b5]" : "text-[#f2efe6]"}`}>{t.label}</span>
                        <span className="block truncate type-small text-white/60">{t.hint}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid size-9 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ${
                          on ? "rotate-90 border-[#1ee9b5] bg-[#1ee9b5] text-[#06180b]" : "border-white/25 text-white"
                        }`}
                      >
                        <Arrow size={12} />
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </motion.div>
    </section>
  );
}
