"use client";

import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type LearnerReviewsContent = {
  title?: string;
  description?: string;
  reviews?: { name?: string; quote?: string; position?: string }[];
};

type Review = { name: string; role: string; long: string; short: string; initials: string };

// The design's trims where the opening sentences run long.
const SHORT: [RegExp, string][] = [
  [/atanu/i, "The courses were highly useful and provided a solid understanding of essential topics such as fire safety, equality, diversity and inclusion, harassment and sexual misconduct."],
  [/merazul/i, "I learned practical concepts and skills that are directly applicable to my role, particularly in improving my understanding of key processes and best practices. The course content was well-structured and relevant."],
];

// Seconds a review stays featured before the next takes its place.
const DWELL = 8;

const uk = (s: string) => s.replace(/radicaliz/gi, "radicalis");
const sentences = (s: string) => (s.trim().match(/[^.!?]+[.!?]+/g) ?? [s]).map((x) => x.trim());
// "ATANU B." → "Atanu B."
const tidyName = (n: string) => n.trim().replace(/\b([A-Z])([A-Z]+)\b/g, (_, a: string, b: string) => a + b.toLowerCase());
const initialsOf = (n: string) =>
  n
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

function toReview(r: NonNullable<LearnerReviewsContent["reviews"]>[number]): Review | null {
  const name = tidyName(r.name ?? "");
  const quote = uk((r.quote ?? "").trim());
  if (!name || !quote) return null;
  const s = sentences(quote);
  const end = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);
  return {
    name,
    role: r.position?.trim() ?? "",
    initials: initialsOf(name),
    long: end(s.slice(0, 2).join(" ").trim()),
    short: end(SHORT.find(([re]) => re.test(name))?.[1] ?? s.slice(0, s[0].length > 160 ? 1 : 2).join(" ").trim()),
  };
}

