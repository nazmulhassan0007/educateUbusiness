"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { observeVisibility, prefersReducedMotion } from "@/lib/motion-budget";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import Grain from "../awwwards/Grain";
import Intro from "../awwwards/Intro";
import type { HomeCms, HomeCourse } from "../awwwards/types";
import { Arrow, Check, EASE, Glows, Plus, toCartCourse } from "./shared";
import BrowseSubjects from "./BrowseSubjects";
import CourseExplorer from "./CourseExplorer";
import PopularCourses from "./PopularCourses";
import EnrolToCertificate from "./EnrolToCertificate";
import Hero, { type HeroKind } from "./Heroes";
import TeamOrder from "./TeamOrder";
import LearnerReviews from "../all-courses/LearnerReviews";
import FaqSection from "./FaqSection";

/**
 * The homepage, "Daylight": the film plays inside the headline and opens to
 * full frame; then the team order, the courses, and the sections carried over
 * from the earlier build (statement, reasons, reviews, FAQ, closing film).
 */
export default function ConceptC({
  cms,
  courses,
  hero = "letters",
  catalogue = "popular",
}: {
  cms: HomeCms;
  courses: HomeCourse[];
  hero?: HeroKind;
  catalogue?: "popular" | "explorer" | "reel";
}) {
  return (
    <div className="min-h-screen bg-[#06180b] font-sans text-[#f2efe6] antialiased">
      <Intro />
      <Grain />
      <main>
        {/* Bands alternate dark and light all the way down. */}
        <Hero kind={hero} cms={cms} courses={courses} />
        <BrowseSubjects courses={courses} />
        {catalogue === "reel" ? (
          <Reel data={cms.courses} courses={courses} />
        ) : (
          catalogue === "explorer" ? (
            <CourseExplorer data={cms.courses} courses={courses} />
          ) : (
            <PopularCourses data={cms.courses} courses={courses} />
          )
        )}
        <EnrolToCertificate />
        <TeamOrder faq={cms.faq} courses={courses} />
        {/* The client logos between the team order and the reviews. */}
        <Logos />
        {/* The same reviews section as the Courses page: one design, one motion. */}
        <LearnerReviews data={cms.reviews} />
        <FaqSection />
      </main>
    </div>
  );
}

// The accreditations and memberships, as on the educateU site.
const ACCREDITATIONS = [
  { src: "/home/accreditations/cpd.png", alt: "CPD Certified" },
  { src: "/home/accreditations/ico.png", alt: "Information Commissioner's Office" },
  { src: "/home/accreditations/disability-confident.png", alt: "Disability Confident Committed" },
  { src: "/home/accreditations/good-business-charter.png", alt: "Good Business Charter" },
  { src: "/home/accreditations/able-futures.png", alt: "Able Futures" },
  { src: "/home/accreditations/ioa.png", alt: "Institute of Analytics" },
  { src: "/home/accreditations/othm.svg", alt: "OTHM Qualifications" },
];

/**
 * Trusted by: the accreditation logos drifting past in a loop, in their own
 * colours; the strip eases to a stop under the pointer and eases off again.
 *
 * The track holds two identical sets, each carrying its own trailing gap, so
 * moving it by exactly half its width lands the second set where the first
 * began: no seam, at any width. The move is a 3D translate on a layer of its
 * own, which Safari composites on the GPU instead of repainting the strip
 * (and its fade mask) every frame.
 */
/** Seconds for one full set of logos to pass at full speed. */
const LOGO_LOOP_S = 50;

