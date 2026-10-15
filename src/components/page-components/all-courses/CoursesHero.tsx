"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EXPLORE_COURSES_SECTION_ID } from "./CourseList";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

// A small SVG noise tile for the hero's grain (the same tile as the homepage's Grain).
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export type WallCourse = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  image: string;
};


function WallCard({ c }: { c: WallCourse }) {
  return (
    <Link
      href={`/courses/${c.slug}`}
      tabIndex={-1}
      className="group/card block rounded-[18px] bg-[#f2efe6] p-3 pb-5 shadow-[0_40px_70px_-30px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.03]"
    >
      <span className="relative block aspect-[316/236] overflow-hidden rounded-[12px] bg-[#0c3a28]">
        <Image src={c.image} alt="" fill sizes="340px" className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-110" />
      </span>
      <span className="mt-4 block px-1.5 font-title type-h4 tracking-[-0.03em] text-[#06180b]">{c.title}</span>
      <span className="mt-1.5 flex items-center gap-2 px-1.5 type-small">
        <span className="font-semibold text-[#0c7a5e]">{c.category}</span>
        {c.duration && <span className="text-[#06180b]/60">· {c.duration}</span>}
      </span>
    </Link>
  );
}

/** One column of the wall: its cards twice over, drifting up or down for ever. */
function Column({ courses, down, speed, offset }: { courses: WallCourse[]; down: boolean; speed: number; offset: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="w-[330px] shrink-0" style={{ marginTop: offset }}>
      <div
        className={`flex flex-col gap-6 group-hover/wall:[animation-play-state:paused] ${reduce ? "" : down ? "animate-[wall-down_var(--wall-speed)_linear_infinite]" : "animate-[wall-up_var(--wall-speed)_linear_infinite]"}`}
        style={{ ["--wall-speed" as string]: `${speed}s` }}
      >
        {[...courses, ...courses].map((c, i) => (
          <div key={i} aria-hidden={i >= courses.length ? true : undefined}>
            <WallCard c={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The Courses header: the headline and a search over the catalogue on the
 * left; on the right a tilted wall of the live courses,
 * its columns drifting in opposite directions.
 *
 * Motion: the headline rises line by line and the search follows; the wall
 * slides in from the right, leans toward the pointer and pauses under it.
 * Searching filters the list below and scrolls to it.
 */
export default function CoursesHero({ courses }: { courses: WallCourse[] }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  // Pointer lean on the wall.
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const wallX = useTransform(px, [-0.5, 0.5], [-24, 24]);
  const wallY = useTransform(py, [-0.5, 0.5], [-18, 18]);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  // Put the search in the URL (the list below reads it there). Read the live
  // URL rather than `params` so a pending update never drops another filter.
  const setQ = (q: string) => {
    const sp = new URLSearchParams(window.location.search);
    if (q) sp.set("q", q);
    else sp.delete("q");
    if (sp.toString() === new URLSearchParams(window.location.search).toString()) return;
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // The list follows the box as it's typed in or cleared, after a short pause,
  // without moving the page. Only the Search button brings the list into view.
  const typing = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(typing.current), []);
  const onType = (value: string) => {
    setQuery(value);
    clearTimeout(typing.current);
    typing.current = setTimeout(() => setQ(value.trim()), value.trim() ? 300 : 0);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    clearTimeout(typing.current);
    setQ(query.trim());
    scrollTo(`#${EXPLORE_COURSES_SECTION_ID}`, { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84), immediate: !!reduce });
  };

  // The wall: three columns, each its own share of the catalogue.
  const cols = [0, 1, 2].map((k) => courses.filter((_, i) => i % 3 === k));

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
      aria-labelledby="courses-title"
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className="relative isolate overflow-hidden bg-[#04140a] px-5 pb-20 [--hero-col:620px] lg:[--hero-col:470px] xl:[--hero-col:560px] 2xl:[--hero-col:620px] 4xl:[--hero-col:720px] pt-[calc(var(--home-nav-h)+56px)] text-[#f2efe6] md:px-10 lg:min-h-[960px] lg:pb-[140px] lg:pt-[calc(var(--home-nav-h)+132px)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_70%_40%,#0e3d24_0%,rgb(9_42_24/0.5)_45%,transparent_80%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      {/* Texture under the text column, which the glow above leaves flat: a faint
          grid that fades out toward the wall, a mint light low behind the search,
          and film grain over the whole band. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgb(242_239_230/0.085)_1px,transparent_1px),linear-gradient(90deg,rgb(242_239_230/0.085)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(75%_85%_at_12%_45%,black_0%,rgb(0_0_0/0.5)_45%,transparent_80%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_8%_80%,rgb(30_233_181/0.2)_0%,transparent_70%),radial-gradient(35%_40%_at_30%_15%,rgb(30_233_181/0.09)_0%,transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      {/* The wall of courses. It starts just past the text column's right edge
          (content edge + --hero-col), so it never runs under the search. */}
      <motion.div
        aria-hidden="true"
        className="group/wall pointer-events-none absolute inset-y-0 left-[calc(max(2.5rem,(100%-82rem)/2)+var(--hero-col)+1.5rem)] right-0 -z-10 hidden [mask-image:linear-gradient(to_right,transparent,black_110px)] lg:block"
        initial={reduce ? false : { opacity: 0, x: 160 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 1.4, delay: 0.2, ease: EASE } }}
      >
        {/* Faded at the top too, so the bar reads over it (a second mask: one layer can't intersect two gradients everywhere). */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_40px,black_230px)]">
        <motion.div style={reduce ? undefined : { x: wallX, y: wallY }} className="absolute inset-0">
          <div className="pointer-events-auto absolute left-0 top-[-38%] flex origin-top-left -rotate-[9deg] gap-7">
            <Column courses={cols[0]} down={false} speed={70} offset="0px" />
            <Column courses={cols[1]} down speed={80} offset="-140px" />
            <Column courses={cols[2]} down={false} speed={64} offset="-60px" />
          </div>
        </motion.div>
        </div>
        {/* The wall fades out at its foot; its left edge fades by the mask. */}
        <span className="absolute inset-x-0 bottom-0 h-[160px] bg-gradient-to-t from-[#04140a] to-transparent" />
      </motion.div>

      <motion.div {...group} className="pointer-events-none relative mx-auto max-w-site">
        <div className="pointer-events-auto max-w-[var(--hero-col)]">
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
                Courses
              </li>
            </ol>
          </motion.nav>

          <h1 id="courses-title" className="m-0 mt-8 font-title type-display font-normal tracking-[-0.055em] lg:mt-[34px] lg:whitespace-nowrap">
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <motion.span className="block" variants={line} custom={0.1}>
                Explore online
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span className="block text-[#1ee9b5]" variants={line} custom={0.2}>
                CPD courses.
              </motion.span>
            </span>
          </h1>

          <motion.p variants={fade} custom={0.35} className="m-0 mt-7 max-w-[575px] type-lead text-white/80 lg:mt-[30px]">
            Every course here is CPD accredited with your certificate included and instant access the moment you enrol. No subscription: browse, buy, and start straight away.
          </motion.p>

          <motion.form variants={fade} custom={0.45} role="search" onSubmit={submit} className="group/search mt-10 flex h-16 w-full items-center gap-3 rounded-[14px] bg-[#f2efe6] pl-5 pr-2 transition-shadow duration-300 focus-within:shadow-[0_0_0_4px_rgb(30_233_181/0.35)] md:h-[72px] md:pl-7 md:pr-2 lg:mt-[40px]">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-[#06180b] transition-transform duration-300 group-focus-within/search:scale-110">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <label htmlFor="courses-search" className="sr-only">
              Search courses
            </label>
            <input
              id="courses-search"
              type="search"
              value={query}
              onChange={(e) => onType(e.target.value)}
              placeholder={`Search ${courses.length} courses`}
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#06180b] outline-none placeholder:text-[#06180b]/55 md:text-[19px] [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="submit"
              className="relative h-12 shrink-0 overflow-hidden rounded-[10px] bg-[#06180b] px-5 type-button font-medium text-white transition-colors duration-300 hover:bg-[#0c3a28] md:h-14 md:px-6"
            >
              Search
            </button>
          </motion.form>

        </div>
      </motion.div>

      <style>{`
        @keyframes wall-up { from { transform: translateY(0); } to { transform: translateY(calc(-50% - 12px)); } }
        @keyframes wall-down { from { transform: translateY(calc(-50% - 12px)); } to { transform: translateY(0); } }
      `}</style>
    </section>
  );
}
