"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { buildCourseSearchIndex, scoreCourseSearch, tokenizeSearchQuery } from "@/lib/courses/search";
import { formatPrice } from "@/lib/utils";
import { planForQuantity, useCartStore, type PurchaseType } from "@/store/cart-store";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { Check, EASE, toCartCourse } from "./shared";

const PLAN_NAME: Record<PurchaseType, string> = { personal: "Personal plan", group: "Group plan", enterprise: "Enterprise plan" };
// Checkout accepts up to 10,000 learners per course (see /api/checkout).
const MAX_PEOPLE = 10_000;
const PRESETS = [10, 25, 50, 100, 250];
// Courses listed before "Show all", keeping the panel level with the copy beside it.
const SHOWN = 4;

const STEPS = ["Choose your course", "Select individual, or group, or company purchase", "Complete checkout"];

/**
 * Enrol your whole team at once: the copy and three steps on the left, the
 * working team order on the right (from the design). Search or tick courses,
 * type or step the number of learners, and the plan and total follow; the whole order
 * goes into the cart in one go.
 */
export default function TeamOrder({ courses }: { faq?: HomeCms["faq"]; courses: HomeCourse[] }) {
  const [picked, setPicked] = useState<string[]>(() => courses.slice(0, 3).map((c) => c.slug));
  const [people, setPeopleRaw] = useState(25);
  // What's typed, kept apart from the number so the field can be cleared mid-edit.
  const [typed, setTyped] = useState("25");
  const [added, setAdded] = useState(false);
  const [allCourses, setAllCourses] = useState(false);
  const [query, setQuery] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const plan = planForQuantity(people);
  const chosen = courses.filter((c) => picked.includes(c.slug));
  const perPerson = chosen.reduce((s, c) => s + c.price, 0);
  const total = perPerson * people;

  // A search narrows the list to matching courses, best match first (see lib/courses/search).
  const indexed = useMemo(() => courses.map((course) => ({ course, index: buildCourseSearchIndex(course) })), [courses]);
  const listed = useMemo(() => {
    const tokens = tokenizeSearchQuery(query);
    if (!tokens.length) return courses;
    return indexed
      .map(({ course, index }) => ({ course, score: scoreCourseSearch(index, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
      .map((r) => r.course);
  }, [courses, indexed, query]);
  const visible = allCourses ? listed : listed.slice(0, SHOWN);

  const tween = useMotionValue(total);
  // Grouped (£45,000), since a big team runs to five or six figures.
  const shown = useTransform(tween, (v) => `£${Math.round(v).toLocaleString("en-GB")}`);
  useEffect(() => {
    const a = animate(tween, total, { duration: 0.5, ease: EASE });
    return () => a.stop();
  }, [tween, total]);

  const setPeople = (n: number) => {
    const next = Math.min(MAX_PEOPLE, Math.max(1, Math.round(n) || 1));
    setAdded(false);
    setPeopleRaw(next);
    setTyped(String(next));
  };

  const addAll = () => {
    if (added) return useCartStore.getState().setIsOpen(true);
    chosen.forEach((c, i) => addItem(toCartCourse(c), plan, people, null, i === chosen.length - 1));
    setAdded(true);
  };

  return (
    <section id="team" className="ragged relative scroll-mt-20 overflow-hidden bg-[#f7f6f1] px-5 py-24 text-[#06180b] md:px-10 lg:py-36" aria-labelledby="c-team">
      {/* The mint light behind the order panel. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_circle_at_89%_68%,rgb(30_233_181/0.22),transparent_72%)]" />
      <div className="relative mx-auto grid max-w-site items-center gap-14 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_618px]">
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <h2 id="c-team" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            Enrol your whole
            <br />
            team at once.
          </h2>
          <p className="m-0 mt-5 max-w-[460px] type-lead text-[#06180b]/60">
            educateU courses are open to individual learners and UK businesses alike.
          </p>
          <ol className="m-0 mt-11 grid list-none gap-4 p-0">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4 type-body">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white type-caption text-[#06180b] shadow-[0_1px_2px_rgb(6_24_11/0.06)]">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: EASE }}
          style={{ transformPerspective: 1600 }}
        >
          <div className="rounded-[28px] bg-[linear-gradient(180deg,#425c4d_0%,#243d2e_16%,#14201a_62%,#17221a_100%)] p-1.5 text-[#f2efe6] shadow-[-40px_40px_90px_-20px_rgb(6_24_11/0.5),inset_0_1px_0_rgb(255_255_255/0.08)]">
            {/* A window bar, with macOS's close / minimise / zoom lights. */}
            <div className="flex items-center gap-2 px-3.5 pb-3.5 pt-3">
              <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.25)]" />
              <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.25)]" />
              <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.25)]" />
              <span className="ml-2 type-caption text-white/55">Team order</span>
              <motion.span key={plan} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-auto rounded-[5px] bg-[#1ee9b5] px-2 py-[3px] type-caption font-semibold text-[#06180b]">
                {PLAN_NAME[plan]}
              </motion.span>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,#405a4b_0%,#1c2a22_45%,#131b16_100%)] px-5 pb-5 pt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="m-0 type-caption text-white/50">Courses</p>
                {picked.length > 0 && <p className="m-0 type-caption text-white/50">{picked.length} selected</p>}
              </div>
              <label className="mt-2.5 flex h-10 items-center gap-2.5 rounded-[10px] border border-white/12 bg-white/[0.04] px-3 transition-colors focus-within:border-[#1ee9b5]/60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-white/50">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="sr-only">Search courses</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses"
                  className="h-full min-w-0 flex-1 bg-transparent type-small text-white outline-none placeholder:text-white/45 [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-6 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="m1 1 8 8M9 1 1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </label>
              {!listed.length && <p className="m-0 mt-3 px-2.5 py-2 type-small text-white/55">No courses match &ldquo;{query.trim()}&rdquo;.</p>}
              {/* No scroll box inside the page: four courses, the rest on request. minmax(0,1fr) lets long titles truncate. */}
              <ul className="m-0 mt-[7px] grid list-none grid-cols-[minmax(0,1fr)] gap-1 p-0">
                {visible.map((c) => {
                  const on = picked.includes(c.slug);
                  return (
                    <li key={c.slug}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setAdded(false);
                          setPicked((p) => (on ? p.filter((s) => s !== c.slug) : [...p, c.slug]));
                        }}
                        className={`flex h-9 w-full items-center gap-3 rounded-[10px] px-2.5 text-left type-small transition-colors duration-200 ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
                      >
                        <span
                          className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-[background-color,box-shadow,transform] duration-200 ${
                            on ? "scale-100 bg-[#1ee9b5] text-[#06180b]" : "shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.25)]"
                          }`}
                        >
                          {on && <Check size={10} />}
                        </span>
                        <span className={`min-w-0 flex-1 truncate ${on ? "text-white" : "text-white/70"}`}>{c.title}</span>
                        <span className="hidden shrink-0 type-caption text-white/50 sm:inline">{c.duration}</span>
                        <span className="w-[26px] shrink-0 text-right type-small tabular-nums text-white/90">{formatPrice(c.price)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {listed.length > SHOWN && (
                <button
                  type="button"
                  onClick={() => setAllCourses((v) => !v)}
                  className="mt-2 h-10 w-full rounded-[10px] border border-white/12 type-button text-white/80 transition-colors hover:border-white/25 hover:text-white"
                >
                  {allCourses ? "Show fewer" : query.trim() ? `Show all ${listed.length} matches` : `Show all ${courses.length} courses`}
                  {!allCourses && picked.some((p) => !visible.some((c) => c.slug === p)) ? " (more selected)" : ""}
                </button>
              )}

              <div className="mt-4 border-t border-white/[0.08] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="c-people" className="type-small text-white/50">
                    Learners
                  </label>
                  <span className="type-caption text-white/40">Up to {MAX_PEOPLE.toLocaleString("en-GB")}</span>
                </div>
                {/* Type any team size, or step it, or pick a common one. */}
                <div className="mt-2.5 flex h-12 items-stretch overflow-hidden rounded-[12px] border border-white/12 bg-white/[0.04] transition-colors focus-within:border-[#1ee9b5]/60">
                  <StepButton label="One fewer learner" disabled={people <= 1} onClick={() => setPeople(people - 1)}>
                    <path d="M3 7h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </StepButton>
                  <input
                    id="c-people"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={typed}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                      setTyped(digits);
                      if (digits) {
                        setAdded(false);
                        setPeopleRaw(Math.min(MAX_PEOPLE, Math.max(1, Number(digits))));
                      }
                    }}
                    onBlur={() => setPeople(Number(typed))}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setPeople(people + (e.key === "ArrowUp" ? 1 : -1));
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-center font-[family-name:var(--font-geist-mono)] type-h3 tabular-nums text-white outline-none"
                  />
                  <StepButton label="One more learner" disabled={people >= MAX_PEOPLE} onClick={() => setPeople(people + 1)}>
                    <path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </StepButton>
                </div>
                {Number(typed) > MAX_PEOPLE && (
                  <p className="m-0 mt-2 type-caption text-[#f2c94c]">
                    One order takes up to {MAX_PEOPLE.toLocaleString("en-GB")} learners. For a bigger team, get in touch for an enterprise quote.
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPeople(n)}
                      aria-pressed={people === n}
                      className={`h-8 rounded-full px-3 type-caption tabular-nums transition-colors ${
                        people === n ? "bg-[#1ee9b5] font-semibold text-[#06180b]" : "border border-white/12 text-white/75 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-[14px] border border-white/10 bg-[#1c231f]/70 px-4 py-[13px]">
                <div>
                  <p className="m-0 type-caption text-white/55">
                    {people} × {formatPrice(perPerson)} · certificates included
                  </p>
                  <motion.p className="m-0 mt-1.5 font-[family-name:var(--font-geist-mono)] type-h3 tracking-[-0.02em] tabular-nums text-[#1ee9b5]">{shown}</motion.p>
                </div>
                <button
                  type="button"
                  onClick={addAll}
                  disabled={!chosen.length}
                  className="h-11 rounded-[10px] bg-[#1ee9b5] px-[18px] type-button font-medium text-[#06180b] transition-[background-color,transform] duration-200 hover:bg-[#5ef0c9] active:scale-[0.98] disabled:opacity-40"
                >
                  {added ? "Added, view cart" : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid w-14 shrink-0 place-items-center text-white/80 transition-colors hover:bg-white/[0.06] hover:text-[#1ee9b5] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/80"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
