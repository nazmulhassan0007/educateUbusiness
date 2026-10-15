"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion-budget";
import { formatPrice } from "@/lib/utils";
import type { HomeCourse } from "../awwwards/types";
import { EASE } from "./shared";

type Subject = {
  slug: string;
  name: string;
  courses: HomeCourse[];
  from: number;
  to: number;
  image: string;
};

// The order courses are listed in within a subject, from the design. Anything
// not named here follows, oldest first.
const LEAD = [
  /fire safety/i,
  /first aid/i,
  /manual handling/i,
  /mental health/i,
  /health & safety for/i,
  /reporting accidents/i,
  /de-escalation/i,
  /harassment/i,
];

// One entry per subject, largest first. Inside a subject the API lists newest
// first; the longest-standing courses lead instead, with the flagship ones on top.
function toSubjects(courses: HomeCourse[]): Subject[] {
  const bySlug = new Map<string, HomeCourse[]>();
  for (const c of [...courses].reverse()) {
    if (!c.categorySlug || !c.category) continue;
    bySlug.set(c.categorySlug, [...(bySlug.get(c.categorySlug) ?? []), c]);
  }
  const rank = (c: HomeCourse) => {
    const i = LEAD.findIndex((re) => re.test(c.title));
    return i < 0 ? LEAD.length : i;
  };
  return [...bySlug.entries()]
    .map(([slug, list]) => {
      const sorted = [...list].sort((a, b) => rank(a) - rank(b));
      const prices = list.map((c) => c.price);
      return {
        slug,
        name: list[0].category,
        courses: sorted,
        from: Math.min(...prices),
        to: Math.max(...prices),
        // The newest course's photo stands for the subject.
        image: [...list].reverse().find((c) => c.detail?.image)?.detail?.image ?? list.find((c) => c.thumbnailImage)?.thumbnailImage ?? "/courses/course-photo.jpeg",
      };
    })
    .sort((a, b) => b.courses.length - a.courses.length);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "2 hours" → "2 HRS", for the compact course rows.
function hours(label: string) {
  const n = label.match(/[\d.]+/)?.[0];
  return n ? `${n} ${n === "1" ? "HR" : "HRS"}` : label;
}

// What each category covers, shown under it when it is chosen. The catalogue
// carries only category names, so the copy lives here; a new category gets the
// general line until it is given its own.
const CATEGORY_NOTES: [RegExp, string][] = [
  [/health|safety/i, "Keep people safe at work, from fire and first aid to wellbeing and incident reporting."],
  [/compliance/i, "Meet your legal duties with confidence, from equality and safeguarding to fair decision-making."],
  [/cyber|\bit\b|data/i, "Protect your organisation online, from everyday cyber threats to handling data securely."],
  [/leader|manage/i, "Lead people well, from handling difficult situations to delivering great service."],
];

function summary(s: Subject) {
  return CATEGORY_NOTES.find(([re]) => re.test(s.name))?.[1] ?? "Practical, CPD-accredited training built around real workplace situations.";
}

// The design's own artwork (Figma "container 1312"): its arrow in ink and in
// paper, and the Health & Safety photo.
const ARROW_INK = "/home/subjects/arrow-ink.svg";
const ARROW_PAPER = "/home/subjects/arrow-cream.svg";
const SUBJECT_PHOTOS: [RegExp, string][] = [[/health/i, "/home/subjects/health-safety.jpg"]];
const photoFor = (s: Subject) => SUBJECT_PHOTOS.find(([re]) => re.test(s.name))?.[1] ?? s.image;

const MONO = "font-[family-name:var(--font-geist-mono)]";

/** The design's 16px arrow, as drawn (ink on mint, paper on dark). */
function DesignArrow({ ink = false }: { ink?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ink ? ARROW_INK : ARROW_PAPER} alt="" width={16} height={16} className="block size-4 shrink-0" />;
}

/**
 * Browse by categories (Figma "container 1312"): the subjects as a ruled list on
 * the left, the chosen one marked by a paper rule and a mint arrow; on the
 * right a panel with its photo and every course in it. Pointing at, focusing
 * or tapping a subject chooses it. Below 1024px the panel opens inside the
 * chosen row instead.
 */
export default function BrowseSubjects({ courses, children }: { courses: HomeCourse[]; children?: React.ReactNode }) {
  const subjects = useMemo(() => toSubjects(courses), [courses]);
  const [active, setActive] = useState(0);
  const current = subjects[active];
  if (!current) return null;

  return (
    <section id="subjects" aria-labelledby="subjects-title" className="ragged relative bg-[#06180b] px-5 py-20 text-[#f2efe6] md:px-10 md:py-28 lg:pb-36 lg:pt-32">
      <div className="mx-auto max-w-site">
        {/* Optional strip above the title (the homepage puts its client logos here). */}
        {children && <div className="-mt-6 mb-20 md:-mt-10 md:mb-24">{children}</div>}
        <motion.div
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <h2 id="subjects-title" className="m-0 shrink-0 font-title type-h2 font-normal tracking-[-0.03em] lg:whitespace-nowrap">
            Browse by categories
          </h2>
          <p className="m-0 max-w-[620px] type-lead text-[#f2efe6]/75">
            CPD-accredited courses across key workplace categories, each built for real working life.
          </p>
        </motion.div>

        <div className="mt-12 grid items-start gap-12 md:mt-16 lg:grid-cols-[minmax(0,560fr)_minmax(0,704fr)]">
          <div>
            <ul className="m-0 list-none p-0">
              {subjects.map((s, i) => (
                <SubjectRow key={s.slug} subject={s} open={i === active} onOpen={() => setActive(i)} />
              ))}
            </ul>
            <Link
              href="/courses"
              className="group mt-8 inline-flex items-center gap-2.5 type-body font-medium underline underline-offset-4 transition-colors hover:text-[#1ee9b5]"
            >
              Explore all courses
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <DesignArrow />
              </span>
            </Link>
          </div>

          <div className="sticky top-[calc(var(--home-nav-h)+24px)] hidden lg:block">
            <SubjectPanel subject={current} />
          </div>
        </div>
      </div>
    </section>
  );
}

// The rows' open/close transition, in ms (matches duration-500 below).
const ROW_MS = 500;
// How long the chosen row takes to glide up under the navbar.
const GLIDE_MS = 650;
// A strong ease-out, close to the rows' cubic-bezier(0.22, 1, 0.36, 1).
const easeOut = (t: number) => 1 - (1 - t) ** 4;

/**
 * Stacked layout only (below 1024px). Choosing a row brings it up under the
 * navbar so its panel opens in view, wherever the row was on the screen, in one
 * glide that runs alongside the rows opening and closing. The rows above change
 * height while it runs (the open one closes, names change size), and Safari has
 * no scroll anchoring, so the row's position is set every frame against the
 * glide's path rather than trusting one scroll call. A touch or wheel hands
 * the page back to the reader at once.
 */
function bringIntoView(row: HTMLElement) {
  if (window.matchMedia("(min-width: 1024px)").matches) return;
  const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 72;
  const from = row.getBoundingClientRect().top;
  const to = nav + 12;
  const instant = prefersReducedMotion();
  const begin = performance.now();
  const end = begin + Math.max(GLIDE_MS, ROW_MS + 100);
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  window.addEventListener("touchstart", cancel, { once: true, passive: true });
  window.addEventListener("wheel", cancel, { once: true, passive: true });
  const step = (now: number) => {
    if (cancelled) return;
    const t = instant ? 1 : Math.min(1, (now - begin) / GLIDE_MS);
    const want = from + (to - from) * easeOut(t);
    const off = row.getBoundingClientRect().top - want;
    if (Math.abs(off) >= 0.5) window.scrollBy(0, off);
    if (now < end) {
      requestAnimationFrame(step);
      return;
    }
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("wheel", cancel);
  };
  requestAnimationFrame(step);
}

function SubjectRow({ subject: s, open, onOpen }: { subject: Subject; open: boolean; onOpen: () => void }) {
  const row = useRef<HTMLLIElement>(null);
  // The panel stays rendered while it closes, so the row shrinks smoothly
  // instead of dropping its whole height in one frame.
  const [rendered, setRendered] = useState(open);
  if (open && !rendered) setRendered(true);

  const choose = () => {
    if (open) return;
    if (row.current) bringIntoView(row.current);
    onOpen();
  };

  return (
    <li ref={row} className="relative border-t border-[#f2efe6]/12 last:border-b">
      {/* The chosen subject's 2px paper rule, over the row's own hairline. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 -top-px h-0.5 origin-left bg-[#f2efe6] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={choose}
        // Keyboard focus chooses the row too; a tap's focus doesn't, so the click
        // above is the one place a tap opens it.
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && choose()}
        // Hover chooses only where the panel sits beside the list; in the stacked layout it would move rows under the pointer.
        onPointerEnter={(e) => e.pointerType === "mouse" && window.matchMedia("(min-width: 1024px)").matches && onOpen()}
        className="group/subj flex w-full items-start justify-between gap-6 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1ee9b5]"
      >
        <span className="min-w-0">
          <span
            className={`block font-title leading-[1.1] tracking-[-0.03em] transition-[font-size,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "text-[28px] text-[#f2efe6] sm:text-[32px] md:text-[40px] lg:text-[36px] xl:text-[44px]" : "text-[24px] text-[#f2efe6]/64 group-hover/subj:text-[#f2efe6]/90 sm:text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px]"
            }`}
          >
            {s.name}
          </span>
          <span
            className={`mt-1.5 block type-caption uppercase transition-colors duration-500 ${open ? "font-medium text-[#1ee9b5]" : `${MONO} text-[#f2efe6]/76`}`}
          >
            {plural(s.courses.length, "course")}
          </span>
          {/* The summary opens with the row (grid rows 0fr → 1fr animates to its natural height). */}
          <span className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <span className="overflow-hidden">
              <span className="block max-w-[440px] pt-2.5 type-body text-[#f2efe6]/72">{summary(s)}</span>
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`grid size-11 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "border-[#1ee9b5] bg-[#1ee9b5]" : "border-[#f2efe6]/22 group-hover/subj:translate-x-1 group-hover/subj:border-[#1ee9b5]"
          }`}
        >
          <DesignArrow ink={open} />
        </span>
      </button>

      {/* Phones and tablets: the panel opens under the chosen subject. */}
      <div
        onTransitionEnd={(e) => e.target === e.currentTarget && !open && setRendered(false)}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          {/* The panel's contents rise and come into focus a beat behind the row
              opening, so it reads as unfolding rather than as a block pushed in. */}
          <motion.div
            className="pb-8"
            initial={false}
            animate={open ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(4px)" }}
            transition={open ? { duration: 0.55, delay: 0.12, ease: EASE } : { duration: 0.25, ease: EASE }}
          >
            {(open || rendered) && <SubjectPanel subject={s} />}
          </motion.div>
        </div>
      </div>
    </li>
  );
}

function SubjectPanel({ subject: s }: { subject: Subject }) {
  const price = s.from === s.to ? `${formatPrice(s.from)} each` : `From ${formatPrice(s.from)}`;
  return (
    <div className="rounded-[28px] border border-[#f2efe6]/10 bg-[#f2efe6]/5 p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-[#f2efe6]/5 md:aspect-auto md:h-[320px] lg:h-[220px] xl:h-[280px] 2xl:h-[320px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={s.slug}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <Image src={photoFor(s)} alt="" fill sizes="(min-width:1024px) 704px, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute left-4 top-4 rounded-full bg-[#f2efe6]/94 px-3.5 py-2 type-caption font-medium text-[#06180b]">
          {s.name} · {plural(s.courses.length, "course")}
        </span>
      </div>

      <div className="px-3 pb-6 pt-7 sm:px-4 md:px-6">
        {/* The button always sits on the right: as a labelled pill from 540px, as the
            list's round arrow on phones, where a label would crush the heading. */}
        <div className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="flex min-w-0 flex-col gap-[9px]">
            <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.02em]">Courses in this subject</h3>
            <p className="m-0 type-caption font-medium uppercase text-[#1ee9b5]">{price} · Certificate included</p>
          </div>
          <Link
            href={`/courses?category=${encodeURIComponent(s.slug)}`}
            aria-label={`Explore all ${plural(s.courses.length, "course")} in ${s.name}`}
            className="grid size-11 shrink-0 place-items-center whitespace-nowrap rounded-full bg-[#1ee9b5] type-button font-medium text-[#06180b] transition-[background-color,transform] duration-300 hover:bg-[#5ef0c9] active:scale-[0.98] sm:size-auto sm:px-6 sm:py-[13px]"
          >
            <span className="hidden sm:inline">Explore all</span>
            <span className="sm:hidden">
              <DesignArrow ink />
            </span>
          </Link>
        </div>

        {/* One column on phones and in the laptop panel, two where a column fits a
            course name (768–1023px full width, and the design's 306px columns from
            1440px). Each holds room for the largest subject, so switching subjects
            never moves the page. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={s.slug}
            className="m-0 grid list-none content-start gap-x-6 p-0 pt-4 md:grid-cols-2 lg:min-h-[336px] lg:grid-cols-1 2xl:min-h-[216px] 2xl:grid-cols-2"
            initial="hide"
            animate="show"
            exit="hide"
            variants={{ show: { transition: { staggerChildren: 0.04 } }, hide: {} }}
          >
            {s.courses.map((c) => (
              <motion.li
                key={c.slug}
                variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Link
                  href={`/courses/${c.slug}`}
                  className="group/course flex h-full items-center justify-between gap-2 border-b border-[#f2efe6]/10 py-3.5 type-small lg:py-2.5 2xl:py-3.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]"
                >
                  <span className="min-w-0 transition-[color,transform] duration-300 group-hover/course:translate-x-1 group-hover/course:text-[#1ee9b5]">{c.title}</span>
                  <span className={`shrink-0 type-caption text-[#f2efe6]/64 ${MONO}`}>{hours(c.duration)}</span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <p className="m-0 mt-4 type-small text-[#f2efe6]/70">Instant access · self-paced online</p>
      </div>
    </div>
  );
}
