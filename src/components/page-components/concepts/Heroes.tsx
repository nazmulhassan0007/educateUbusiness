"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildCourseSearchIndex, scoreCourseSearch, tokenizeSearchQuery } from "@/lib/courses/search";
import { prefersReducedMotion } from "@/lib/motion-budget";
import { formatPrice } from "@/lib/utils";
import { useIntroDone } from "../awwwards/Intro";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { Arrow, Check, EASE, Glows, HERO_POSTER, HERO_VIDEO } from "./shared";
import HeroCard from "./HeroCard";

/**
 * Three daylight heroes (the director found the black knockout too dark).
 * Picked with ?hero=letters|frame|wall while they are compared.
 */
export type HeroKind = "letters" | "frame" | "wall";

type Props = { cms: HomeCms; courses: HomeCourse[] };

export default function Hero({ kind, ...props }: Props & { kind: HeroKind }) {
  if (kind === "frame") return <FrameHero {...props} />;
  if (kind === "wall") return <WallHero {...props} />;
  return <LettersHero {...props} />;
}

// Facts for the first screen, all from the courses API and the CMS.
function useFacts({ cms, courses }: Props) {
  const from = courses.length ? Math.min(...courses.map((c) => c.price)) : null;
  return [
    from !== null ? `From ${formatPrice(from)} per course` : null,
    "CPD certificate included",
    cms.quote?.card_2_eyebrow,
    `${courses.length} courses`,
  ].filter(Boolean) as string[];
}