function Avatar({ r, tone }: { r: Review; tone: "mint" | "ink" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[43px] shrink-0 place-items-center rounded-[10px] type-caption font-semibold ${tone === "mint" ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b] text-[#1ee9b5]"}`}
    >
      {r.initials}
    </span>
  );
}

/**
 * What our learners say: one review large on green, the others stacked beside
 * it. Choosing one on the right brings it into the large card; on its own the
 * large card moves to the next review every few seconds.
 *
 * Motion: the title rises word by word and the cards follow; the featured
 * quote rises in word by word; the stack re-orders smoothly; a line under
 * the featured review counts down to the next.
 */
export default function LearnerReviews({ data }: { data?: LearnerReviewsContent }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { margin: "-20%" });
  const reviews = (data?.reviews ?? []).map(toReview).filter((r): r is Review => Boolean(r));
  const [lead, setLead] = useState(0);
  const [held, setHeld] = useState(false);

  const running = !reduce && !held && seen && reviews.length > 1;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setLead((l) => (l + 1) % reviews.length), DWELL * 1000);
    return () => window.clearTimeout(id);
  }, [running, lead, reviews.length]);

  if (!reviews.length) return null;
  const featured = reviews[lead % reviews.length];
  // The rest in their usual order, starting after the featured one.
  const others = reviews.map((_, i) => reviews[(lead + 1 + i) % reviews.length]).slice(0, reviews.length - 1);

  const rawTitle = data?.title?.trim() || "What our learners say";
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const up: Variants = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.06, ease: EASE } }) };
  const fade: Variants = { hide: { opacity: 0, y: 30 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }) };

  return (
    <section ref={ref} aria-labelledby="learners-title" className="ragged bg-[#f2efe6] px-5 pb-16 pt-20 text-[#06180b] md:px-10 md:py-28 lg:pb-[145px] lg:pt-[118px]">
      <motion.div {...group} className="mx-auto max-w-site">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h2 id="learners-title" className="m-0 font-title type-h2 font-normal tracking-[-0.05em]">
            {title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-top">
                <motion.span className="inline-block" variants={up} custom={i}>
                  {w}
                  {" "}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.2} className="m-0 max-w-[360px] type-lead text-[#06180b]/70 lg:mb-[14px]">
            {data?.description?.trim() || "Hear directly from the learners who’ve completed our courses."}
          </motion.p>
        </div>

        {/* Up to 1279px (phones, tablets, small laptops): every review in one swipeable row. */}
        <ReviewsCarousel reviews={reviews} seen={seen} reduce={!!reduce} />

        {/* From 1280px: one review large, the others stacked beside it. Below
            that the side column is too narrow: its three cards stack taller
            than a 1024px screen and stretch the large card into an empty slab. */}
        <div className="mt-[46px] hidden gap-6 xl:grid xl:grid-cols-[minmax(0,743fr)_minmax(0,544fr)]" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
          {/* The featured review. */}
          <motion.figure
            variants={fade}
            custom={0.2}
            className="relative m-0 flex min-h-[520px] flex-col overflow-hidden rounded-[16px] bg-[#0c3a28] p-8 text-[#f2efe6] md:p-12"
            aria-live="polite"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[480px] rounded-full bg-[#1ee9b5]/10 blur-3xl motion-safe:animate-[glow-drift_18s_ease-in-out_infinite]" />
            <svg aria-hidden="true" width="58" height="45" viewBox="0 0 58 45" fill="#1ee9b5" className="relative shrink-0">
              <path d="M0 45V27.6C0 12.9 6.6 3.7 19.8 0l3.3 5.6C15.6 8.6 12.1 13.4 11.4 20.4H24V45H0Zm34 0V27.6C34 12.9 40.6 3.7 53.8 0l3.3 5.6c-7.5 3-11 7.8-11.7 14.8H58V45H34Z" />
            </svg>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={featured.name} className="relative mt-auto flex flex-col" exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}>
                <blockquote className="m-0 mt-16 font-title type-h3 tracking-[-0.04em] xl:mt-0">
                  {`“${featured.long}”`.split(" ").map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
                      <motion.span
                        className="inline-block"
                        initial={reduce ? false : { y: "105%" }}
                        animate={{ y: "0%", transition: { duration: 0.7, delay: 0.1 + i * 0.012, ease: EASE } }}
                      >
                        {w}
                        {" "}
                      </motion.span>
                    </span>
                  ))}
                </blockquote>
                <figcaption className="mt-14 flex items-center gap-3 xl:mt-[130px]">
                  <Avatar r={featured} tone="mint" />
                  <span>
                    <span className="block type-body font-semibold">{featured.name}</span>
                    {featured.role && <span className="block type-small text-white/60">{featured.role}</span>}
                  </span>
                  {/* Time until the next review. */}
                  {reviews.length > 1 && (
                    <span aria-hidden="true" className="ml-auto hidden h-[2px] w-28 overflow-hidden rounded-full bg-white/15 sm:block">
                      <motion.span
                        key={`${featured.name}-${running}`}
                        className="block h-full origin-left bg-[#1ee9b5]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: running ? 1 : 0 }}
                        transition={{ duration: running ? DWELL : 0.3, ease: "linear" }}
                      />
                    </span>
                  )}
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </motion.figure>

          {/* The others. */}
          <LayoutGroup>
            <motion.ul variants={fade} custom={0.35} className="m-0 flex list-none flex-col gap-6 p-0" aria-label="More reviews">
              {others.map((r) => (
                // The one that just left the large card slides in; the rest glide to their new places.
                <motion.li
                  key={r.name}
                  layout={!reduce}
                  transition={{ layout: { duration: 0.7, ease: EASE } }}
                  className="motion-safe:animate-[review-in_0.7s_cubic-bezier(0.22,1,0.36,1)_both]"
                >
                  <button
                    type="button"
                    onClick={() => setLead(reviews.indexOf(r))}
                    aria-label={`Feature ${r.name}’s review`}
                    className="group block w-full rounded-[16px] bg-[#f7f6f1] p-7 text-left transition-[background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_50px_-30px_rgb(6_24_11/0.35)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1ee9b5]"
                  >
                    <span className="block type-body text-[#06180b]/85">{`“${r.short}”`}</span>
                    <span className="mt-5 flex items-center gap-3">
                      <Avatar r={r} tone="ink" />
                      <span>
                        <span className="block type-body font-semibold">{r.name}</span>
                        {r.role && <span className="block type-small text-[#06180b]/60">{r.role}</span>}
                      </span>
                      <span aria-hidden="true" className="ml-auto translate-x-2 type-small font-medium text-[#0c7a5e] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        Read in full
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </LayoutGroup>
        </div>
      </motion.div>
      <style>{`@keyframes review-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
}

/**
 * Below 1280px the reviews run in a row you swipe through, each snapping into
 * place with the next one peeking in from the right. They slide in from the
 * side when the section arrives, one after another. The review in front is at
 * full strength; its neighbours sit back a little until they're brought in.
 *
 * Under the row, a segment per review (the current one fills toward the next
 * while the row plays) and previous / next buttons. The row plays on its own
 * only until the reader takes over: one swipe or tap and it stays where they
 * put it.
 */
function ReviewsCarousel({ reviews, seen, reduce }: { reviews: Review[]; seen: boolean; reduce: boolean }) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const [taken, setTaken] = useState(false);
  const playing = !reduce && !taken && seen && reviews.length > 1;

  const slides = () => [...(track.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? [])];

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      const slide = slides()[(i + reviews.length) % reviews.length];
      if (!el || !slide) return;
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      el.scrollTo({ left: slide.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce, reviews.length],
  );

  // The slide nearest the row's start edge is the current one; once the row
  // is scrolled to its end, the last one (it sits against the end edge).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
        const at = el.scrollLeft + pad;
        let best = 0;
        slides().forEach((s, i) => {
          if (Math.abs(s.offsetLeft - at) < Math.abs(slides()[best].offsetLeft - at)) best = i;
        });
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) best = slides().length - 1;
        setCurrent(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => goTo(current + 1), DWELL * 1000);
    return () => window.clearTimeout(id);
  }, [playing, current, goTo]);

  const take = () => setTaken(true);

  return (
    <div className="mt-10 md:mt-12 xl:hidden" role="region" aria-roledescription="carousel" aria-label="Learner reviews">
      <motion.ul
        ref={track}
        onPointerDown={take}
        onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && take()}
        className="-mx-5 m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 py-1 [scrollbar-width:none] sm:gap-4 md:-mx-10 md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden"
        initial={reduce ? false : "hide"}
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      >
        {reviews.map((r, i) => {
          const front = i === current;
          return (
            <motion.li
              key={r.name}
              data-slide
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${reviews.length}`}
              // The last slide snaps to the end edge, so the row finishes flush
              // (the one before it peeking in) rather than on a blank.
              className={`flex w-[86%] shrink-0 sm:w-[72%] md:w-[62%] ${i === reviews.length - 1 ? "snap-end" : "snap-start"}`}
              variants={{
                hide: { opacity: 0, x: 80 },
                show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
              }}
            >
              <figure
                onClick={() => {
                  if (front) return;
                  take();
                  goTo(i);
                }}
                className={`relative m-0 flex w-full flex-col overflow-hidden rounded-[16px] bg-[#0c3a28] p-7 text-[#f2efe6] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-9 ${
                  front ? "opacity-100" : "cursor-pointer opacity-55 motion-safe:scale-[0.96]"
                }`}
              >
                <span aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 size-[320px] rounded-full bg-[#1ee9b5]/10 blur-3xl" />
                <svg aria-hidden="true" width="38" height="30" viewBox="0 0 58 45" fill="#1ee9b5" className="relative shrink-0">
                  <path d="M0 45V27.6C0 12.9 6.6 3.7 19.8 0l3.3 5.6C15.6 8.6 12.1 13.4 11.4 20.4H24V45H0Zm34 0V27.6C34 12.9 40.6 3.7 53.8 0l3.3 5.6c-7.5 3-11 7.8-11.7 14.8H58V45H34Z" />
                </svg>
                <blockquote className="relative m-0 mt-8 font-title type-h4 tracking-[-0.03em] md:mt-10">{`“${r.long}”`}</blockquote>
                <figcaption className="relative mt-auto flex items-center gap-3 pt-10">
                  <Avatar r={r} tone="mint" />
                  <span className="min-w-0">
                    <span className="block type-body font-semibold">{r.name}</span>
                    {r.role && <span className="block truncate type-small text-white/60">{r.role}</span>}
                  </span>
                </figcaption>
              </figure>
            </motion.li>
          );
        })}
      </motion.ul>

      {reviews.length > 1 && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex flex-1 gap-1.5">
            {reviews.map((r, i) => (
              <button
                key={r.name}
                type="button"
                aria-label={`Show review ${i + 1} of ${reviews.length}, from ${r.name}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => {
                  take();
                  goTo(i);
                }}
                className="flex-1 py-3"
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-[#06180b]/12">
                  {i < current && <span className="block h-full bg-[#0c7a5e]" />}
                  {i === current && (
                    <motion.span
                      key={`${current}-${playing}`}
                      className="block h-full origin-left bg-[#0c7a5e]"
                      initial={{ scaleX: playing ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: playing ? DWELL : 0, ease: "linear" }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <StepButton label="Previous review" disabled={current === 0} onClick={() => (take(), goTo(current - 1))} flip />
            <StepButton label="Next review" disabled={current === reviews.length - 1} onClick={() => (take(), goTo(current + 1))} />
          </div>
        </div>
      )}
    </div>
  );
}

function StepButton({ label, onClick, disabled, flip = false }: { label: string; onClick: () => void; disabled: boolean; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-[#06180b]/15 text-[#06180b] transition-[background-color,border-color,opacity] duration-300 active:scale-95 enabled:hover:border-[#06180b] disabled:opacity-35"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={flip ? "rotate-180" : undefined}>
        <path d="M2 7h10m0 0L7.5 2.5M12 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
