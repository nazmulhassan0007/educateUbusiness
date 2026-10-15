"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import {
  MODULE_PHOTOS,
  assessmentPhrase,
  certificateName,
  hasModuleChecks,
  numberWord,
  pad2,
  passMarkOf,
} from "./course-view";

const navButton =
  "grid size-[52px] cursor-pointer place-items-center rounded-full border border-[#f2efe6]/25 bg-[#f2efe6]/[0.08] text-[#f2efe6] transition-colors hover:border-[#1ee9b5] hover:bg-[#1ee9b5] hover:text-[#06180b] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#f2efe6]/25 disabled:hover:bg-[#f2efe6]/[0.08] disabled:hover:text-[#f2efe6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5]";

/**
 * Course content (Figma 184:172): one card per module in a scroll-snap row
 * that runs off the right edge, ending on the mint card for the final
 * assessment. The arrows and the "01 / 05" count follow the row however it
 * is scrolled — arrows, trackpad, touch or keyboard.
 */
export default function CourseModules({ course }: { course: ApiCourseDetail }) {
  const modules = [...course.modules].sort((a, b) => a.displayOrder - b.displayOrder);
  const passMark = passMarkOf(course);
  const checks = hasModuleChecks(course);
  const finale = course.hasCertificate && passMark !== null;
  const total = modules.length + (finale ? 1 : 0);

  const rowRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const step = useCallback(() => {
    const row = rowRef.current;
    const first = row?.children[0] as HTMLElement | undefined;
    if (!row || !first) return 0;
    return first.offsetWidth + (parseFloat(getComputedStyle(row).columnGap) || 0);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const sync = () => {
      const s = step();
      setIndex(s ? Math.min(total - 1, Math.round(row.scrollLeft / s)) : 0);
      setAtStart(row.scrollLeft <= 2);
      setAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 2);
    };
    sync();
    row.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      row.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [step, total]);

  const go = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  if (!modules.length) return null;

  const heading = `${numberWord(modules.length)} module${modules.length === 1 ? "" : "s"}.${course.hasCertificate ? " One certificate." : ""}`;

  return (
    <section aria-labelledby="modules-title" className="overflow-hidden bg-[#06180b] py-20 text-[#f2efe6] lg:py-32 [--gutter:20px] md:[--gutter:40px]">
      <div className="px-5 md:px-10">
        <div className="mx-auto flex max-w-site flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h2 id="modules-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
              {heading}
            </h2>
            <p className="m-0 type-lead text-[#f2efe6]/72">
              {checks ? "A knowledge check after each module, retakeable before you move on." : "Work through each module at your own pace."}
            </p>
          </div>
          {total > 1 && (
            <div className="flex shrink-0 items-center gap-2.5">
              <p aria-live="polite" className="m-0 mr-1 font-[family-name:var(--font-geist-mono)] type-small text-[#f2efe6]/60 tabular-nums">
                <span className="sr-only">Card </span>
                {pad2(index + 1)} / {pad2(total)}
              </p>
              <button type="button" aria-label="Previous module" className={navButton} disabled={atStart} onClick={() => go(-1)}>
                <ChevronLeft size={18} strokeWidth={1.8} />
              </button>
              <button type="button" aria-label="Next module" className={navButton} disabled={atEnd} onClick={() => go(1)}>
                <ChevronRight size={18} strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ol
        ref={rowRef}
        tabIndex={0}
        aria-label="Course modules"
        className="m-0 mt-10 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-0 px-[max(var(--gutter),calc((100%-1312px)/2))] scroll-px-[max(var(--gutter),calc((100%-1312px)/2))] [scrollbar-width:none] focus-visible:outline-none md:gap-6 lg:mt-14 [&::-webkit-scrollbar]:hidden"
      >
        {modules.map((m, i) => (
          <li
            key={m.id}
            className="group flex w-[min(480px,84vw)] shrink-0 snap-start flex-col overflow-hidden isolate rounded-[20px] bg-[#0b3a28]"
          >
            <div className="relative h-[220px] shrink-0 overflow-hidden sm:h-[300px]">
              <Image
                src={MODULE_PHOTOS[i % MODULE_PHOTOS.length]}
                alt=""
                fill
                sizes="(min-width: 640px) 480px, 84vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_58_40/0)_50%,rgb(11_58_40/0.9)_100%)]" />
              <span aria-hidden="true" className="absolute bottom-[-8px] left-6 font-title type-stat tracking-[-0.03em] text-[#f2efe6]/95">
                {pad2(i + 1)}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 px-7 pb-7 pt-6">
              <p className="m-0 font-[family-name:var(--font-geist-mono)] type-caption text-[#1ee9b5]">Module {i + 1}</p>
              <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.025em]">{m.title}</h3>
              {m.description && <p className="m-0 line-clamp-3 type-body text-[#f2efe6]/75">{m.description}</p>}
            </div>
          </li>
        ))}

        {finale && (
          <li className="flex min-h-[420px] w-[min(400px,84vw)] shrink-0 snap-start flex-col justify-end gap-4 rounded-[20px] bg-[#1ee9b5] p-8 text-[#06180b]">
            <p className="m-0 font-[family-name:var(--font-geist-mono)] type-caption text-[#06180b]/70">Then</p>
            <p className="m-0 font-title type-stat tracking-[-0.03em] tabular-nums">{passMark}%</p>
            <p className="m-0 font-title type-h4 tracking-[-0.025em]">
              in {assessmentPhrase(course)} earns your {certificateName(course)}.
            </p>
          </li>
        )}
      </ol>
    </section>
  );
}
