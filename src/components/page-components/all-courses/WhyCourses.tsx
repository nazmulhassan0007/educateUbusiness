"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

export type WhyCoursesContent = { title?: string; sub_title?: string };

type Tab = "Lessons" | "Resources" | "Certificate";
const TABS: Tab[] = ["Lessons", "Resources", "Certificate"];

// The design's words (the CMS holds longer versions of the same four points).
// `tab` is the part of the course card each point is about; `path` its connector.
const FEATURES = [
  {
    title: "Workplace-ready training",
    body: "Every course is built around real workplace scenarios, so learners can apply what they know from day one.",
    side: "left",
    top: 63,
    tab: "Lessons" as Tab,
    path: "M315 73 V332 H353",
  },
  {
    title: "Learn at your own pace",
    body: "Self-paced and accessible from any device. No fixed start dates, no classroom, no disruption to your working day.",
    side: "left",
    top: 425,
    tab: "Lessons" as Tab,
    path: "M315 332 V476 H353",
  },
  {
    title: "Always up to date",
    body: "Our courses are updated in line with current legislation, so your team is always trained to the latest standard.",
    side: "right",
    top: 124,
    tab: "Resources" as Tab,
    path: "M1017 124 H995 V368 H956",
  },
  {
    title: "CPD certificate included",
    body: "Every learner receives a CPD certificate upon completion, recognised by employers across the UK.",
    side: "right",
    top: 474,
    tab: "Certificate" as Tab,
    path: "M1017 474 H995 V610 H956",
  },
] as const;

// The dashed lines, drawn whole; the active feature's stretch lights over them.
const BASE = ["M315 73 V476", "M315 332 H353", "M315 476 H353", "M1017 124 H995 V368 H956", "M1017 474 H995 V610 H956"];

// Seconds each point stays lit before the next, when nobody is pointing at one.
const DWELL = 4.5;

function LessonRow({ name, done, progress, i }: { name: string; done?: boolean; progress?: number; i: number }) {
  return (
    <li className="flex h-[55px] items-center gap-3 border-b border-[#06180b]/[0.08] last:border-b-0">
      <motion.span
        className={`grid size-[25px] place-items-center rounded-full ${done ? "bg-[#0c7a5e] text-white" : "bg-[#06180b]/10"}`}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 360, damping: 16, delay: 0.1 + i * 0.1 } }}
      >
        {done && <Check size={10} />}
      </motion.span>
      <span className="type-body font-medium">{name}</span>
      <span className="ml-auto flex items-center gap-3 type-small">
        {done ? (
          <span className="text-[#0c7a5e]">Complete</span>
        ) : (
          <>
            <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-[#06180b]/10 sm:block">
              <motion.span className="block h-full rounded-full bg-[#1ee9b5]" initial={{ width: 0 }} animate={{ width: `${progress}%`, transition: { duration: 1.2, delay: 0.4, ease: EASE } }} />
            </span>
            <span className="text-[#06180b]/65">In progress · {progress}%</span>
          </>
        )}
      </span>
    </li>
  );
}

function Panel({ tab }: { tab: Tab }) {
  if (tab === "Lessons")
    return (
      <ul className="m-0 list-none p-0">
        <LessonRow name="Lesson 1" done i={0} />
        <LessonRow name="Lesson 2" done i={1} />
        <LessonRow name="Lesson 3" progress={40} i={2} />
      </ul>
    );
  if (tab === "Resources")
    return (
      <ul className="m-0 list-none p-0">
        {[
          ["Fire safety checklist", "PDF · keep after you finish"],
          ["Industry updates", "New guidance, as it changes"],
          ["Next: Emergency First Aid at Work", "Further learning"],
        ].map(([t, s], i) => (
          <motion.li
            key={t}
            // Phones stack the note under the title; from 640px it sits on the right.
            className="flex h-[55px] items-center gap-3 border-b border-[#06180b]/[0.08] last:border-b-0"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.45, delay: i * 0.07, ease: EASE } }}
          >
            <span className="grid size-[25px] place-items-center rounded-full bg-[#1ee9b5]/30 text-[#0c7a5e]">
              <svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M3 1.5h4l2.5 2.5v6.5H3z M7 1.5V4h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
              <span className="truncate type-small font-medium sm:type-body">{t}</span>
              <span className="truncate type-caption text-[#06180b]/65 sm:ml-auto sm:shrink-0 sm:type-small">{s}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    );
  return (
    <motion.div
      className="flex h-[165px] flex-col items-center justify-center rounded-[10px] border border-[#0c7a5e]/30 bg-[#f7f6f1] text-center"
      initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: EASE } }}
    >
      <span className="type-caption font-medium text-[#0c7a5e]">Certificate of completion</span>
      <span className="mt-1.5 font-title type-h4 tracking-[-0.035em]">Your name here</span>
      <span className="mt-1 h-px w-1/2 bg-[#06180b]/15" />
      <span className="mt-2 type-caption text-[#06180b]/70">Fire Safety Awareness · CPD certified</span>
    </motion.div>
  );
}

