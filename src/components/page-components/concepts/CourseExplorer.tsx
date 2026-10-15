"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { Arrow, Check, EASE, Glows, Plus, toCartCourse } from "./shared";

/**
 * The whole catalogue at a glance: every course as one row (title, subject,
 * length, price), and beside it a preview of the chosen course with what it
 * covers and what's included, so a buyer can compare without leaving the page.
 * Phones open the preview inside the row.
 */
export default function CourseExplorer({ data, courses, children }: { data?: HomeCms["courses"]; courses: HomeCourse[]; children?: React.ReactNode }) {
  const subjects = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))], [courses]);
  const [subject, setSubject] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(courses[0]?.slug ?? null);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const list = courses.filter(
    (c) =>
      (subject === "All" || c.category === subject) &&
      (!q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.keywords?.some((k) => k.toLowerCase().includes(q))),
  );
  // The preview always shows something from the current list.
  const shown = list.find((c) => c.slug === active) ?? list[0];

  return (
    <section id="courses" className="relative overflow-clip bg-[#0b3a28] px-5 pb-24 pt-10 text-[#f2efe6] md:px-10 md:pb-32 md:pt-14" aria-labelledby="c-reel">
      {/* overflow-clip, not hidden: hidden would make the section a scroll box and stop the preview sticking. */}
      <Glows
        spots={[
          { at: "left:-10% top:0%", size: "45vw", color: "rgb(30 233 181 / 0.28)" },
          { at: "right:-12% bottom:0%", size: "50vw", color: "rgb(30 233 181 / 0.18)" },
        ]}
      />
      <div className="relative mx-auto max-w-site">
        {children}
        <motion.div
          className="mt-20 flex flex-wrap items-end justify-between gap-8 md:mt-28"
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div>
            <p className="m-0 mb-4 type-caption text-[#1ee9b5]">
              {courses.length} courses · {subjects.length} subjects
            </p>
            <h2 id="c-reel" className="m-0 font-title type-h2 tracking-[-0.05em]">
              {data?.title ?? "Popular Courses"}
            </h2>
          </div>
          <p className="m-0 max-w-[42ch] type-lead text-white/65">{data?.description}</p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter by subject">
            {["All", ...subjects].map((s) => {
              const on = s === subject;
              const n = s === "All" ? courses.length : courses.filter((c) => c.category === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setSubject(s);
                    setOpenRow(null);
                  }}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 type-small transition-colors ${on ? "text-[#06180b]" : "glass text-white/80 hover:text-white"}`}
                >
                  {on && <motion.span layoutId="x-subject" className="absolute inset-0 rounded-full bg-[#1ee9b5]" transition={{ duration: 0.45, ease: EASE }} />}
                  <span className="relative">
                    {s} <span className={on ? "text-[#06180b]/55" : "text-white/40"}>{n}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <label className="glass flex items-center gap-2 rounded-full px-4 py-2.5 md:w-[280px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-white/50">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
              <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search courses</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
              className="min-w-0 flex-1 bg-transparent text-base md:text-[15px] text-white outline-none placeholder:text-white/45"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,580px)]">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {list.map((c, i) => (
              <Row
                key={c.slug}
                course={c}
                index={i}
                active={shown?.slug === c.slug}
                open={openRow === c.slug}
                onPick={() => setActive(c.slug)}
                onToggle={() => setOpenRow((v) => (v === c.slug ? null : c.slug))}
              />
            ))}
            {!list.length && <li className="glass rounded-[20px] p-8 text-center text-white/65">No courses match “{query}”.</li>}
          </ul>

          {/* Wide screens: the preview rides alongside the list. */}
          <div className="sticky top-24 hidden lg:block">
            <AnimatePresence mode="wait" initial={false}>
              {shown && (
                <motion.div
                  key={shown.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <Preview course={shown} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {data?.cta && (
          <div className="mt-12 flex justify-center">
            <Link href={data.cta.url} className="group flex items-center gap-3 rounded-full bg-[#1ee9b5] py-2 pl-6 pr-2 type-button font-medium text-[#06180b]">
              {data.cta.text}
              <span className="grid size-10 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform group-hover:translate-x-0.5">
                <Arrow />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function useCart(c: HomeCourse) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((it) => it.course.slug === c.slug));
  const toggle = () => (inCart ? useCartStore.getState().setIsOpen(true) : addItem(toCartCourse(c), undefined, undefined, undefined, false));
  return { inCart, toggle };
}

function Row({
  course: c,
  index,
  active,
  open,
  onPick,
  onToggle,
}: {
  course: HomeCourse;
  index: number;
  active: boolean;
  open: boolean;
  onPick: () => void;
  onToggle: () => void;
}) {
  const { inCart } = useCart(c);
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.04, ease: EASE }}
      // "Lit" = the previewed row on wide screens, or the opened row on phones: it turns white.
      data-active={active}
      data-open={open}
      className="group overflow-hidden rounded-[20px] bg-white/[0.06] ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.1] max-lg:data-[open=true]:bg-white max-lg:data-[open=true]:text-[#06180b] lg:data-[active=true]:bg-white lg:data-[active=true]:text-[#06180b]"
    >
      <button
        type="button"
        onMouseEnter={onPick}
        onFocus={onPick}
        onClick={() => {
          onPick();
          onToggle();
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-2 pr-4 text-left md:gap-4"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-black/20 md:size-[72px]">
          <Image src={c.thumbnailImage || "/courses/course-photo.jpeg"} alt="" fill sizes="72px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 type-caption text-[#1ee9b5] max-lg:group-data-[open=true]:text-[#0c7a5e] lg:group-data-[active=true]:text-[#0c7a5e]">{c.category}</p>
          <p className="m-0 mt-0.5 line-clamp-2 type-h4 font-medium">{c.title}</p>
          <p className="m-0 mt-1 type-small opacity-60">
            {c.duration} · CPD certificate{inCart ? " · In your cart" : ""}
          </p>
        </div>
        <span className="shrink-0 font-title type-h4 tracking-[-0.02em]">{formatPrice(c.price)}</span>
        <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-white/10 transition-[transform,background-color,color] duration-300 md:grid lg:-translate-x-1 lg:group-data-[active=true]:translate-x-0 lg:group-data-[active=true]:bg-[#06180b] lg:group-data-[active=true]:text-[#1ee9b5] max-lg:group-data-[open=true]:rotate-90 max-lg:group-data-[open=true]:bg-[#06180b] max-lg:group-data-[open=true]:text-[#1ee9b5]">
          <Arrow size={12} />
        </span>
      </button>
      {/* Phones and tablets: the preview opens inside the row. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="px-4 pb-4">
              <Details course={c} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/** The chosen course on a white card: picture, overview, modules, inclusions, price and buttons. */
function Preview({ course: c }: { course: HomeCourse }) {
  return (
    <article className="overflow-hidden rounded-[28px] bg-white p-2 text-[#06180b] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.5)]">
      <div className="relative aspect-[2/1] overflow-hidden rounded-[22px] [@media(min-height:960px)]:aspect-[16/9]">
        <Image src={c.detail?.image || c.thumbnailImage || "/courses/course-photo.jpeg"} alt="" fill sizes="580px" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 type-caption backdrop-blur">{c.category}</span>
      </div>
      <div className="px-5 pb-5 pt-5">
        <h3 className="m-0 font-title type-h3 tracking-[-0.03em]">{c.title}</h3>
        <Details course={c} />
      </div>
    </article>
  );
}

function Details({ course: c, compact = false }: { course: HomeCourse; compact?: boolean }) {
  const { inCart, toggle } = useCart(c);
  const d = c.detail;
  const modules = d?.modules ?? [];
  const shownModules = modules.slice(0, compact ? 4 : 6);
  const meta = [c.duration, d?.level, d?.delivery].filter(Boolean) as string[];

  return (
    <div>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
        {meta.map((m) => (
          <li key={m} className="rounded-full bg-[#06180b]/[0.06] px-3 py-1 type-caption">
            {m}
          </li>
        ))}
      </ul>
      <p className={`m-0 mt-4 type-body text-[#06180b]/70 ${compact ? "line-clamp-4" : "line-clamp-3"}`}>{d?.overview ?? c.description}</p>

      {shownModules.length > 0 && (
        <div className="mt-5">
          <p className="m-0 type-caption font-medium text-[#06180b]/50">What you&apos;ll cover</p>
          <ol className="m-0 mt-2 grid list-none gap-x-4 gap-y-1.5 p-0 sm:grid-cols-2">
            {shownModules.map((m, i) => (
              <li key={m} className="flex gap-2 type-small">
                <span className="w-5 shrink-0 tabular-nums text-[#0c7a5e]">{String(i + 1).padStart(2, "0")}</span>
                <span className="line-clamp-2">{m}</span>
              </li>
            ))}
          </ol>
          {modules.length > shownModules.length && <p className="m-0 mt-2 type-small text-[#06180b]/50">+ {modules.length - shownModules.length} more modules</p>}
        </div>
      )}

      {!compact && d?.certificate && (
        <p className="m-0 mt-5 flex items-center gap-2 type-small">
          <span className="grid size-5 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
            <Check size={10} />
          </span>
          {d.certificate}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-[#06180b]/10 pt-4">
        <span className="mr-auto font-title type-h3 tracking-[-0.03em]">
          {formatPrice(c.price)}
          {c.originalPrice ? <s className="ml-2 type-small text-[#06180b]/40">{formatPrice(c.originalPrice)}</s> : null}
        </span>
        <Link href={`/courses/${c.slug}`} className="rounded-full px-4 py-3 type-button font-medium text-[#06180b] ring-1 ring-[#06180b]/15 transition-colors hover:bg-[#06180b]/5">
          View course
        </Link>
        <button
          type="button"
          onClick={toggle}
          className={`flex items-center gap-2 rounded-full px-4 py-3 type-button font-medium transition-colors ${inCart ? "bg-[#06180b] text-white" : "bg-[#1ee9b5] text-[#06180b] hover:bg-[#06180b] hover:text-white"}`}
        >
          {inCart ? <Check /> : <Plus />}
          {inCart ? "In cart" : "Add"}
        </button>
      </div>
    </div>
  );
}
