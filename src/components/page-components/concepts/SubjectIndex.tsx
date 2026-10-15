"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import Reveal from "../awwwards/Reveal";
import type { HomeCourse } from "../awwwards/types";
import { Arrow, EASE } from "./shared";

type Subject = { name: string; slug?: string; image: string; courses: HomeCourse[] };

// Subjects with their own photograph; the rest borrow one from their courses.
const SUBJECT_PHOTOS: Record<string, string> = {
  "health & safety": "/home/subject-health-safety.jpg",
};

// "2 hours" reads as "2 HRS" in the mono lists.
const hours = (duration: string) => {
  const n = duration.match(/[\d.]+/)?.[0];
  return n ? `${n} HR${n === "1" ? "" : "S"}` : duration.toUpperCase();
};

/** "A, B, C and 5 more", from a subject's course titles. */
function sample(courses: HomeCourse[]) {
  const names = courses.slice(0, 3).map((c) => c.title);
  const rest = courses.length - names.length;
  return rest > 0 ? `${names.join(", ")} and ${rest} more` : names.join(", ");
}

/**
 * The catalogue by subject: an index of subjects on the left, and the chosen
 * subject's courses beside it with a way straight into that subject.
 */
export default function SubjectIndex({ courses }: { courses: HomeCourse[] }) {
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
        slug: list[0].categorySlug,
        courses: list,
        image: SUBJECT_PHOTOS[name.toLowerCase()] ?? list.find((c) => c.detail?.image)?.detail?.image ?? list[0].thumbnailImage ?? "/courses/course-photo.jpeg",
      }));
  }, [courses]);
  const [open, setOpen] = useState(0);
  if (!subjects.length) return null;

  const current = subjects[open];
  const price = Math.min(...courses.map((c) => c.price));

  return (
    <section id="courses" className="scroll-mt-24 bg-[#06180b] px-5 pb-24 pt-24 text-[#f2efe6] md:px-10 md:pb-36 md:pt-[120px]" aria-labelledby="c-subjects">
      <div className="mx-auto max-w-site">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="c-subjects" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            Browse by categories
          </h2>
          <p className="m-0 max-w-[420px] type-lead text-[#f2efe6]/74">
            {courses.length} CPD courses across {subjects.length} subjects, each built for real workplaces. Every course is {formatPrice(price)} with the certificate included.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-12 md:mt-16 lg:flex-row lg:items-start">
          <div className="w-full lg:w-[560px] lg:shrink-0">
            <div role="tablist" aria-label="Subjects" aria-orientation="vertical">
              {subjects.map((s, i) => {
                const on = i === open;
                return (
                  <button
                    key={s.name}
                    type="button"
                    role="tab"
                    id={`c-subject-${i}`}
                    aria-selected={on}
                    aria-controls="c-subject-panel"
                    onClick={() => setOpen(i)}
                    className="group relative flex w-full items-start gap-6 border-t border-[#f2efe6]/12 py-7 text-left last:border-b"
                  >
                    {on && <motion.span layoutId="c-subject-rule" className="absolute inset-x-0 -top-0.5 h-0.5 bg-[#f2efe6]" transition={{ duration: 0.5, ease: EASE }} />}
                    <span className="flex min-w-0 flex-1 flex-col gap-2.5">
                      <span className="flex flex-col gap-1.5">
                        <span
                          className={`font-title tracking-[-0.03em] transition-[font-size,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            on ? "text-[clamp(32px,3vw,44px)] leading-[48px] text-[#f2efe6]" : "text-[clamp(28px,2.5vw,36px)] leading-10 text-[#f2efe6]/64 group-hover:text-[#f2efe6]"
                          }`}
                        >
                          {s.name}
                        </span>
                        <span className={`font-mono type-caption ${on ? "text-[#1ee9b5]" : "text-[#f2efe6]/76"}`}>
                          {s.courses.length} COURSE{s.courses.length === 1 ? "" : "S"}
                        </span>
                      </span>
                      {on && <span className="max-w-[440px] type-body text-[#f2efe6]/72">{sample(s.courses)}</span>}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors ${
                        on ? "bg-[#1ee9b5] text-[#06180b]" : "border border-[#f2efe6]/22 text-[#f2efe6] group-hover:border-[#f2efe6]/50"
                      }`}
                    >
                      <Arrow />
                    </span>
                  </button>
                );
              })}
            </div>
            <Link href="/courses" className="group mt-8 inline-flex items-center gap-2.5 type-body font-medium text-[#f2efe6] underline underline-offset-4">
              Browse all {courses.length} courses
              <span className="transition-transform group-hover:translate-x-0.5">
                <Arrow />
              </span>
            </Link>
          </div>

          <div
            id="c-subject-panel"
            role="tabpanel"
            aria-labelledby={`c-subject-${open}`}
            className="min-w-0 flex-1 overflow-hidden rounded-[28px] border border-[#f2efe6]/10 bg-[#f2efe6]/5 p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="relative h-[220px] overflow-hidden rounded-[20px] bg-black md:h-[320px]">
                  <Image src={current.image} alt="" fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#f2efe6]/94 px-3.5 py-2 type-caption font-medium text-[#06180b]">
                    {current.name} · {current.courses.length} courses
                  </span>
                </div>
                <div className="px-4 pb-4 pt-6 md:px-10 md:pb-6 md:pt-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.02em]">Courses in this subject</h3>
                    <p className="m-0 font-mono type-caption text-[#1ee9b5]">{formatPrice(price)} EACH · CERTIFICATE INCLUDED</p>
                  </div>
                  <ul className="m-0 grid list-none gap-x-6 p-0 pt-4 sm:grid-cols-2">
                    {current.courses.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/courses/${c.slug}`} className="flex items-center justify-between gap-4 border-b border-[#f2efe6]/10 py-3.5 transition-colors hover:border-[#1ee9b5]/50">
                          <span className="min-w-0 truncate type-small font-medium">{c.title}</span>
                          <span className="shrink-0 font-mono type-caption text-[#f2efe6]/64">{hours(c.duration)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
                    <Link
                      href={current.slug ? `/courses?category=${current.slug}` : "/courses"}
                      className="group flex items-center gap-3 rounded-full bg-[#1ee9b5] py-2 pl-6 pr-2 type-button font-medium text-[#06180b] transition-transform active:scale-[0.98]"
                    >
                      View all {current.courses.length} {current.name} courses
                      <span className="grid size-10 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform group-hover:translate-x-0.5">
                        <Arrow />
                      </span>
                    </Link>
                    <p className="m-0 type-small text-[#f2efe6]/69">Instant access · self-paced online</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
