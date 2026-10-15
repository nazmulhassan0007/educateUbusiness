"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "@/components/shared/course-card/CourseCard";
import {
  Arrow,
  Check,
  Plus,
} from "@/components/page-components/concepts/shared";
import {
  buildCourseSearchIndex,
  matchesCourseSearch,
  tokenizeSearchQuery,
} from "@/lib/courses/search";
import { formatPrice } from "@/lib/utils";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import { useCartHydrated, useCartStore } from "@/store/cart-store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The list's section; the page header scrolls here after a search or a subject pick. */
export const EXPLORE_COURSES_SECTION_ID = "explore-courses";

export type ListCourse = Course & {
  categorySlug: string;
  categoryName: string;
  reviewCount: number;
  duration: string;
  image: string;
};
export type ListSubject = { name: string; slug: string };

const SORTS = [
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "popular", label: "Most popular" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

// Eight courses first (with the team card that makes a 3 × 3 grid), then more on request.
const FIRST = 8;
const MORE = 12;
// Where the team card sits among the courses.
const TEAM_AT = 4;
// The navbar's height once the page has scrolled (SiteNav: 12px + 44px + 12px),
// which is when the compact filter bar sits under it.
const BAR_TOP = 68;

function Clock({ size = 11 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className="shrink-0"
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6 3.5V6l1.6 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CourseCard({ c, eager }: { c: ListCourse; eager: boolean }) {
  const hydrated = useCartHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const inCartRaw = useCartStore((s) =>
    s.items.some((it) => it.course.slug === c.slug),
  );
  const inCart = hydrated && inCartRaw;
  const reduce = useReducedMotion();

  const onCart = () => {
    if (inCart) return useCartStore.getState().setIsOpen(true);
    // The cart keeps the plain course, not the list's extras.
    const { image, duration, reviewCount, ...course } = c;
    void duration;
    void reviewCount;
    addItem(
      { ...course, thumbnailImage: c.thumbnailImage ?? image },
      undefined,
      undefined,
      undefined,
      false,
    );
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden isolate rounded-[18px] bg-[#f7f6f1] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_34px_60px_-34px_rgb(6_24_11/0.4)]">
      <div className="relative aspect-[411/244] overflow-hidden bg-[#0c3a28]/10">
        <Image
          src={c.image}
          alt=""
          fill
          preload={eager}
          sizes="(min-width:1280px) 420px, (min-width:768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <span className="absolute left-3.5 top-3.5 max-w-[calc(100%-7.5rem)] truncate rounded-[6px] bg-[#f7f6f1] px-2 py-1 type-caption font-semibold">
          {c.categoryName}
        </span>
        {c.duration && (
          <span className="absolute right-3.5 top-3.5 flex items-center gap-1.5 whitespace-nowrap rounded-[6px] bg-[#06180b]/60 px-2 py-1 type-caption font-medium text-white backdrop-blur-sm">
            <Clock />
            {c.duration}
          </span>
        )}
        <span className="absolute bottom-3.5 right-3.5 flex size-11 items-center justify-center rounded-full bg-white p-1.5 shadow-md xl:size-12">
          <Image
            alt="CPD certified"
            src="/all-courses/cpd-logo.avif"
            width={48}
            height={48}
            className="size-full object-contain"
          />
        </span>
        {/* "View course" rises into the photo on hover. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-2 items-center gap-2 rounded-full bg-[#f7f6f1] px-4 py-2.5 type-small font-medium opacity-0 shadow-lg transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2 group-hover:opacity-100"
        >
          View course <Arrow size={12} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6 xl:px-6 xl:pb-6 xl:pt-[26px]">
        <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.03em]">
          {/* The title's link covers the card; the cart button sits above it. */}
          <Link
            href={`/courses/${c.slug}`}
            className="after:absolute after:inset-0 after:rounded-[18px] focus-visible:outline-none after:focus-visible:ring-[3px] after:focus-visible:ring-inset after:focus-visible:ring-[#0c7a5e]"
          >
            {c.title}
          </Link>
        </h3>
        {c.description && (
          <p className="m-0 mt-2.5 line-clamp-3 type-body text-[#06180b]/70">
            {c.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-5">
          <div>
            <p className="m-0 font-title type-h4 tracking-[-0.03em]">
              {formatPrice(c.price)}
              {c.originalPrice ? (
                <s className="ml-2 align-middle font-sans type-small text-[#06180b]/45">
                  {formatPrice(c.originalPrice)}
                </s>
              ) : null}
            </p>
            <p className="m-0 mt-1 whitespace-nowrap type-caption text-[#06180b]/65">
              Certificate included
            </p>
          </div>
          <motion.button
            type="button"
            layout={!reduce}
            onClick={onCart}
            aria-label={
              inCart
                ? `${c.title} is in your cart. View cart`
                : `Add ${c.title} to cart`
            }
            transition={{ layout: { duration: 0.4, ease: EASE } }}
            className={`group/cart relative z-10 inline-flex h-[43px] shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-3.5 min-[360px]:px-[18px] type-button font-medium transition-colors duration-300 ${
              inCart
                ? "bg-[#1ee9b5] pl-3 text-[#06180b] hover:bg-[#5ef0c9]"
                : "bg-[#06180b] text-white hover:bg-[#0c3a28]"
            }`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {inCart ? (
                <motion.span
                  key="in"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <motion.span
                    className="grid size-[22px] place-items-center rounded-full bg-[#06180b] text-[#1ee9b5]"
                    initial={reduce ? false : { scale: 0, rotate: -90 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                        delay: 0.1,
                      },
                    }}
                  >
                    <Check size={10} />
                  </motion.span>
                  Added · View cart
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <span className="transition-transform duration-300 group-hover/cart:rotate-180">
                    <Plus size={11} />
                  </span>
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </article>
  );
}

function TeamCard() {
  return (
    <article className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#0f5a40_0%,#0c3a28_55%,#0a3022_100%)] p-8 text-white md:p-9">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-[#1ee9b5]/15 blur-3xl transition-transform duration-1000 group-hover:translate-x-[-30px] group-hover:translate-y-[30px]"
      />
      <div className="relative flex" aria-hidden="true">
        {[
          ["AO", "bg-[#1ee9b5] text-[#06180b]"],
          ["RK", "bg-[#f2efe6] text-[#06180b]"],
          ["JS", "bg-[#1ee9b5] text-[#06180b]"],
          ["+12", "bg-[#f2efe6] text-[#06180b]"],
        ].map(([t, cls], i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: EASE }}
            className={`-ml-2 grid size-10 place-items-center rounded-full border-2 border-[#0e4a35] type-caption font-semibold first:ml-0 ${cls} transition-transform duration-300 group-hover:-translate-y-0.5`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {t}
          </motion.span>
        ))}
      </div>
      <h3 className="relative m-0 mt-6 font-title type-h3 font-normal tracking-[-0.045em]">
        Training a team?
      </h3>
      <p className="relative m-0 mt-5 type-body text-white/80">
        Use the company purchase option to enrol your whole team at once. We’ll
        come back with company pricing and a group booking quote, no sales call
        required.
      </p>
      <Link
        href="/contact-us#contact-form"
        className="group/btn relative mt-auto inline-flex h-[52px] w-fit items-center gap-3 overflow-hidden rounded-full bg-[#1ee9b5] py-1 pl-5 pr-1 type-button font-medium text-[#06180b]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#5ef0c9] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:w-full"
        />
        <span className="relative">Get a team quote</span>
        <span className="relative grid size-11 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform duration-500 group-hover/btn:-rotate-45">
          <Arrow size={13} />
        </span>
      </Link>
    </article>
  );
}

/**
 * The subject tabs. They wrap onto more rows rather than scrolling sideways,
 * so every subject is in sight at every width (on phones a sideways row hid
 * all but the first two, with nothing to say there were more). Each tab
 * grows to fill its row, name left and count right, so wrapped rows line up
 * edge to edge instead of ending raggedly.
 */
function SubjectTabs({
  tabs,
  active,
  onPick,
}: {
  tabs: { name: string; slug: string; count: number }[];
  active: string;
  onPick: (slug: string) => void;
}) {
  return (
    <LayoutGroup id="tabs">
      <ul aria-label="Subjects" className="m-0 flex list-none flex-wrap gap-1.5 p-0 xl:gap-2">
        {tabs.map((t) => {
          const on = t.slug === active;
          return (
            <li key={t.name} className="min-w-0 grow">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick(t.slug)}
                className={`relative flex h-10 w-full items-center justify-between gap-3 rounded-[8px] px-3 type-small font-semibold transition-colors duration-300 md:h-11 xl:px-4 ${on ? "text-white" : "bg-[#efece4] hover:bg-[#e8e4d9]"}`}
              >
                {on && (
                  <motion.span
                    layoutId="tab-fill"
                    className="absolute inset-0 rounded-[8px] bg-[#06180b]"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative truncate">{t.name}</span>
                <span
                  className={`relative grid h-5 min-w-[22px] shrink-0 place-items-center rounded-[5px] px-1.5 type-caption font-semibold transition-colors duration-300 ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b]/[0.08] text-[#06180b]/70"}`}
                >
                  {t.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}

/** A plain filter chip, for the sticky bar and the filters sheet. */
function Chip({ on, onClick, children, count, role = "button", fill = false }: { on: boolean; onClick: () => void; children: React.ReactNode; count?: number; role?: "button" | "radio"; fill?: boolean }) {
  return (
    <button
      type="button"
      role={role === "radio" ? "radio" : undefined}
      aria-pressed={role === "button" ? on : undefined}
      aria-checked={role === "radio" ? on : undefined}
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-[8px] px-3 type-small font-semibold transition-colors duration-200 ${fill ? (count !== undefined ? "min-w-0 grow justify-between gap-3" : "grow justify-center") : "max-w-full"} ${
        on ? "bg-[#06180b] text-white" : "bg-[#efece4] text-[#06180b] hover:bg-[#e8e4d9]"
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span className={`grid h-5 min-w-[22px] shrink-0 place-items-center rounded-[5px] px-1.5 type-caption font-semibold ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b]/[0.08] text-[#06180b]/70"}`}>{count}</span>
      )}
    </button>
  );
}

function FiltersIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M2 4h7m3 0h2M2 12h2m3 0h7M9 2.5v3M5 10.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SortMenu({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (v: Sort) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const label = SORTS.find((s) => s.value === value)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[8px] bg-[#efece4] px-4 type-small font-semibold transition-colors hover:bg-[#e8e4d9]"
      >
        Sort: {label}
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m2 3.5 3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Sort courses"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-[calc(100%+6px)] z-30 m-0 w-[210px] origin-top-right list-none rounded-[12px] bg-white p-1.5 shadow-[0_20px_50px_-20px_rgb(6_24_11/0.35)] ring-1 ring-[#06180b]/[0.06]"
          >
            {SORTS.map((s) => (
              <li key={s.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.value === value}
                  onClick={() => {
                    onChange(s.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left type-small transition-colors hover:bg-[#f2efe6] ${s.value === value ? "font-semibold" : ""}`}
                >
                  {s.label}
                  {s.value === value && <Check size={10} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The course list: a panel of subject tabs, course-length filters, the count
 * and the sort; then the courses in three columns with a "Training a team?"
 * card among them, eight at first and more on request.
 *
 * Motion: the active tab's fill slides between tabs; the grid re-flows when a
 * filter changes, cards leaving and arriving; cards lift on hover with
 * "View course" rising into the photo; "Add to cart" turns into "Added"
 * with its tick popping in; the progress line grows as more are shown.
 */
export default function CourseList({
  courses,
  subjects,
}: {
  courses: ListCourse[];
  subjects: ListSubject[];
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  // One subject at a time here; the header's chips and these tabs share `?category=`.
  const subject =
    (params.get("category") ?? "")
      .split(",")
      .find((s) => subjects.some((x) => x.slug === s)) ?? "";
  const [length, setLength] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("az");
  const [shown, setShown] = useState(FIRST);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // The compact bar shows once the filter panel has scrolled up under the
  // navbar, for as long as the list is still on screen.
  const [stuck, setStuck] = useState(false);
  const [sheet, setSheet] = useState(false);
  // Set when a filter is changed in the sheet. (Not a before/after compare of
  // the filters: a subject goes through the URL, which on this server-rendered
  // page can land after the sheet has already been closed.)
  const changed = useRef(false);

  // Back to the first eight whenever what's being looked at changes.
  const key = `${subject}|${length}|${sort}|${query}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setShown(FIRST);
  }

  // Arriving with a search or a subject (a navbar subject, a search on another
  // page, a deep link) opens on the list itself rather than the header. The
  // header streams in above the list after it mounts and pushes it down, so
  // this keeps the list pinned under the navbar until the layout holds still
  // (or the visitor scrolls themselves), instead of jumping once too early.
  const scrollTo = useSmoothScrollTo();
  // Read once, at mount: later filter changes on this page scroll on their own.
  // (Not cleared inside the effect, so React's dev-mode double run still jumps.)
  const arrivedFiltered = useRef(!!(query || subject));
  useEffect(() => {
    if (!arrivedFiltered.current) return;
    const el = document.getElementById(EXPLORE_COURSES_SECTION_ID);
    if (!el) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84;
    let id = 0;
    let frames = 0;
    let still = 0;
    const stop = () => {
      cancelAnimationFrame(id);
      for (const e of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(e, stop);
    };
    const step = () => {
      if (Math.abs(el.getBoundingClientRect().top - nav) > 1) {
        scrollTo(el, { offset: -nav, immediate: true });
        still = 0;
      } else still += 1;
      // Settled for ~20 frames, or give up after ~3s.
      if (still < 20 && frames++ < 180) id = requestAnimationFrame(step);
      else stop();
    };
    for (const e of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(e, stop, { passive: true });
    id = requestAnimationFrame(step);
    return stop;
  }, [scrollTo]);

  useEffect(() => {
    const check = () => {
      const panel = panelRef.current?.getBoundingClientRect();
      const sec = sectionRef.current?.getBoundingClientRect();
      if (!panel || !sec) return;
      setStuck(panel.bottom < BAR_TOP && sec.bottom > BAR_TOP + 160);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // Leaving the stuck state (scrolled back up to the panel) closes the sheet.
  const [prevStuck, setPrevStuck] = useState(stuck);
  if (stuck !== prevStuck) {
    setPrevStuck(stuck);
    if (!stuck) setSheet(false);
  }

  // Back to the top of the results, under the bar, so a new filter's first courses are what's seen.
  const toResults = () => {
    const el = resultsRef.current;
    if (el) scrollTo(el, { offset: -(BAR_TOP + (barRef.current?.offsetHeight ?? 60) + 16) });
  };
  const openSheet = () => {
    changed.current = false;
    setSheet(true);
  };
  function closeSheet() {
    setSheet(false);
    if (!changed.current) return;
    changed.current = false;
    // Unlock the page first (the lock is otherwise only lifted after this
    // render), then scroll on the next frame, once the new list has laid out.
    document.documentElement.style.overflow = "";
    requestAnimationFrame(() => requestAnimationFrame(toResults));
  }

  // The sheet: on phones a modal bottom sheet (page scroll locked behind it),
  // from 768px a panel dropping from the bar that closes on an outside click.
  useEffect(() => {
    if (!sheet) return;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const root = document.documentElement;
    const prev = root.style.overflow;
    if (phone) root.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    const outside = (e: MouseEvent) => !phone && barRef.current && !barRef.current.contains(e.target as Node) && closeSheet();
    document.addEventListener("keydown", esc);
    document.addEventListener("mousedown", outside);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", esc);
      document.removeEventListener("mousedown", outside);
    };
  });

  const setParam = (name: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(name, value);
    else sp.delete(name);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const indexes = useMemo(
    () =>
      courses.map((c) =>
        buildCourseSearchIndex({ ...c, extra: "CPD Certified" }),
      ),
    [courses],
  );
  const tokens = tokenizeSearchQuery(query);
  const searched = courses.filter(
    (_, i) => !tokens.length || matchesCourseSearch(indexes[i], tokens),
  );

  // Counts follow the search, so a tab never promises courses it won't show.
  const tabs = [{ name: "All courses", slug: "" }, ...subjects].map((s) => ({
    ...s,
    count: s.slug
      ? searched.filter((c) => c.categorySlug === s.slug).length
      : searched.length,
  }));
  const inSubject = searched.filter(
    (c) => !subject || c.categorySlug === subject,
  );
  const lengths = [...new Set(courses.map((c) => c.duration).filter(Boolean))]
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .map((d) => ({
      d,
      count: inSubject.filter((c) => c.duration === d).length,
    }));

  const by: Record<Sort, (a: ListCourse, b: ListCourse) => number> = {
    az: (a, b) => a.title.localeCompare(b.title),
    za: (a, b) => b.title.localeCompare(a.title),
    "price-asc": (a, b) => a.price - b.price || a.title.localeCompare(b.title),
    "price-desc": (a, b) => b.price - a.price || a.title.localeCompare(b.title),
    popular: (a, b) =>
      b.reviewCount - a.reviewCount || a.title.localeCompare(b.title),
  };
  const list = inSubject
    .filter((c) => !length || c.duration === length)
    .sort(by[sort]);

  const subjectName = subjects.find((x) => x.slug === subject)?.name ?? "All courses";
  const active = (subject ? 1 : 0) + (length ? 1 : 0) + (query ? 1 : 0);
  const clearAll = () => {
    setLength(null);
    router.replace(pathname, { scroll: false });
  };

  const visible = list.slice(0, shown);
  const left = list.length - visible.length;
  const items: ({ kind: "course"; c: ListCourse } | { kind: "team" })[] =
    visible.map((c) => ({ kind: "course" as const, c }));
  if (items.length)
    items.splice(Math.min(TEAM_AT, items.length), 0, { kind: "team" });

  return (
    <section
      ref={sectionRef}
      id={EXPLORE_COURSES_SECTION_ID}
      aria-label="Courses"
      className="ragged scroll-mt-[var(--home-nav-h)] bg-[#f2efe6] px-5 pb-24 pt-14 text-[#06180b] md:px-10 lg:pb-[110px] lg:pt-[70px]"
    >
      <div className="mx-auto max-w-site">
        {/* Filters: the subjects as one row of tabs (it swipes where they don't
            all fit), then a toolbar: course length on the left, the count and
            sort on the right. Phones stack the toolbar into two rows. */}
        <motion.div
          ref={panelRef}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-20 rounded-[18px] bg-[#f7f6f1] p-3 sm:p-4 md:p-5"
        >
          <SubjectTabs tabs={tabs} active={subject} onPick={(slug) => setParam("category", slug)} />

          <div className="mt-3 flex flex-col gap-3 border-t border-[#06180b]/8 pt-3 md:mt-4 md:flex-row md:items-center md:justify-between md:gap-6 md:pt-4">
            {lengths.length > 1 && (
              <div className="flex min-w-0 items-center gap-3">
                <span id="length-label" className="hidden shrink-0 type-small text-[#06180b]/65 lg:inline">
                  Course length
                </span>
                {/* One choice at a time, "Any" included, so clearing the filter is obvious. */}
                <div
                  role="radiogroup"
                  aria-labelledby="length-label"
                  className="grid flex-1 auto-cols-fr grid-flow-col gap-1 rounded-[10px] bg-[#efece4] p-1 md:flex-none"
                >
                  {[{ d: null as string | null, count: courses.length }, ...lengths].map(({ d, count }) => {
                    const on = length === d;
                    return (
                      <button
                        key={d ?? "any"}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setLength(d)}
                        className={`relative flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-3 type-small font-semibold transition-colors duration-300 ${
                          on ? "text-white" : "text-[#06180b]/75 hover:text-[#06180b]"
                        }`}
                      >
                        {on && (
                          <motion.span
                            layoutId="length-fill"
                            className="absolute inset-0 rounded-[7px] bg-[#06180b]"
                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          />
                        )}
                        {d && (
                          <span className={`relative hidden sm:inline ${on ? "text-[#1ee9b5]" : "text-[#0c7a5e]"}`}>
                            <Clock size={12} />
                          </span>
                        )}
                        <span className="relative">{d ?? <>Any<span className="hidden sm:inline"> length</span></>}</span>
                        <span className={`relative type-caption font-medium ${on ? "text-white/60" : "text-[#06180b]/45"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <p className="m-0 min-w-0 type-small text-[#06180b]/65" aria-live="polite">
                <span className="font-semibold text-[#06180b]">{visible.length}</span> of {list.length} course
                {list.length === 1 ? "" : "s"}
                {query && (
                  <>
                    {" "}
                    for “{query}”{" "}
                    <button
                      type="button"
                      onClick={() => setParam("q", "")}
                      className="font-medium text-[#0c7a5e] underline underline-offset-2 hover:text-[#06180b]"
                    >
                      Clear
                    </button>
                  </>
                )}
              </p>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>
        </motion.div>

        {/* The compact bar, under the navbar once the panel above has scrolled
            away: the filters button, the subjects (as quick chips from 1280px,
            as a summary below that) and the count. */}
        <div
          ref={barRef}
          inert={!stuck}
          // No transform on this wrapper or the sheet's ancestors: a transform
          // would become the containing block for the sheet's position:fixed.
          // While the sheet is open it lifts over the navbar (z-90) so the scrim covers that too.
          className={`fixed inset-x-0 px-5 md:px-10 ${sheet ? "z-[100]" : "z-[80]"} ${stuck ? "" : "pointer-events-none"}`}
          style={{ top: BAR_TOP + 8 }}
        >
          <div className="relative mx-auto max-w-site">
            <div
              className={`flex items-center gap-2 rounded-[14px] bg-[#f7f6f1]/95 p-1.5 shadow-[0_16px_40px_-20px_rgb(6_24_11/0.45)] ring-1 ring-[#06180b]/[0.08] backdrop-blur-md transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:gap-3 md:p-2 ${
                stuck ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
              }`}
            >
              <button
                type="button"
                aria-expanded={sheet}
                aria-controls="course-filters"
                onClick={() => (sheet ? closeSheet() : openSheet())}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 type-small font-semibold transition-colors ${sheet ? "bg-[#06180b] text-white" : "bg-[#06180b] text-white hover:bg-[#0c3a28]"}`}
              >
                <FiltersIcon />
                Filters
                {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#1ee9b5] type-caption font-semibold text-[#06180b]">{active}</span>}
              </button>
              <p className="m-0 min-w-0 flex-1 truncate type-small xl:hidden">
                <span className="font-semibold">{subjectName}</span>
                {length && <span className="text-[#06180b]/65"> · {length}</span>}
                {query && <span className="text-[#06180b]/65"> · “{query}”</span>}
              </p>
              <ul aria-label="Subjects" className="m-0 hidden min-w-0 flex-1 list-none gap-1.5 overflow-hidden p-0 xl:flex">
                {tabs.map((t) => (
                  <li key={t.name} className="shrink-0">
                    <Chip
                      on={t.slug === subject}
                      count={t.count}
                      onClick={() => {
                        setParam("category", t.slug);
                        toResults();
                      }}
                    >
                      {t.name}
                    </Chip>
                  </li>
                ))}
              </ul>
              <p className="m-0 shrink-0 pr-2 type-small text-[#06180b]/65" aria-hidden="true">
                <span className="font-semibold text-[#06180b]">{list.length}</span>
                <span className="hidden sm:inline"> course{list.length === 1 ? "" : "s"}</span>
              </p>
            </div>

            {/* Every filter: a bottom sheet on phones, a panel under the bar from 768px. */}
            <AnimatePresence>
              {sheet && (
                <>
                  <motion.div
                    key="scrim"
                    aria-hidden="true"
                    className="fixed inset-0 z-[99] bg-[#06180b]/45 md:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeSheet}
                  />
                  <motion.div
                    key="sheet"
                    id="course-filters"
                    role="dialog"
                    aria-label="Filter courses"
                    data-lenis-prevent
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-[24px] bg-[#f7f6f1] text-[#06180b] shadow-[0_-20px_60px_-20px_rgb(6_24_11/0.5)] md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-[calc(100%+8px)] md:max-h-[min(70vh,560px)] md:w-[min(560px,100%)] md:rounded-[18px] md:shadow-[0_30px_70px_-30px_rgb(6_24_11/0.5)] md:ring-1 md:ring-[#06180b]/[0.08]"
                  >
                    <div className="flex items-center justify-between border-b border-[#06180b]/[0.08] px-5 py-4">
                      <p className="m-0 font-title type-h4 tracking-[-0.03em]">Filter courses</p>
                      <button type="button" aria-label="Close filters" onClick={closeSheet} className="grid size-10 place-items-center rounded-full bg-[#efece4] hover:bg-[#e8e4d9]">
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                      {/* In each group the chips grow to fill their row, so wrapped rows line up. */}
                      <p className="m-0 type-caption font-semibold uppercase tracking-[0.08em] text-[#06180b]/55">Subject</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tabs.map((t) => (
                          <Chip
                            key={t.name}
                            fill
                            on={t.slug === subject}
                            count={t.count}
                            onClick={() => {
                              changed.current = true;
                              setParam("category", t.slug);
                            }}
                          >
                            {t.name}
                          </Chip>
                        ))}
                      </div>
                      {lengths.length > 1 && (
                        <>
                          <p className="m-0 mt-6 type-caption font-semibold uppercase tracking-[0.08em] text-[#06180b]/55">Course length</p>
                          <div role="radiogroup" aria-label="Course length" className="mt-3 flex flex-wrap gap-1.5">
                            {[{ d: null as string | null, count: inSubject.length }, ...lengths].map(({ d, count }) => (
                              <Chip
                                key={d ?? "any"}
                                fill
                                role="radio"
                                on={length === d}
                                count={count}
                                onClick={() => {
                                  changed.current = true;
                                  setLength(d);
                                }}
                              >
                                {d ?? "Any length"}
                              </Chip>
                            ))}
                          </div>
                        </>
                      )}
                      <p className="m-0 mt-6 type-caption font-semibold uppercase tracking-[0.08em] text-[#06180b]/55">Sort by</p>
                      <div role="radiogroup" aria-label="Sort courses" className="mt-3 flex flex-wrap gap-1.5">
                        {SORTS.map((o) => (
                          <Chip
                            key={o.value}
                            fill
                            role="radio"
                            on={sort === o.value}
                            onClick={() => {
                              changed.current = true;
                              setSort(o.value);
                            }}
                          >
                            {o.label}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t border-[#06180b]/[0.08] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          changed.current = true;
                          clearAll();
                        }}
                        disabled={!active}
                        className="h-12 shrink-0 rounded-full px-4 type-button font-medium text-[#0c7a5e] underline-offset-2 hover:underline disabled:text-[#06180b]/35 disabled:no-underline"
                      >
                        Clear all
                      </button>
                      <button type="button" onClick={closeSheet} className="h-12 flex-1 rounded-full bg-[#06180b] px-5 type-button font-semibold text-white hover:bg-[#0c3a28]">
                        Show {list.length} course{list.length === 1 ? "" : "s"}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div ref={resultsRef}>
        {/* The grid. */}
        {list.length ? (
          <motion.ul
            layout={!reduce}
            // The grid reveals once on screen; cards added later (more, or a new filter) animate straight in.
            onViewportEnter={() => setRevealed(true)}
            viewport={{ once: true, margin: "-6%" }}
            className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2 xl:grid-cols-3 [&>li]:min-w-0"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((it, i) => (
                <motion.li
                  key={it.kind === "team" ? "team" : it.c.slug}
                  layout={!reduce}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.25 },
                  }}
                  transition={{ layout: { duration: 0.6, ease: EASE } }}
                >
                  {/* A CSS entrance, which plays whenever a card mounts and never fights the layout move. */}
                  <div
                    className={`h-full ${
                      revealed || reduce
                        ? "motion-safe:animate-[card-in_0.75s_cubic-bezier(0.22,1,0.36,1)_both]"
                        : "opacity-0"
                    }`}
                    style={{ animationDelay: `${(i % 3) * 80}ms` }}
                  >
                    {it.kind === "team" ? (
                      <TeamCard />
                    ) : (
                      <CourseCard c={it.c} eager={i < 3} />
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="mt-8 rounded-[18px] bg-[#f7f6f1] px-6 py-16 text-center">
            <p className="m-0 font-title type-h4 tracking-[-0.03em]">
              No courses match that.
            </p>
            <p className="m-0 mt-2 type-body text-[#06180b]/70">
              Try another subject or length, or clear the search.
            </p>
            <button
              type="button"
              onClick={() => {
                setLength(null);
                router.replace(pathname, { scroll: false });
              }}
              className="mt-6 h-11 rounded-full bg-[#06180b] px-6 type-button font-medium text-white hover:bg-[#0c3a28]"
            >
              Show all courses
            </button>
          </div>
        )}
        </div>

        {/* How many seen, and more. */}
        {list.length > 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-5 lg:mt-[50px]">
            <div className="w-[216px] text-center">
              <p className="m-0 type-small text-[#06180b]/65">
                You’ve seen {visible.length} of {list.length} course
                {list.length === 1 ? "" : "s"}
              </p>
              <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[#06180b]/10">
                <motion.span
                  className="block h-full rounded-full bg-[#0c7a5e]"
                  animate={{
                    width: `${(visible.length / list.length) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
            </div>
            {left > 0 && (
              <button
                type="button"
                onClick={() => setShown((s) => s + MORE)}
                className="group flex h-[54px] items-center gap-4 rounded-full border border-[#06180b]/20 bg-[#f7f6f1] py-1 pl-6 pr-1.5 type-button font-medium transition-[border-color,background-color] duration-300 hover:border-[#06180b] hover:bg-white"
              >
                Show {Math.min(left, MORE)} more course
                {Math.min(left, MORE) === 1 ? "" : "s"}
                <span className="grid size-10 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform duration-500 group-hover:translate-y-0.5">
                  <span className="rotate-90">
                    <Arrow size={13} />
                  </span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes card-in { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
}