function Logos() {
  const track = useRef<HTMLDivElement>(null);
  // 1 = full speed, 0 = stopped (mouse over the strip).
  const target = useRef(1);

  // Driven from a rAF loop rather than a CSS animation: easing a CSS
  // animation's speed via `updatePlaybackRate()` makes Safari snap its
  // compositor-run animation back to the main thread's (older) time on every
  // call, which read as the strip jerking backwards on hover. Owning the
  // position here keeps the slow-down identical in every browser.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    let half = el.scrollWidth / 2;
    const ro = new ResizeObserver(() => {
      half = el.scrollWidth / 2;
    });
    ro.observe(el);

    let x = 0;
    let rate = 1;
    let last = 0;
    let frame = 0;
    const tick = (now: number) => {
      // Clamped so a long gap (tab hidden, scrolled away) doesn't lurch.
      const dt = last ? Math.min(now - last, 100) / 1000 : 0;
      last = now;
      // Exponential ease toward the target speed — settles in ~0.7s.
      rate += (target.current - rate) * (1 - Math.exp(-dt / 0.2));
      if (half > 0) x = (x + (half / LOGO_LOOP_S) * rate * dt) % half;
      el.style.transform = `translate3d(${-x}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const stopVisibility = observeVisibility(el, (visible) => {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible) frame = requestAnimationFrame(tick);
    });

    return () => {
      stopVisibility();
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  const set = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="m-0 flex shrink-0 list-none items-center gap-14 p-0 pr-14 md:gap-24 md:pr-24">
      {ACCREDITATIONS.map((l) => (
        <li key={l.src} className="flex h-12 shrink-0 items-center md:h-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={l.src}
            alt={copy ? "" : l.alt}
            decoding="async"
            draggable={false}
            className="h-full w-auto max-w-[150px] select-none object-contain"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="relative border-y border-[#06180b]/[0.07] bg-[#f7f6f1] px-5 py-12 md:px-10 md:py-16" aria-label="Trusted by">
      <motion.div
        className="mx-auto flex max-w-site"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") target.current = 0;
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") target.current = 1;
          }}
          className="min-w-0 flex-1 overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        >
          <div
            ref={track}
            className="flex w-max [backface-visibility:hidden] [will-change:transform]"
          >
            {set(false)}
            {set(true)}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const FIRST = 6;

/**
 * The course reel. Six courses show first; the rest arrive on request, each
 * card rising out of a mask in turn. Changing subject re-deals the cards.
 */
function Reel({ data, courses }: { data?: HomeCms["courses"]; courses: HomeCourse[] }) {
  const subjects = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))], [courses]);
  const [subject, setSubject] = useState("All");
  const [all, setAll] = useState(false);
  const filtered = subject === "All" ? courses : courses.filter((c) => c.category === subject);
  const list = all ? filtered : filtered.slice(0, FIRST);
  const hidden = filtered.length - FIRST;
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  return (
    <section id="courses" className="relative overflow-hidden bg-[#06180b] px-5 py-24 md:px-10 md:py-32" aria-labelledby="c-reel">
      <Glows
        spots={[
          { at: "left:-10% top:5%", size: "45vw", color: "rgb(30 233 181 / 0.22)" },
          { at: "right:-15% top:35%", size: "50vw", color: "rgb(12 93 72 / 0.55)" },
          { at: "left:20% bottom:-10%", size: "40vw", color: "rgb(30 233 181 / 0.14)" },
        ]}
      />
      <div className="relative mx-auto max-w-site">
        <motion.div
          className="flex flex-wrap items-end justify-between gap-8"
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <h2 id="c-reel" className="m-0 font-title type-h2 tracking-[-0.05em]">
            {data?.title ?? "Popular Courses"}
          </h2>
          <p className="m-0 max-w-[42ch] type-lead text-white/60">{data?.description}</p>
        </motion.div>
        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter by subject">
          {["All", ...subjects].map((s) => {
            const on = s === subject;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setSubject(s);
                  setAll(false);
                }}
                className={`relative rounded-full px-5 py-2.5 type-small transition-colors ${on ? "text-[#06180b]" : "glass text-white/75 hover:text-white"}`}
              >
                {on && <motion.span layoutId="c-subject" className="absolute inset-0 rounded-full bg-[#1ee9b5]" transition={{ duration: 0.45, ease: EASE }} />}
                <span className="relative">{s}</span>
              </button>
            );
          })}
        </div>

        <motion.ul layout className="m-0 mt-8 grid list-none gap-2.5 p-0 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((c, i) => {
              const inCart = items.some((it) => it.course.slug === c.slug);
              // New arrivals after "show all" follow on from the first six.
              const order = i >= FIRST ? i - FIRST : i;
              return (
                <motion.li
                  key={`${subject}-${c.slug}`}
                  layout
                  initial={{ opacity: 0, y: 60, clipPath: "inset(18% 0 0 0 round 24px)" }}
                  whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0 round 24px)" }}
                  viewport={{ once: true, margin: "-5%" }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.9, delay: (order % 6) * 0.08, ease: EASE }}
                >
                  {/* Phones: a compact row, so six courses fit on about one screen. */}
                  <article className="glass flex items-center gap-3 rounded-[20px] p-2 pr-3 sm:hidden">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-[14px] bg-black">
                      <Image src={c.thumbnailImage || "/courses/course-photo.jpeg"} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 type-caption text-[#1ee9b5]">{c.category}</p>
                      <Link href={`/courses/${c.slug}`} className="mt-0.5 line-clamp-2 block type-h4 font-medium">
                        {c.title}
                      </Link>
                      <p className="m-0 mt-1 type-small text-white/55">
                        {c.duration} · <span className="text-white">{formatPrice(c.price)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (inCart ? useCartStore.getState().setIsOpen(true) : addItem(toCartCourse(c), undefined, undefined, undefined, false))}
                      aria-label={inCart ? `${c.title} is in your cart` : `Add ${c.title} to cart`}
                      className={`grid size-11 shrink-0 place-items-center rounded-full ${inCart ? "bg-white text-[#06180b]" : "bg-[#1ee9b5] text-[#06180b]"}`}
                    >
                      {inCart ? <Check /> : <Plus />}
                    </button>
                  </article>
                  <article className="group relative hidden aspect-[4/5] overflow-hidden isolate rounded-[24px] bg-black ring-1 ring-white/10 sm:block">
                    <Image
                      src={c.detail?.image || c.thumbnailImage || "/courses/course-photo.jpeg"}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover opacity-80 transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.06] group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 glass rounded-full px-3 py-1 type-caption">{c.category}</span>
                    {/* The whole card opens the course; the plate below keeps its own title link on top. */}
                    <Link href={`/courses/${c.slug}`} data-cursor="View" tabIndex={-1} aria-hidden="true" className="absolute inset-0" />
                    <div className="glass absolute inset-x-3 bottom-3 rounded-[18px] p-5">
                      {/* Hover screens: the description opens to its real height (grid rows 0fr to 1fr), then fades up. */}
                      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr]">
                        <div className="min-h-0 overflow-hidden">
                          <p className="m-0 pb-3 line-clamp-2 type-small text-white/90 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:delay-150">
                            {c.description}
                          </p>
                        </div>
                      </div>
                      <Link href={`/courses/${c.slug}`} data-cursor="View" className="block font-title type-h4 tracking-[-0.02em] after:absolute after:inset-0">
                        {c.title}
                      </Link>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="type-small text-white/70">
                          {c.duration} · CPD certificate · <span className="text-white">{formatPrice(c.price)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => (inCart ? useCartStore.getState().setIsOpen(true) : addItem(toCartCourse(c), undefined, undefined, undefined, false))}
                          aria-label={inCart ? `${c.title} is in your cart` : `Add ${c.title} to cart`}
                          className={`relative z-10 grid size-11 place-items-center rounded-full transition-colors ${inCart ? "bg-white text-[#06180b]" : "bg-[#1ee9b5] text-[#06180b] hover:bg-white"}`}
                        >
                          {inCart ? <Check /> : <Plus />}
                        </button>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {hidden > 0 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              aria-expanded={all}
              className="glass group flex items-center gap-3 rounded-full py-2 pl-6 pr-2 type-button text-white transition-colors hover:bg-white/10"
            >
              {all ? "Show fewer" : `Show all ${filtered.length} courses`}
              <span className={`grid size-10 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 ${all ? "-rotate-90" : "rotate-90"}`}>
                <Arrow />
              </span>
            </button>
            {data?.cta && (
              <Link href={data.cta.url} className="type-small text-white/55 underline-offset-4 hover:text-white hover:underline">
                {data.cta.text}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