/** The course card in the middle of the section; its tab follows the lit point. */
function CourseCard({ tab, onTab, id }: { tab: Tab; onTab: (t: Tab) => void; id: string }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [3, -3]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 18 });

  return (
    <motion.div
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1600 }}
      className="relative overflow-hidden rounded-[20px] bg-[#f0ede5] shadow-[0_50px_90px_-40px_rgb(6_24_11/0.35)]"
    >
      <div className="relative aspect-[600/240] overflow-hidden">
        <Image src="/hero/fire-safety.jpg" alt="Firefighters training with a hose" fill sizes="600px" className="object-cover motion-safe:animate-[why-zoom_14s_ease-in-out_infinite_alternate]" />
      </div>
      <div className="px-6 pb-7 pt-7 md:px-8">
        <p className="m-0 font-title type-h4 tracking-[-0.035em]">Fire Safety Awareness</p>
        <ul className="m-0 mt-3.5 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 type-small font-medium text-[#06180b]/85">
          {["2 hours", "Self-paced, any device", "CPD certified"].map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <span className="size-[5px] rounded-full bg-[#0c7a5e]" />
              {m}
            </li>
          ))}
        </ul>
        <div role="tablist" aria-label="Course" className="mt-5 flex gap-6 border-b border-[#06180b]/10 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={t === tab}
              onClick={() => onTab(t)}
              className={`relative type-small transition-colors ${t === tab ? "font-medium text-[#06180b]" : "text-[#06180b]/60 hover:text-[#06180b]"}`}
            >
              {t}
              {t === tab && <motion.span layoutId={`why-tab-${id}`} className="absolute inset-x-0 -bottom-[3px] h-[1.5px] bg-[#06180b]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="h-[165px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <Panel tab={tab} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex items-center gap-3.5 rounded-[10px] bg-white px-4 py-4">
          <span className={`grid size-[42px] shrink-0 place-items-center rounded-full bg-[#1ee9b5] ${tab === "Certificate" ? "motion-safe:animate-[why-pulse_1.6s_ease-out_2]" : ""}`}>
            <svg aria-hidden="true" width="16" height="19" viewBox="0 0 22 24" fill="none">
              <circle cx="11" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="m7 13.5-1.5 8.5 5.5-3 5.5 3-1.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block type-body font-medium">CPD certificate</span>
            <span className="block type-small text-[#06180b]/65">{tab === "Certificate" ? "Yours to download and share, for good" : "Unlocks when you finish the last lesson"}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Why choose our courses: the title and line, then a course card in the
 * middle with four reasons around it, each tied to the card by a dashed line.
 *
 * Motion: the title rises word by word; the card lifts in and leans toward
 * the pointer; the lines draw, then the reasons arrive. The reasons light in
 * turn (or under the pointer), their line drawing over in mint while the
 * card switches to the tab that reason is about.
 */
export default function WhyCourses({ data }: { data?: WhyCoursesContent }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const narrow = useRef<HTMLDivElement>(null);
  // Only one layout shows at a time (the other is display:none and never in
  // view), so either counts as the section having been seen.
  const seenWide = useInView(stage, { once: true, margin: "-20%" });
  const seenNarrow = useInView(narrow, { once: true, margin: "-20%" });
  const seen = seenWide || seenNarrow;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [tab, setTab] = useState<Tab>("Lessons");

  // Step through the reasons while the section is on screen and nobody holds one.
  useEffect(() => {
    if (reduce || held || !seen) return;
    const id = window.setTimeout(() => {
      const next = (active + 1) % FEATURES.length;
      setActive(next);
      setTab(FEATURES[next].tab);
    }, DWELL * 1000);
    return () => window.clearTimeout(id);
  }, [active, held, seen, reduce]);

  const light = (i: number) => {
    setActive(i);
    setTab(FEATURES[i].tab);
  };

  const raw = data?.title?.trim() || "Why choose our courses";
  const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  // The paragraph as signed off; it no longer follows the CMS's sub_title.
  const sub =
    "educateU Business delivers workplace-ready CPD training for teams and individuals across the UK. Every course is built around current legislation and real workplace needs, so your people are always trained to the right standard.";

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const up: Variants = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.06, ease: EASE } }) };
  const fade: Variants = { hide: { opacity: 0, y: 24 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }) };

  const feature = (f: (typeof FEATURES)[number], i: number, cls = "") => {
    const on = i === active;
    return (
      <motion.div
        key={f.title}
        variants={{ hide: { opacity: 0, x: f.side === "left" ? -30 : 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, delay: 1 + (i % 2) * 0.15, ease: EASE } } }}
        className={`group cursor-default ${cls}`}
        onPointerEnter={() => {
          setHeld(true);
          light(i);
        }}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => {
          setHeld(true);
          light(i);
        }}
        onBlur={() => setHeld(false)}
        tabIndex={0}
        aria-current={on}
      >
        <h3 className={`relative m-0 pl-[21px] font-title type-h4 font-normal tracking-[-0.035em] transition-colors duration-500 ${on ? "text-[#06180b]" : "text-[#06180b]/80"}`}>
          <span aria-hidden="true" className="absolute left-0 top-[-7px] grid size-[11px] place-items-center">
            <span className={`relative size-[11px] rounded-full border-2 border-[#06180b]/80 transition-colors duration-500 ${on ? "bg-[#1ee9b5]" : "bg-[#1ee9b5]/70"}`} />
          </span>
          {f.title}
        </h3>
        <p className={`m-0 mt-3 type-body transition-colors duration-500 ${on ? "text-[#06180b]/80" : "text-[#06180b]/65"}`}>{f.body}</p>
      </motion.div>
    );
  };

  // Under 1392px each reason is a card: number, title and line. The lit one
  // is raised, and a bar along its foot runs down the time until the next.
  // Tapping or hovering one lights it and holds it, like the wide layout.
  const reasonCard = (f: (typeof FEATURES)[number], i: number) => {
    const on = i === active;
    return (
      <motion.div
        key={f.title}
        variants={fade}
        custom={0.2 + i * 0.08}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        onClick={() => light(i)}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          light(i);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          setHeld(true);
          light(i);
        }}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        className={`relative flex cursor-pointer gap-4 overflow-hidden rounded-[18px] border p-5 text-left outline-none transition-[background-color,border-color,box-shadow] duration-500 focus-visible:ring-[3px] focus-visible:ring-[#0c7a5e]/40 md:p-6 ${
          on
            ? "border-[#0c7a5e]/25 bg-white shadow-[0_24px_48px_-30px_rgb(6_24_11/0.4)]"
            : "border-[#06180b]/[0.08] bg-white/40 hover:border-[#06180b]/15 hover:bg-white/70"
        }`}
      >
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-[12px] font-title text-[15px] tabular-nums transition-colors duration-500 ${
            on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b]/[0.06] text-[#06180b]/55"
          }`}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="flex min-w-0 flex-col">
          <h3 className={`m-0 font-title text-[20px] font-normal leading-[1.15] tracking-[-0.03em] transition-colors duration-500 md:text-[22px] ${on ? "text-[#06180b]" : "text-[#06180b]/80"}`}>
            {f.title}
          </h3>
          <p className={`m-0 mt-2 type-small transition-colors duration-500 ${on ? "text-[#06180b]/75" : "text-[#06180b]/60"}`}>{f.body}</p>
        </span>
        {on && seen && !held && !reduce && (
          <motion.span
            key={active}
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[3px] bg-[#1ee9b5]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: DWELL, ease: "linear" }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <section aria-labelledby="why-title" className="ragged overflow-hidden bg-[#f7f6f1] px-5 pb-24 pt-20 text-[#06180b] md:px-10 lg:pb-[150px] lg:pt-[140px]">
      <div className="mx-auto max-w-site">
        <motion.div {...group} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <h2 id="why-title" className="m-0 font-title type-h2 font-normal tracking-[-0.055em] min-[1392px]:shrink-0 min-[1392px]:whitespace-nowrap lg:mt-3">
            {title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-top">
                <motion.span className="inline-block" variants={up} custom={i}>
                  {w}
                  {" "}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.25} className="m-0 max-w-[560px] type-lead text-[#06180b]/75 lg:mt-[-6px]">
            {sub}
          </motion.p>
        </motion.div>

        {/* Wide screens: the card with the reasons around it, joined by lines. */}
        <motion.div ref={stage} {...group} className="relative mx-auto mt-14 hidden h-[675px] w-[1312px] min-[1392px]:block lg:mt-[76px]">
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" width="1312" height="675" fill="none">
            {BASE.map((d, i) => (
              <motion.path
                key={d}
                d={d}
                stroke="#0c7a5e"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeDasharray="5 5"
                variants={{ hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.7 + i * 0.1 } } }}
              />
            ))}
            {FEATURES.map((f, i) => (
              <motion.path
                key={f.path}
                d={f.path}
                stroke="#1ee9b5"
                strokeWidth="2"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: i === active && seen ? 1 : 0, opacity: i === active && seen ? 1 : 0 }}
                transition={{ pathLength: { duration: i === active ? 0.9 : 0.3, ease: EASE }, opacity: { duration: 0.3 } }}
              />
            ))}
          </svg>

          <div className="absolute left-0 w-[296px]" style={{ top: FEATURES[0].top }}>{feature(FEATURES[0], 0)}</div>
          <div className="absolute left-0 w-[296px]" style={{ top: FEATURES[1].top }}>{feature(FEATURES[1], 1)}</div>
          <div className="absolute left-[1012px] w-[300px]" style={{ top: FEATURES[2].top - 12 }}>{feature(FEATURES[2], 2)}</div>
          <div className="absolute left-[1012px] w-[300px]" style={{ top: FEATURES[3].top - 12 }}>{feature(FEATURES[3], 3)}</div>

          <motion.div
            className="absolute left-[356px] top-0 w-[600px]"
            variants={{ hide: { opacity: 0, y: 60, rotateX: 8 }, show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1.1, delay: 0.2, ease: EASE } } }}
            style={{ transformPerspective: 1600 }}
          >
            <CourseCard id="wide" tab={tab} onTab={setTab} />
          </motion.div>
        </motion.div>

        {/* Narrower screens: phones and tablets get the card, then the reason
            cards under it (two across from 640px); from 1024px the reasons
            stack in a column beside the card. */}
        <motion.div
          ref={narrow}
          {...group}
          className="mt-10 md:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-10 xl:gap-16 min-[1392px]:hidden"
        >
          <motion.div variants={fade} custom={0.1} className="mx-auto w-full max-w-[600px] lg:order-2 lg:max-w-none">
            <CourseCard id="narrow" tab={tab} onTab={setTab} />
          </motion.div>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:order-1 lg:mt-0 lg:grid-cols-1">
            {FEATURES.map((f, i) => reasonCard(f, i))}
          </div>
        </motion.div>
      </div>
      <style>{`
        @keyframes why-zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes why-pulse { 0% { box-shadow: 0 0 0 0 rgb(30 233 181 / 0.6); } 100% { box-shadow: 0 0 0 14px rgb(30 233 181 / 0); } }
      `}</style>
    </section>
  );
}
