"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import Reveal from "./Reveal";
import { EASE, type HomeCms, type HomeCourse } from "./types";

type Subject = { name: string; image: string; courses: HomeCourse[] };

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The catalogue by subject: one tall photo panel per subject. The open panel
 * widens and lists its courses with time, price and add-to-cart; pointing at
 * (or tapping) another panel opens that one instead. On phones the panels stack
 * and open one at a time.
 */
export default function Subjects({ data, courses }: { data?: HomeCms["courses"]; courses: HomeCourse[] }) {
  const subjects = useMemo<Subject[]>(() => {
    const map = new Map<string, HomeCourse[]>();
    courses.forEach((c) => {
      if (!c.category) return;
      map.set(c.category, [...(map.get(c.category) ?? []), c]);
    });
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([name, list]) => ({
        name,
        courses: list,
        image: list.find((c) => c.detail?.image)?.detail?.image ?? list[0].thumbnailImage ?? "/courses/course-photo.jpeg",
      }));
  }, [courses]);
  const [open, setOpen] = useState(0);
  if (!subjects.length) return null;

  return (
    <section id="courses" className="scroll-mt-24 px-5 pb-24 md:px-10 md:pb-36" aria-labelledby="aw-courses-title">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="aw-courses-title" className="m-0 font-title text-[clamp(40px,6vw,104px)] leading-[0.92] tracking-[-0.045em] text-[#06180b]">
            {data?.title ?? "Popular Courses"}
          </h2>
          <p className="m-0 max-w-[46ch] text-lg leading-relaxed text-[#06180b]/65 lg:justify-self-end">{data?.description}</p>
        </Reveal>

        {/* Large screens: panels side by side. */}
        <div className="mt-14 hidden h-[680px] gap-3 lg:flex">
          {subjects.map((s, i) => {
            const on = i === open;
            return (
              <div
                key={s.name}
                onMouseEnter={() => setOpen(i)}
                className="relative min-w-0 overflow-hidden rounded-[32px] bg-[#06180b] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ flexGrow: on ? 5 : 1, flexBasis: 0 }}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className={`object-cover transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "scale-100 opacity-45" : "scale-110 opacity-70"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06180b] via-[#06180b]/50 to-[#06180b]/10" />

                {/* Closed: the subject reads up the panel. */}
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-expanded={on}
                  aria-label={`${s.name}, ${s.courses.length} courses`}
                  className={`absolute inset-0 flex flex-col items-center justify-between py-8 text-white transition-opacity duration-500 ${on ? "pointer-events-none opacity-0" : "opacity-100"}`}
                >
                  <span className="grid size-11 place-items-center rounded-full bg-white/15 font-title text-lg backdrop-blur">{s.courses.length}</span>
                  <span className="font-title text-[28px] tracking-[-0.02em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{s.name}</span>
                </button>

                {/* Open: the subject's courses. */}
                <AnimatePresence>
                  {on && (
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-between p-8 text-white xl:p-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.5 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <h3 className="m-0 font-title text-[clamp(40px,4vw,64px)] leading-[0.95] tracking-[-0.04em]">{s.name}</h3>
                        <span className="shrink-0 rounded-full bg-[#1ee9b5] px-4 py-1.5 text-[14px] text-[#06180b]">
                          {s.courses.length} course{s.courses.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {/* Long subjects go two-up, so every course shows without scrolling. */}
                      <ul className={`m-0 grid list-none gap-2 p-0 ${s.courses.length > 5 ? "grid-cols-2" : ""}`}>
                        {s.courses.map((c, k) => (
                          <motion.li
                            key={c.slug}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + k * 0.04, duration: 0.5, ease: EASE }}
                          >
                            <CourseRow course={c} />
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Phones and tablets: stacked panels, one open at a time. */}
        <div className="mt-10 grid gap-3 lg:hidden">
          {subjects.map((s, i) => {
            const on = i === open;
            return (
              <div key={s.name} className="overflow-hidden rounded-[28px] bg-[#06180b] text-white">
                <button type="button" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} className="relative flex h-36 w-full items-end justify-between p-6 text-left">
                  <Image src={s.image} alt="" fill sizes="100vw" className="object-cover opacity-55" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#06180b] to-transparent" />
                  <span className="relative font-title text-[28px] leading-none tracking-[-0.02em]">{s.name}</span>
                  <span className="relative flex items-center gap-3 text-[14px]">
                    {s.courses.length}
                    <span className={`grid size-9 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 ${on ? "rotate-90" : ""}`}>{ARROW}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.ul
                      className="m-0 grid list-none gap-2 overflow-hidden p-0 px-3"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      {s.courses.map((c) => (
                        <li key={c.slug}>
                          <CourseRow course={c} />
                        </li>
                      ))}
                      <li className="h-1" />
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {data?.cta && (
          <div className="mt-14 flex justify-center">
            <Link
              href={data.cta.url}
              className="group flex items-center gap-3 rounded-full bg-[#06180b] py-2 pl-6 pr-2 text-[16px] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              {data.cta.text}
              <span className="grid size-10 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                {ARROW}
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CourseRow({ course: c }: { course: HomeCourse }) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((i) => i.course.slug === c.slug));
  const ref = useRef<HTMLButtonElement>(null);

  const add = () => {
    if (inCart) return useCartStore.getState().setIsOpen(true);
    flyToCart(ref.current);
    // The cart persists what it's given, so it gets the plain course, not the preview detail.
    const course = { ...c };
    delete course.detail;
    addItem(course, undefined, undefined, undefined, false);
  };

  return (
    <div className="group/row flex items-center gap-4 rounded-[18px] bg-white/[0.06] p-2 pr-3 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.12]">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-[12px] bg-white/10">
        <Image src={c.thumbnailImage || "/courses/course-photo.jpeg"} alt="" fill sizes="56px" className="object-cover" />
      </div>
      <Link href={`/courses/${c.slug}`} data-cursor="View" className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-white">{c.title}</span>
        <span className="mt-0.5 block text-[13px] text-white/55">
          {c.duration} · CPD certificate included
        </span>
      </Link>
      <span className="font-title text-[20px] text-white">{formatPrice(c.price)}</span>
      <button
        ref={ref}
        type="button"
        onClick={add}
        aria-label={inCart ? `${c.title} is in your cart` : `Add ${c.title} to cart`}
        className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
          inCart ? "bg-white text-[#06180b]" : "bg-[#1ee9b5] text-[#06180b] hover:bg-white"
        }`}
      >
        {inCart ? (
          <svg width="14" height="14" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="m2 5.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
