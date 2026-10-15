"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { planForQuantity, useCartStore, type PurchaseType } from "@/store/cart-store";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { Arrow, Check, EASE, HERO_VIDEO, Plus, toCartCourse, useCartCount } from "./shared";

const CANVAS = "#fafbf9";
const PLAN_NAME: Record<PurchaseType, string> = { personal: "Personal plan", group: "Group plan", enterprise: "Enterprise plan" };

/** Concept B, "Control Room": precise product UI, the hero is a working team order. */
export default function ConceptB({ cms, courses }: { cms: HomeCms; courses: HomeCourse[] }) {
  return (
    <div style={{ background: CANVAS }} className="min-h-screen font-sans text-[#06180b] antialiased">
      <Nav />
      <Hero cms={cms} courses={courses} />
      <Logos data={cms.trusted} />
      <Library data={cms.courses} courses={courses} />
      <footer className="border-t border-[#06180b]/8 px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 text-[13px] text-[#06180b]/50">
          <span>© All rights reserved. educateU is registered in England &amp; Wales No. 14400001.</span>
          <span>Concept B · Control Room</span>
        </div>
      </footer>
    </div>
  );
}

function Nav() {
  const count = useCartCount();
  return (
    <header className="sticky top-0 z-50 border-b border-[#06180b]/8 bg-[#fafbf9]/80 px-5 backdrop-blur-xl md:px-10">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between">
        <Link href="/new/b" className="flex items-center rounded-lg bg-[#06180b] px-2.5 py-1.5" aria-label="educateU Business home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-6 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden gap-7 text-[14px] text-[#06180b]/70 md:flex">
          {[
            ["Courses", "/courses"],
            ["About Us", "/about"],
            ["Contact Us", "/contact-us"],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="hover:text-[#06180b]">
              {l}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/cart" className="rounded-lg px-3 py-2 text-[#06180b]/70 hover:bg-[#06180b]/5">
            Cart <span className="ml-1 rounded-md bg-[#06180b]/8 px-1.5 py-0.5 text-[12px] tabular-nums">{count}</span>
          </Link>
          <Link href="/login" className="rounded-lg bg-[#06180b] px-4 py-2 text-white">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ cms, courses }: { cms: HomeCms; courses: HomeCourse[] }) {
  const hero = cms.hero ?? {};
  const [picked, setPicked] = useState<string[]>(() => courses.slice(0, 3).map((c) => c.slug));
  const [people, setPeople] = useState(25);
  const [film, setFilm] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const plan = planForQuantity(people);
  const chosen = courses.filter((c) => picked.includes(c.slug));
  const perPerson = chosen.reduce((s, c) => s + c.price, 0);
  const total = perPerson * people;

  const tween = useMotionValue(total);
  const shown = useTransform(tween, (v) => formatPrice(Math.round(v)));
  useEffect(() => {
    const a = animate(tween, total, { duration: 0.5, ease: EASE });
    return () => a.stop();
  }, [tween, total]);

  const addAll = () => {
    chosen.forEach((c, i) => addItem(toCartCourse(c), plan, people, null, i === chosen.length - 1));
  };

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24" aria-labelledby="b-title">
      {/* Hairline grid, fading out: the canvas the product sits on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(6_24_11/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(6_24_11/0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_30%,#000_20%,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <motion.h1
            id="b-title"
            className="m-0 font-title text-[clamp(44px,5.6vw,88px)] leading-[0.95] tracking-[-0.045em]"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE }}
          >
            {hero.title ?? "Online courses and certification made simple for everyone"}
          </motion.h1>
          <motion.p
            className="m-0 mt-6 max-w-[50ch] text-[17px] leading-relaxed text-[#06180b]/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {hero.sub_title}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.8 }}>
            <Link href={hero.cta_1?.url ?? "/courses"} className="group flex items-center gap-2 rounded-xl bg-[#06180b] px-5 py-3.5 text-[15px] text-white">
              {hero.cta_1?.text ?? "Explore Our Courses"}
              <span className="text-[#1ee9b5] transition-transform group-hover:translate-x-0.5">
                <Arrow size={13} />
              </span>
            </Link>
            <button type="button" onClick={() => setFilm(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[15px] ring-1 ring-[#06180b]/10 hover:ring-[#06180b]/25">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <path d="M3 1.5v9l7.5-4.5L3 1.5Z" />
              </svg>
              {hero.cta_2?.text ?? "Watch Demo"}
            </button>
          </motion.div>
          <ul className="m-0 mt-10 grid list-none gap-2 p-0 text-[14px] text-[#06180b]/60">
            {(cms.why?.cards ?? []).map((c) => (
              <li key={c.title} className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-md bg-[#1ee9b5]/25 text-[#0c7a5e]">
                  <Check size={10} />
                </span>
                {c.title}
              </li>
            ))}
          </ul>
        </div>

        {/* The product window: a real team order. */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          style={{ transformPerspective: 1600 }}
        >
          <div className="rounded-[22px] bg-[#06180b] p-1.5 shadow-[0_60px_120px_-40px_rgb(6_24_11/0.55)] ring-1 ring-[#06180b]">
            <div className="flex items-center gap-1.5 px-3 py-2.5">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="ml-3 text-[12px] text-white/45">Team order</span>
              <span className="ml-auto rounded-md bg-[#1ee9b5] px-2 py-0.5 text-[11px] font-medium text-[#06180b]">{PLAN_NAME[plan]}</span>
            </div>
            <div className="rounded-[16px] bg-[#0b2414] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-6">
              <p className="m-0 text-[12px] text-white/45">Courses</p>
              <ul className="m-0 mt-2 grid max-h-[216px] list-none gap-1.5 overflow-y-auto p-0 pr-1" data-lenis-prevent>
                {courses.map((c) => {
                  const on = picked.includes(c.slug);
                  return (
                    <li key={c.slug}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPicked((p) => (on ? p.filter((s) => s !== c.slug) : [...p, c.slug]))}
                        className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[14px] transition-colors ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
                      >
                        <span className={`grid size-[18px] place-items-center rounded-[5px] ring-1 ${on ? "bg-[#1ee9b5] text-[#06180b] ring-[#1ee9b5]" : "ring-white/25"}`}>{on && <Check size={10} />}</span>
                        <span className={`min-w-0 flex-1 truncate ${on ? "text-white" : "text-white/55"}`}>{c.title}</span>
                        <span className="text-[12px] text-white/40">{c.duration}</span>
                        <span className="w-10 text-right tabular-nums text-white/70">{formatPrice(c.price)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="b-people" className="text-[12px] text-white/45">
                    Learners
                  </label>
                  <span className="font-mono text-[28px] tabular-nums">{people}</span>
                </div>
                <input
                  id="b-people"
                  type="range"
                  min={1}
                  max={100}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className="b-range mt-3 w-full"
                  style={{ background: `linear-gradient(90deg,#1ee9b5 ${people - 1}%, rgb(255 255 255 / 0.12) ${people - 1}%)` }}
                />
              </div>

              <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-white/[0.05] p-4">
                <div>
                  <p className="m-0 text-[12px] text-white/45">
                    {people} × {formatPrice(perPerson)} · certificates included
                  </p>
                  <motion.p className="m-0 mt-1 font-mono text-[34px] leading-none tabular-nums text-[#1ee9b5]">{shown}</motion.p>
                </div>
                <button
                  type="button"
                  onClick={addAll}
                  disabled={!chosen.length}
                  className="rounded-xl bg-[#1ee9b5] px-4 py-3 text-[14px] font-medium text-[#06180b] transition-transform active:scale-[0.98] disabled:opacity-40"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>

          {/* A certificate card resting on the window's corner, for depth. */}
          <motion.div
            className="absolute -top-16 right-28 hidden w-[230px] rounded-[16px] bg-white p-4 shadow-[0_30px_60px_-20px_rgb(6_24_11/0.35)] ring-1 ring-[#06180b]/8 xl:block"
            initial={{ opacity: 0, x: -30, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: -5 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#06180b]/50">Certificate</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/all-courses/cpd-logo.avif" alt="" className="h-7 w-auto" />
            </div>
            <p className="m-0 mt-2 font-title text-[17px] leading-tight">CPD Certificate of Completion</p>
            <p className="m-0 mt-1 text-[12px] text-[#06180b]/50">Included in every course</p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {film && (
          <motion.div
            className="fixed inset-0 z-[120] grid place-items-center bg-[#06180b]/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilm(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Demo film"
          >
            <video src={hero.hero_video ?? HERO_VIDEO} autoPlay controls playsInline className="max-h-[85vh] w-full max-w-[1200px] rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .b-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 99px; outline: none; }
        .b-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 6px; background: #fff; box-shadow: 0 0 0 4px rgb(30 233 181 / 0.35); cursor: grab; }
        .b-range::-moz-range-thumb { width: 20px; height: 20px; border-radius: 6px; background: #fff; border: 0; cursor: grab; }
      `}</style>
    </section>
  );
}

function Logos({ data }: { data?: HomeCms["trusted"] }) {
  const logos = (data?.brands ?? []).map((b) => b.logo).filter((l): l is { url: string; alt?: string } => Boolean(l?.url));
  if (!logos.length) return null;
  return (
    <section className="border-y border-[#06180b]/8 px-5 py-10 md:px-10" aria-label={data?.title ?? "Trusted by"}>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 md:flex-row md:justify-between">
        <p className="m-0 max-w-[36ch] text-[14px] text-[#06180b]/55">{data?.sub_title}</p>
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-10 gap-y-4 p-0">
          {logos.map((l) => (
            <li key={l.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.url} alt={l.alt ?? ""} className="h-7 w-auto max-w-[130px] object-contain opacity-60 brightness-0" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Library({ data, courses }: { data?: HomeCms["courses"]; courses: HomeCourse[] }) {
  const subjects = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))], [courses]);
  const [subject, setSubject] = useState("All");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const q = query.trim().toLowerCase();
  const list = courses
    .filter((c) => subject === "All" || c.category === subject)
    .filter((c) => !q || `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q));
  const chosen = courses.filter((c) => picked.includes(c.slug));

  return (
    <section id="courses" className="px-5 py-20 md:px-10 md:py-28" aria-labelledby="b-lib">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="b-lib" className="m-0 font-title text-[clamp(36px,4.4vw,64px)] leading-none tracking-[-0.04em]">
              {data?.title ?? "Popular Courses"}
            </h2>
            <p className="m-0 mt-4 max-w-[52ch] text-[16px] leading-relaxed text-[#06180b]/60">{data?.description}</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-[#06180b]/10 focus-within:ring-[#06180b]/40 sm:w-[320px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#06180b]/40">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search courses</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 18 courses" className="w-full bg-transparent text-[15px] outline-none" />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...subjects].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`rounded-lg px-3.5 py-2 text-[14px] transition-colors ${s === subject ? "bg-[#06180b] text-white" : "bg-white text-[#06180b]/70 ring-1 ring-[#06180b]/10 hover:text-[#06180b]"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <motion.ul layout className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((c) => {
              const on = picked.includes(c.slug);
              return (
                <motion.li key={c.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }}>
                  <article className={`group relative overflow-hidden rounded-2xl bg-white ring-1 transition-shadow ${on ? "ring-2 ring-[#1ee9b5]" : "ring-[#06180b]/8 hover:shadow-[0_20px_40px_-24px_rgb(6_24_11/0.3)]"}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#06180b]">
                      <Image src={c.thumbnailImage || "/courses/course-photo.jpeg"} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${on ? "Unselect" : "Select"} ${c.title}`}
                        onClick={() => setPicked((p) => (on ? p.filter((s) => s !== c.slug) : [...p, c.slug]))}
                        className={`absolute left-3 top-3 grid size-7 place-items-center rounded-lg backdrop-blur ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-white/85 text-transparent hover:text-[#06180b]/40"}`}
                      >
                        <Check size={12} />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="m-0 text-[12px] text-[#0c7a5e]">{c.category}</p>
                      <Link href={`/courses/${c.slug}`} className="mt-1 block truncate text-[16px] font-medium hover:underline hover:underline-offset-4">
                        {c.title}
                      </Link>
                      <div className="mt-3 flex items-center justify-between text-[13px] text-[#06180b]/55">
                        <span>
                          {c.duration} · CPD certificate
                        </span>
                        <span className="font-mono text-[15px] text-[#06180b]">{formatPrice(c.price)}</span>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {chosen.length > 0 && (
          <motion.div className="fixed inset-x-0 bottom-5 z-[95] flex justify-center px-4" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="flex w-full max-w-[560px] items-center gap-3 rounded-2xl bg-[#06180b] py-2 pl-5 pr-2 text-white shadow-2xl">
              <span className="flex-1 text-[14px]">
                {chosen.length} selected · <span className="font-mono">{formatPrice(chosen.reduce((s, c) => s + c.price, 0))}</span>
              </span>
              <button type="button" onClick={() => setPicked([])} className="px-3 py-2 text-[14px] text-white/60 hover:text-white">
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  chosen.forEach((c, i) => addItem(toCartCourse(c), undefined, undefined, undefined, i === chosen.length - 1));
                  setPicked([]);
                }}
                className="flex items-center gap-2 rounded-xl bg-[#1ee9b5] px-4 py-2.5 text-[14px] font-medium text-[#06180b]"
              >
                <Plus size={11} /> Add to cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