function Facts({ facts, tone = "ink" }: { facts: string[]; tone?: "ink" | "light" }) {
  return (
    <ul className="-mx-5 m-0 mt-5 flex list-none gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
      {facts.map((f) => (
        <li
          key={f}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 type-caption ${tone === "ink" ? "glass-light text-[#06180b]/85" : "glass text-white/90"}`}
        >
          <span className={`grid size-4 place-items-center rounded-full ${tone === "ink" ? "bg-[#06180b] text-[#1ee9b5]" : "text-[#1ee9b5]"}`}>
            <Check size={9} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  );
}

function Ctas({ cms }: { cms: HomeCms }) {
  const hero = cms.hero ?? {};
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
      <Link
        href={hero.cta_1?.url ?? "/courses"}
        className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#06180b] px-3 py-3.5 type-button font-medium text-white transition-transform active:scale-[0.98] sm:justify-start sm:gap-3 sm:px-0 sm:py-2 sm:pl-6 sm:pr-2"
      >
        {hero.cta_1?.text ?? "Explore Our Courses"}
        <span className="hidden size-10 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform group-hover:translate-x-0.5 sm:grid">
          <Arrow />
        </span>
      </Link>
      <a
        href="#team"
        className="glass-light flex items-center justify-center whitespace-nowrap rounded-full px-3 py-3.5 type-button font-medium text-[#06180b] transition-transform active:scale-[0.98] sm:px-6"
      >
        Enrol your team
      </a>
    </div>
  );
}

/** Screen readers get the full CMS headline; the page shows a shorter set. */
function Title({ cms, className, children }: { cms: HomeCms; className: string; children: React.ReactNode }) {
  return (
    <h1 id="c-title" className={className}>
      <span className="sr-only">{cms.hero?.title ?? "Online courses and certification made simple for everyone"}</span>
      <span aria-hidden="true">{children}</span>
    </h1>
  );
}

/**
 * A. The film inside "made simple", on paper. Two copies of one layout are
 * stacked: underneath, a sheet with only the big words in black (see the
 * blend note below); on top, the readable copy with the big words left blank. Sharing the layout
 * keeps the letters exactly where the type around them expects. Scrolling
 * zooms into the letters until the film fills the frame.
 */
function LettersHero(props: Props) {
  const { courses } = props;
  const ready = useIntroDone();
  const reduce = useReducedMotion();
  // Phones skip the scroll zoom: it ends with the film filling the screen,
  // which holds a small screen for too long. They get the still version, as
  // reduced motion does, and the hero scrolls away like any other section.
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const still = reduce || phone;
  const ref = useRef<HTMLElement>(null);
  const letters = useRef<HTMLSpanElement>(null);
  const [origin, setOrigin] = useState("50% 45%");
  // Values are computed by function, not given as [from, to] ranges: Motion
  // hands ranged opacities to the browser's scroll timeline, which mapped them
  // wrongly here (they ran backwards past their end and the sheet came back).
  //
  // The zoom runs across the hero's whole exit, not just its pinned stretch:
  // 0 with the hero at the top, 1 once it has scrolled off (155vh of scroll:
  // 55vh pinned, then 100vh as the frame scrolls away). The letters only open
  // to the full film with about half the frame still on screen, so the film
  // gets a moment of its own without holding a whole screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, (v) => 1 + 8 * between(v, 0, 0.7));
  const maskFade = useTransform(scrollYProgress, (v) => 1 - between(v, 0.45, 0.68));
  const words = useTransform(scrollYProgress, (v) => 1 - between(v, 0, 0.1));
  const shown = useTransform(words, (v) => (v < 0.02 ? "hidden" : "visible"));

  // Zoom toward the middle of the letters. Offsets ignore transforms, so this
  // reads the unscaled position at any scroll.
  useEffect(() => {
    const el = letters.current;
    if (!el) return;
    const measure = () => {
      setOrigin(`${el.offsetLeft + el.offsetWidth / 2}px ${el.offsetTop + el.offsetHeight / 2}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rise = (d: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, delay: d, ease: EASE },
  });

  return (
    <section
      ref={ref}
      className="relative h-auto bg-[#f2efe6] text-[#06180b] md:h-[155vh] motion-reduce:h-auto"
      aria-labelledby="c-title"
    >
      {/* At least a screen tall, but never a fixed height: on short phones and in
          landscape the copy, search and card run taller than the screen, and a
          fixed frame clipped the card under the next section. The readable layer
          below sits in flow and sets the height; the film layer fills it. */}
      <div className="sticky top-0 min-h-[max(100dvh,700px)] overflow-hidden bg-[#f2efe6] lg:min-h-[max(100dvh,760px)]">
        {/*
          The film and a white sheet with the big words cut in black. Screen keeps
          the film only inside the letters; the group then multiplies onto the
          paper, so white becomes paper. The sheet is 85% white, so a faint
          trace of the film still shows through the paper outside the words.
        */}
        <div aria-hidden="true" inert className="absolute inset-0 isolate mix-blend-multiply">
          <video src={HERO_VIDEO} poster={HERO_POSTER} autoPlay={!reduce} muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
          <motion.div
            style={still ? { scale: 1, opacity: 1, transformOrigin: origin } : { scale, opacity: maskFade, transformOrigin: origin }}
            className="absolute inset-0 bg-white/85 mix-blend-screen"
          >
            <LettersLayout courses={courses} ghost lettersRef={letters} />
          </motion.div>
        </div>

        {/* The readable copy. It fades as the zoom starts and stops taking clicks once gone. */}
        {/* Still: set explicitly, not left unset. A phone's hero has no scroll run, so the
            progress reads as finished and would leave the copy hidden. */}
        <motion.div style={still ? { opacity: 1, visibility: "visible" } : { opacity: words, visibility: shown }} className="relative min-h-[inherit]">
          <LettersLayout courses={courses} rise={rise} pinned={!still} />
        </motion.div>
      </div>
    </section>
  );
}

/** Where `v` sits from `a` to `b`, clamped to 0..1. */
const between = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));


type Rise = (d: number) => Record<string, unknown>;

