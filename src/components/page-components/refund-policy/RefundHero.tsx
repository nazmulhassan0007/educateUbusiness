"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;
const MONO = "font-[family-name:var(--font-geist-mono)]";

type Meta = { name: string; effective: string; status: string };

/**
 * The Refund Policy header: the headline on the left; on the right the policy
 * as a sheet of paper carrying its details (name, effective date, sections,
 * reading time) and its status as an ink stamp.
 *
 * Motion: the headline rises line by line; the sheet drops in at a tilt and
 * settles, leans toward the pointer, and the stamp comes down onto it last.
 */
export default function RefundHero({
  title,
  subtitle,
  meta,
  sections,
  minutes,
}: {
  title: string;
  subtitle?: string;
  meta: Meta;
  sections: number;
  minutes: number;
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

  return (
    <section
      aria-labelledby="refund-title"
      className="ragged relative overflow-hidden bg-[#04140a] px-5 pb-20 pt-[calc(var(--home-nav-h)+48px)] text-[#f2efe6] md:px-10 lg:pb-[120px] lg:pt-[calc(var(--home-nav-h)+96px)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_75%_at_78%_55%,#0e3d24_0%,rgb(9_42_24/0.5)_45%,transparent_80%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-15%] size-[820px] rounded-full bg-[#1ee9b5]/[0.05] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]"
      />

      <motion.div {...group} className="relative mx-auto grid max-w-site items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
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
                {title}
              </li>
            </ol>
          </motion.nav>
          <h1 id="refund-title" className="m-0 mt-7 font-title type-display font-normal tracking-[-0.05em] lg:mt-[30px]">
            <span className="sr-only">{title}: </span>
            {["Refunds,", "clearly set out."].map((l, i) => (
              <span key={l} aria-hidden="true" className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <motion.span className={`block ${i === 1 ? "text-[#1ee9b5]" : ""}`} variants={line} custom={0.1 + i * 0.1}>
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p variants={fade} custom={0.35} className="m-0 mt-7 max-w-[520px] type-lead text-white/80">
            {subtitle?.trim() ||
              "When you can get your money back, how much, and how long it takes. Every step of our refund policy, in order, with nothing in the small print."}
          </motion.p>
        </div>

        <Sheet meta={meta} sections={sections} minutes={minutes} />
      </motion.div>
    </section>
  );
}

function Sheet({ meta, sections, minutes }: { meta: Meta; sections: number; minutes: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), spring);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const rows = [
    { label: "Effective", value: meta.effective },
    { label: "Sections", value: String(sections) },
    { label: "Reading time", value: `${minutes} min` },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[460px] [perspective:1400px]">
      {/* The page under it, slightly askew. */}
      <motion.span
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, rotate: 6 }}
        animate={{ opacity: 1, rotate: -3 }}
        transition={{ duration: 1.2, delay: 0.45, ease: EASE }}
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[22px] bg-[#cfcabb]/80"
      />
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={{ rotateX, rotateY }}
        initial={reduce ? false : { opacity: 0, y: 80, rotate: 8 }}
        animate={{ opacity: 1, y: 0, rotate: 2.5 }}
        transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
        className="relative rounded-[22px] bg-[#f7f6f1] p-7 text-[#06180b] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.8),0_24px_48px_-24px_rgb(0_0_0/0.55)] sm:p-9"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]">educateU Business</span>
          <span className={`type-caption text-[#06180b]/45 ${MONO}`}>REF-POL</span>
        </div>
        <p className="m-0 mt-6 font-title type-h2 font-normal tracking-[-0.03em]">{meta.name}</p>

        <dl className="m-0 mt-7 border-t border-[#06180b]/12">
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + i * 0.08, ease: EASE }}
              className="flex items-baseline justify-between gap-6 border-b border-[#06180b]/12 py-3.5"
            >
              <dt className="type-small text-[#06180b]/55">{r.label}</dt>
              <dd className={`m-0 text-right type-small font-medium ${MONO}`}>{r.value}</dd>
            </motion.div>
          ))}
        </dl>

        {/* Lines of text, suggested. */}
        <div aria-hidden="true" className="mt-7 flex flex-col gap-2.5">
          {[100, 92, 96, 64].map((w, i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.2 + i * 0.07, ease: EASE }}
              style={{ width: `${w}%` }}
              className="block h-2 origin-left rounded-full bg-[#06180b]/[0.07]"
            />
          ))}
        </div>

        {/* The stamp. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 2.4, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 1.7 }}
          className="absolute -bottom-7 -right-4 grid size-[132px] place-items-center rounded-full border-[3px] border-[#0c7a5e] bg-[#f7f6f1]/60 text-[#0c7a5e] backdrop-blur-[1px] sm:-right-8 sm:size-[150px]"
        >
          <span className="absolute inset-[7px] rounded-full border border-dashed border-[#0c7a5e]/60" />
          <span className="text-center">
            <span className={`block text-[10px] tracking-[0.2em] ${MONO}`}>STATUS</span>
            <span className="mt-1 block font-title text-[22px] uppercase leading-none tracking-[-0.02em] sm:text-[24px]">{meta.status}</span>
            <span className={`mt-1 block text-[10px] tracking-[0.12em] ${MONO}`}>{meta.effective.toUpperCase()}</span>
          </span>
        </motion.div>
        {/* The stamp's impact: one ring that spreads and fades. */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.6, 1, 1.5] }}
            transition={{ duration: 0.8, delay: 1.78, ease: "easeOut" }}
            className="absolute -bottom-7 -right-4 size-[132px] rounded-full border-2 border-[#1ee9b5] sm:-right-8 sm:size-[150px]"
          />
        )}
      </motion.div>
    </div>
  );
}
