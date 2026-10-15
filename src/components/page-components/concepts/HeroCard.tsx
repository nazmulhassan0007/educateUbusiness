"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { HomeCourse } from "../awwwards/types";
import { Arrow, EASE } from "./shared";

// Photos this page supplies for a course, matched on title because the API's
// slugs carry version suffixes ("fire-safety-awareness-v2").
const PHOTOS: [RegExp, string][] = [[/fire safety/i, "/hero/fire-safety.jpg"]];
export const photoFor = (c: HomeCourse) =>
  PHOTOS.find(([re]) => re.test(c.title))?.[1] ?? c.thumbnailImage ?? "/courses/course-photo.jpeg";

// Courses with their own photo lead, then the rest of the catalogue in order.
function pickFeatured(courses: HomeCourse[], count = 5) {
  const own = courses.filter((c) => PHOTOS.some(([re]) => re.test(c.title)));
  const rest = courses.filter((c) => !own.includes(c));
  return [...own, ...rest].slice(0, count);
}

// Seconds each course stays on the card before the next one comes in.
const DWELL = 6;
const TILT = 6;

/**
 * The hero's course card: one course at a time with a progress line under it.
 * Hover (or focus) holds the current course, tilts the card toward the
 * pointer, zooms the photo and slides a "View course" label up into it.
 * `still` renders the same box without timers, for the layer that only
 * reserves space.
 */
export default function HeroCard({ courses, still = false }: { courses: HomeCourse[]; still?: boolean }) {
  const list = useMemo(() => pickFeatured(courses), [courses]);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useReducedMotion();
  const rotating = !still && !reduce && list.length > 1;

  // Pointer position over the card, -0.5..0.5 on each axis, eased by a spring.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [TILT, -TILT]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-TILT, TILT]), spring);
  const shiftX = useSpring(useTransform(px, [-0.5, 0.5], [10, -10]), spring);
  const shiftY = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), spring);

  const course = list[index % Math.max(list.length, 1)];
  if (!course) return null;

  // Wraps both ways, so the arrows loop round the featured courses.
  const go = (i: number) => setIndex((i + list.length) % list.length);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (still || reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const release = () => {
    px.set(0);
    py.set(0);
    setHeld(false);
  };

  return (
    <div className="w-full [perspective:1200px]">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerEnter={() => setHeld(true)}
        onPointerMove={onMove}
        onPointerLeave={release}
        onFocus={() => setHeld(true)}
        onBlur={release}
      >
        <Link
          href={`/courses/${course.slug}`}
          className="group/card flex gap-3 rounded-[22px] bg-white/75 p-2 shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_0_0_1px_rgb(6_24_11/0.05),0_24px_50px_-30px_rgb(6_24_11/0.3)] backdrop-blur-xl transition-[transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_0_0_1px_rgb(6_24_11/0.06),0_40px_70px_-30px_rgb(6_24_11/0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c7a5e] lg:block lg:rounded-[26px] [@media(min-width:1024px)_and_(max-height:820px)]:flex"
        >
          <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-[16px] bg-[#06180b]/10 sm:w-36 lg:aspect-[16/9] lg:w-full [@media(min-width:1024px)_and_(min-height:821px)_and_(max-height:960px)]:aspect-[5/2] [@media(min-width:1024px)_and_(max-height:820px)]:aspect-[4/3] [@media(min-width:1024px)_and_(max-height:820px)]:w-36 lg:rounded-[20px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={course.slug}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {/* Inset a little so the pointer drift never shows an edge. */}
                <motion.div style={{ x: shiftX, y: shiftY }} className="absolute -inset-3">
                  <Image
                    src={photoFor(course)}
                    alt=""
                    fill
                    preload={!still && index === 0}
                    sizes="(min-width:1024px) 30vw, 144px"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.08]"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Shade and label that rise into the photo on hover. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#06180b]/70 via-[#06180b]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 lg:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2.5 left-2.5 hidden translate-y-3 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1ee9b5] py-1 pl-3 pr-1 type-caption font-medium text-[#06180b] opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:flex 2xl:bottom-3 2xl:left-3 2xl:gap-2 2xl:pl-4 2xl:type-small [@media(min-width:1024px)_and_(max-height:820px)]:pl-1"
            >
              {/* Short laptops get the side-by-side card with a 144px photo: just the arrow fits there. */}
              <span className="[@media(min-width:1024px)_and_(max-height:820px)]:hidden">View course</span>
              <span className="grid size-6 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] -rotate-45 transition-transform duration-500 group-hover/card:rotate-0 2xl:size-7">
                <Arrow size={11} />
              </span>
            </span>
          </div>

          <div className="relative min-w-0 flex-1 self-center overflow-hidden px-1 lg:px-3 lg:pb-3 lg:pt-4 [@media(min-width:1024px)_and_(max-height:820px)]:px-1 [@media(min-width:1024px)_and_(max-height:820px)]:py-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="m-0 line-clamp-1 type-caption text-[#0c7a5e]">{course.category}</p>
                {/* Smaller than type-h4: the card sits beside a 60–80px headline and has to stay the quieter element. */}
                <p className="m-0 mt-0.5 line-clamp-2 text-[17px] font-medium leading-[1.3] text-[#06180b] lg:mt-1 lg:line-clamp-1 lg:text-[18px] 2xl:text-[20px] [@media(min-width:1024px)_and_(max-height:820px)]:line-clamp-2">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:bg-[length:100%_1.5px]">
                    {course.title}
                  </span>
                </p>
                <p className="m-0 mt-1 line-clamp-1 type-small text-[#06180b]/55">{course.duration} · CPD certificate</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
      </motion.div>

      {/* One segment per course: the current one fills toward the next course (held
          while the card is hovered or focused). Segments and arrows pick a course by hand. */}
      {list.length > 1 && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {list.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${c.title}`}
                aria-current={i === index ? "true" : undefined}
                className="group/seg flex-1 cursor-pointer py-2"
              >
                <span className="block h-1.5 overflow-hidden rounded-full bg-[#0c7a5e]/12 transition-colors group-hover/seg:bg-[#0c7a5e]/25">
                  {i === index &&
                    (rotating ? (
                      <span
                        key={index}
                        onAnimationEnd={() => go(index + 1)}
                        className="block h-full origin-left rounded-full bg-[#0c7a5e]"
                        style={{ animation: `hero-progress ${DWELL}s linear forwards`, animationPlayState: held ? "paused" : "running" }}
                      />
                    ) : (
                      <span className="block h-full rounded-full bg-[#0c7a5e]" />
                    ))}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <StepButton label="Previous course" onClick={() => go(index - 1)} flip />
            <StepButton label="Next course" onClick={() => go(index + 1)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StepButton({ label, onClick, flip = false }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 cursor-pointer place-items-center rounded-full bg-white/75 text-[#06180b] shadow-[0_0_0_1px_rgb(6_24_11/0.08)] backdrop-blur-xl transition-colors hover:bg-[#1ee9b5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
    >
      <span className={flip ? "rotate-180" : undefined}>
        <Arrow size={12} />
      </span>
    </button>
  );
}