/** The hero's layout, drawn twice: `ghost` shows only the big words, in black. */
function LettersLayout({
  courses,
  ghost = false,
  lettersRef,
  rise,
  pinned = false,
}: {
  courses: HomeCourse[];
  ghost?: boolean;
  lettersRef?: React.Ref<HTMLSpanElement>;
  rise?: Rise;
  /** The hero holds still while scrolling drives the zoom. */
  pinned?: boolean;
}) {
  const hide = ghost ? "invisible" : "";
  const motionProps = (d: number) => (rise ? rise(d) : {});
  const Heading = ghost ? "div" : "h1";

  // Rows: the heading and the block under it, with any spare height in the
  // first and last rows. On a large screen it all goes below (the title sits
  // under the bar), unless the screen is very tall; from 1024 to 1279px wide
  // the type is sized by the narrower width, so the spare height is larger and
  // is split above and below instead of piling up under the content.
  return (
    <div className="site-container grid h-full min-h-[inherit] grid-rows-[minmax(0,0.25fr)_auto_auto_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] lg:grid-rows-[0px_auto_auto_minmax(0,1fr)] lg:max-xl:grid-rows-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] [@media(min-width:1024px)_and_(min-height:961px)]:grid-rows-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] pb-14 pt-[calc(var(--home-nav-h)+40px)] [container-type:inline-size] md:pb-20 lg:pb-24 lg:pt-[calc(var(--home-nav-h)+72px)] [@media(min-width:1024px)_and_(min-height:821px)_and_(max-height:960px)]:pb-10 [@media(min-width:1024px)_and_(min-height:821px)_and_(max-height:960px)]:pt-[calc(var(--home-nav-h)+32px)] [@media(min-width:1024px)_and_(max-height:820px)]:pb-12 [@media(min-width:1024px)_and_(max-height:820px)]:pt-[calc(var(--home-nav-h)+56px)]">
      <div />
      <Heading id={ghost ? undefined : "c-title"} className="m-0 w-fit max-w-full justify-self-center font-normal">
        {!ghost && <span className="sr-only">Online courses and certification made simple for everyone.</span>}
        <span aria-hidden="true" className="block">
          <motion.span
            {...motionProps(0.05)}
            className={`block font-title text-[clamp(24px,4.6cqw,60px)] font-medium leading-none tracking-[-0.03em] [@media(min-width:1024px)_and_(max-height:820px)]:text-[clamp(24px,3.8cqw,48px)] ${hide}`}
          >
            Online courses and certification
          </motion.span>
          {/* Always the full content width (the site's 1312px max), like every
              other section. */}
          <span
            ref={lettersRef}
            className={`mt-[2cqw] block w-fit font-title text-[29cqw] leading-[0.8] tracking-[-0.06em] text-black landscape:whitespace-nowrap landscape:text-[18.7cqw] md:whitespace-nowrap md:text-[18.7cqw] ${ghost ? "" : "invisible"}`}
          >
            made
            {/* Two lines only on a portrait phone; a landscape phone has the width
                for one, and two would fill its whole short screen. */}
            <br className="landscape:hidden md:hidden" /> simple
          </span>
          {/* The margin clears the descender of the "p" in "simple", which hangs
              below its 0.8 line box and otherwise runs into this line (the cqw
              part, which scales with those letters), then leaves a gap in
              proportion to this line's own size (the em part), so it reads the
              same at every screen size. Its size stays a third of "made simple";
              only from 1280px wide does a short screen trim it, as below that
              the narrower width already keeps it small. */}
          <motion.span
            {...motionProps(0.2)}
            className={`mt-[calc(6cqw+0.35em)] block text-right landscape:mt-[calc(4cqw+0.35em)] md:mt-[calc(4cqw+0.35em)] font-title text-[clamp(34px,6cqw,84px)] leading-none [@media(min-width:1280px)_and_(max-height:820px)]:text-[clamp(30px,4.6cqw,60px)] tracking-[-0.045em] text-[#0c7a5e] ${hide}`}
          >
            for everyone.
          </motion.span>
        </span>
      </Heading>

      {/* Under "for everyone.": the lead and the course search on the left, the
          course card on the right. The left column sits above the card, which
          follows it on phones, so the search panel covers it. */}
      <div className={`mt-7 grid gap-6 md:mt-9 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,30cqw)] lg:items-start lg:gap-16 [@media(min-width:1024px)_and_(max-height:960px)]:mt-3 ${hide}`}>
        <motion.div {...motionProps(0.3)} className="relative z-20 min-w-0">
          <p className="ragged m-0 max-w-[60ch] type-lead text-[#06180b]/80">{HERO_LEAD}</p>
          <div className="mt-5 md:mt-6 [@media(min-width:1024px)_and_(max-height:820px)]:mt-4">
            {ghost ? <div className="h-14 md:h-[60px] [@media(min-width:1024px)_and_(max-height:820px)]:h-[52px]" /> : <HeroSearch courses={courses} pinned={pinned} />}
          </div>
        </motion.div>
        {/* Tablets: a compact card in the bottom-right corner rather than a full-width strip. */}
        <motion.div {...motionProps(0.4)} className="md:w-[min(420px,60%)] md:justify-self-end lg:w-auto lg:justify-self-stretch">
          <HeroCard courses={courses} still={ghost} />
        </motion.div>
      </div>
    </div>
  );
}

const MAX_RESULTS = 5;

const HERO_LEAD =
  "educateU Business delivers accredited online courses and certification for businesses, teams, and individuals across the UK and beyond.";

/**
 * The hero's course search. Typing filters the catalogue live (ranked: a title
 * match beats a passing mention, see lib/courses/search) into a panel of up to
 * five courses and a "view all results" row; Enter, or that row, opens the
 * full catalogue search. The panel opens below the field, over whatever
 * follows it. Arrow keys move through the options.
 */
function HeroSearch({ courses, pinned }: { courses: HomeCourse[]; pinned: boolean }) {
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);


  const indexed = useMemo(() => courses.map((course) => ({ course, index: buildCourseSearchIndex(course) })), [courses]);
  const results = useMemo(() => {
    const tokens = tokenizeSearchQuery(query);
    if (!tokens.length) return [];
    return indexed
      .map(({ course, index }) => ({ course, score: scoreCourseSearch(index, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
      .slice(0, MAX_RESULTS)
      .map((r) => r.course);
  }, [indexed, query]);

  // The panel always opens below the field. It is portalled to <body> and
  // placed with `position: fixed`, so the hero's frame (which clips) can't cut
  // it short: it lays over the course card and the next section instead. It
  // runs down to the bottom of what can be seen, the visual viewport, which
  // excludes a phone's keyboard. The course list scrolls within it, "view all"
  // stays pinned to its foot.
  const field = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number; width: number; room: number } | null>(null);
  const measure = () => {
    const f = field.current;
    if (!f) return;
    const r = f.getBoundingClientRect();
    const vv = window.visualViewport;
    const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const gap = 12;
    setPlace({
      top: r.bottom + gap,
      left: r.left,
      width: r.width,
      room: Math.max(96, Math.floor(bottom - r.bottom - gap * 2)),
    });
  };

  const term = query.trim();
  const show = open && term.length > 0;

  // On a phone the hero scrolls like any section, so focusing the field lifts
  // it to just under the navbar: that leaves the space below it, above the
  // keyboard, for the results. Pinned heroes can't move (scroll drives the zoom).
  const lift = () => {
    const f = field.current;
    if (pinned || !f) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 72;
    const by = f.getBoundingClientRect().top - nav - 16;
    if (by > 0) window.scrollBy({ top: by, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Follow the field while the panel is open: the page scrolls under it on a
  // phone, and the keyboard resizes the visual viewport. On a pinned hero,
  // scrolling starts the zoom and fades the copy, so the panel closes instead.
  // Layout effect: the first frame already has the panel in place.
  useLayoutEffect(() => {
    if (!show) return;
    measure();
    const onScroll = () => (pinned ? setOpen(false) : measure());
    const vv = window.visualViewport;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
    };
  }, [show, pinned]);
  // The options: each course, then "view all results".
  const count = results.length + 1;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrap.current?.contains(t) && !panel.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option visible inside the scrolling list.
  useEffect(() => {
    if (active >= 0) document.getElementById(`hero-search-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (q: string) => {
    setOpen(false);
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (show && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % count : (i - 1 + count) % count));
    } else if (e.key === "Enter" && show && active >= 0 && active < results.length) {
      e.preventDefault();
      setOpen(false);
      router.push(`/courses/${results[active].slug}`);
    }
  };

  return (
    <div ref={wrap} className="relative">
      <div ref={field} className="relative w-full max-w-[480px]">
      <form
        action="/courses"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(term);
        }}
        // The search button fills the bar's height less an even 5px inset, so it
        // sits centred with the same ring all round at every bar height.
        // Under 360px (e.g. a 320px phone) the gap, right padding and type (below)
        // tighten a touch so the whole placeholder fits instead of being cut off.
        className="flex h-14 w-full items-center gap-2.5 rounded-full border-[1.5px] border-[#06180b] bg-white/30 py-[5px] pl-[5px] pr-4 max-[359px]:gap-2 max-[359px]:pr-3 transition-[background-color,box-shadow] duration-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(30_233_181/0.35)] hover:bg-white/70 sm:gap-3 sm:pr-5 md:h-[60px] [@media(min-width:1024px)_and_(max-height:820px)]:h-[52px]"
      >
        <button
          type="submit"
          aria-label="Search courses"
          className="grid aspect-square h-full shrink-0 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-[42%]">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <label htmlFor="hero-search" className="sr-only">
          Search courses
        </label>
        <input
          id="hero-search"
          name="q"
          type="search"
          role="combobox"
          aria-expanded={show}
          aria-controls="hero-search-results"
          aria-autocomplete="list"
          aria-activedescendant={show && active >= 0 ? `hero-search-opt-${active}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => {
            setOpen(true);
            lift();
          }}
          onKeyDown={onKey}
          placeholder="Search by keyword or category"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#06180b] max-[359px]:text-[13px] outline-none placeholder:text-[#06180b]/75 sm:text-[15px] md:text-[16px] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActive(-1);
              wrap.current?.querySelector("input")?.focus();
            }}
            className="grid size-7 shrink-0 place-items-center rounded-full text-[#0c7a5e] transition-colors hover:bg-[#06180b]/[0.06]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </form>

      {/* `open` only turns true on focus, in the browser, so the portal never
          renders on the server. */}
      {open &&
        createPortal(
      <AnimatePresence>
        {show && place && (
          <motion.div
            ref={panel}
            key="results"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ top: place.top, left: place.left, width: place.width, maxHeight: place.room }}
            className="fixed z-[80] flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1f15] text-[#f2efe6] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)]"
          >
            <ul id="hero-search-results" role="listbox" aria-label="Courses" className="m-0 flex min-h-0 list-none flex-col p-2">
              <li role="presentation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                <ul role="presentation" className="m-0 list-none p-0">
              {results.length === 0 && (
                <li className="px-3 py-4 type-small text-[#f2efe6]/70">No courses match &ldquo;{term}&rdquo;. Try a subject such as fire safety or leadership.</li>
              )}
              {results.map((c, i) => (
                <li key={c.slug} id={`hero-search-opt-${i}`} role="option" aria-selected={active === i}>
                  <Link
                    href={`/courses/${c.slug}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors ${active === i ? "bg-white/[0.07]" : "hover:bg-white/[0.07]"}`}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-white/10">
                      {c.thumbnailImage && <Image src={c.thumbnailImage} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate type-small font-medium text-white">{c.title}</span>
                      {c.category && <span className="block truncate type-caption text-[#1ee9b5]/75">{c.category}</span>}
                    </span>
                    <span className="shrink-0 type-small font-semibold text-[#1ee9b5]">{formatPrice(c.price)}</span>
                  </Link>
                </li>
              ))}
                </ul>
              </li>
              <li id={`hero-search-opt-${results.length}`} role="option" aria-selected={active === results.length} className="mt-1 shrink-0 border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={() => go(term)}
                  onMouseEnter={() => setActive(results.length)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-3 text-left type-small font-medium text-[#1ee9b5] transition-colors ${active === results.length ? "bg-white/[0.07]" : "hover:bg-white/[0.07]"}`}
                >
                  <span className="truncate">View all results for &ldquo;{term}&rdquo;</span>
                  <Arrow size={12} />
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
      </div>
    </div>
  );
}

/**
 * B. Headline and offer on paper, the film in a rounded frame underneath that
 * widens to full bleed as the page scrolls.
 */
function FrameHero(props: Props) {
  const { cms } = props;
  const ready = useIntroDone();
  const ref = useRef<HTMLDivElement>(null);
  const facts = useFacts(props);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const inset = useTransform(scrollYProgress, [0, 1], ["inset(0% 4% 0% 4% round 36px)", "inset(0% 0% 0% 0% round 0px)"]);
  const zoom = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const rise = (d: number) => ({
    initial: { opacity: 0, y: 28, filter: "blur(6px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1, delay: d, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden bg-[#f2efe6] text-[#06180b]" aria-labelledby="c-title">
      <Glows
        spots={[
          { at: "left:-10% top:-15%", size: "40vw", color: "rgb(30 233 181 / 0.35)" },
          { at: "right:-8% top:10%", size: "36vw", color: "rgb(120 245 205 / 0.4)" },
        ]}
      />
      <div className="relative site-container grid gap-8 pb-10 pt-32 md:pt-40 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pb-14">
        <motion.div {...rise(0.05)}>
          <Title cms={cms} className="m-0 font-title type-display tracking-[-0.05em]">
            Online courses and certification <span className="text-[#0c7a5e]">made simple</span> for everyone.
          </Title>
        </motion.div>
        <motion.div {...rise(0.2)} className="min-w-0">
          <p className="m-0 max-w-[48ch] type-lead text-[#06180b]/70">{cms.hero?.sub_title}</p>
          <Facts facts={facts} />
          <div className="mt-6">
            <Ctas cms={cms} />
          </div>
        </motion.div>
      </div>
      <div ref={ref} className="relative">
        <motion.div style={{ clipPath: inset }} className="relative h-[62vh] min-h-[380px] overflow-hidden md:h-[88vh]">
          <motion.video
            style={{ scale: zoom }}
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * C. The offer on the left, the catalogue itself on the right: two columns of
 * real course cards drifting past, each one a link. Phones get one row.
 */
function WallHero(props: Props) {
  const { cms, courses } = props;
  const ready = useIntroDone();
  const facts = useFacts(props);
  const half = Math.ceil(courses.length / 2);
  const cols = [courses.slice(0, half), courses.slice(half)];
  const rise = (d: number) => ({
    initial: { opacity: 0, y: 28, filter: "blur(6px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1, delay: d, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden bg-[#f2efe6] text-[#06180b]" aria-labelledby="c-title">
      <Glows
        spots={[
          { at: "left:-12% top:-10%", size: "42vw", color: "rgb(30 233 181 / 0.35)" },
          { at: "right:5% bottom:-20%", size: "40vw", color: "rgb(120 245 205 / 0.45)" },
        ]}
      />
      <div className="relative site-container grid gap-10 pt-32 lg:h-[100dvh] lg:min-h-[720px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20">
        <div className="min-w-0">
          <motion.div {...rise(0.05)}>
            <Title cms={cms} className="m-0 font-title type-display tracking-[-0.05em]">
              Online courses and certification <span className="text-[#0c7a5e]">made simple</span> for everyone.
            </Title>
          </motion.div>
          <motion.div {...rise(0.2)}>
            <p className="m-0 mt-6 max-w-[52ch] type-lead text-[#06180b]/70">{cms.hero?.sub_title}</p>
            <Facts facts={facts} />
            <div className="mt-7">
              <Ctas cms={cms} />
            </div>
          </motion.div>
        </div>

        {/* Wide screens: two columns drifting in opposite directions. */}
        <motion.div
          {...rise(0.35)}
          aria-label="Courses"
          className="group/wall relative hidden h-full grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_14%,#000_86%,transparent)] lg:grid"
        >
          {cols.map((col, i) => (
            <ul
              key={i}
              className={`m-0 flex list-none flex-col gap-4 p-0 motion-safe:animate-[wall-up_48s_linear_infinite] group-hover/wall:[animation-play-state:paused] ${i ? "motion-safe:[animation-direction:reverse]" : ""}`}
            >
              {[...col, ...col].map((c, j) => (
                <li key={`${c.slug}-${j}`} aria-hidden={j >= col.length}>
                  <WallCard course={c} hidden={j >= col.length} />
                </li>
              ))}
            </ul>
          ))}
        </motion.div>
      </div>

      {/* Phones and tablets: one row drifting sideways under the offer. */}
      <div className="relative mt-10 overflow-hidden pb-12 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] lg:hidden">
        <ul className="m-0 flex w-max list-none gap-3 p-0 motion-safe:animate-[wall-side_60s_linear_infinite]">
          {[...courses, ...courses].map((c, j) => (
            <li key={`${c.slug}-${j}`} className="w-[240px] shrink-0" aria-hidden={j >= courses.length}>
              <WallCard course={c} hidden={j >= courses.length} />
            </li>
          ))}
        </ul>
      </div>
      <style>{`@keyframes wall-up { to { transform: translateY(calc(-50% - 8px)); } } @keyframes wall-side { to { transform: translateX(calc(-50% - 6px)); } }`}</style>
    </section>
  );
}

function WallCard({ course: c, hidden }: { course: HomeCourse; hidden: boolean }) {
  return (
    <Link
      href={`/courses/${c.slug}`}
      tabIndex={hidden ? -1 : undefined}
      data-cursor="View"
      className="glass-light group block overflow-hidden rounded-[22px] p-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden isolate rounded-[16px] bg-[#06180b]/10">
        <Image
          src={c.thumbnailImage || "/courses/course-photo.jpeg"}
          alt=""
          fill
          sizes="(min-width:1024px) 22vw, 240px"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 type-caption font-medium text-[#06180b]">{formatPrice(c.price)}</span>
      </div>
      <div className="px-2 pb-2 pt-3">
        <p className="m-0 type-caption text-[#0c7a5e]">{c.category}</p>
        <p className="m-0 mt-0.5 line-clamp-1 type-h4 font-medium">{c.title}</p>
        <p className="m-0 mt-1 type-small text-[#06180b]/55">{c.duration} · CPD certificate</p>
      </div>
    </Link>
  );
}
