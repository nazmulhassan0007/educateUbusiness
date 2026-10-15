"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/page-components/concepts/shared";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import type { RefundSection } from "./RefundPolicyContent";

const EASE = [0.22, 1, 0.36, 1] as const;
const MONO = "font-[family-name:var(--font-geist-mono)]";

// The CMS's rich text: paragraphs, and lists whose items wrap a paragraph each.
// Lists lose their bullets for a short mint rule.
const PROSE =
  "type-body text-[#06180b]/75 [&_p]:m-0 [&_p+p]:mt-4 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0 [&_ol]:m-0 [&_ol]:pl-5 [&_li]:relative [&_li]:pl-8 [&_li+li]:mt-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.8em] [&_li]:before:h-px [&_li]:before:w-4 [&_li]:before:bg-[#0c7a5e] [&_a]:underline [&_a]:decoration-[#1ee9b5] [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-[#06180b]";

/**
 * The policy itself, read like a document: on wide screens a contents rail
 * on the left whose line fills as the reader goes and whose entry for the
 * section in view lights up; on the right the sections, each under a large
 * number. A thin bar along the top of the screen tracks progress on every size.
 */
export default function RefundDocument({ sections }: { sections: RefundSection[] }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const body = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: body, offset: ["start 60%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  // The section crossing the upper middle of the screen is the current one.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = (id: string) =>
    scrollTo(`#${id}`, {
      offset: -((parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84) + 24),
      immediate: !!reduce,
    });

  return (
    <section aria-label="Policy" className="ragged relative bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      {/* Reading progress, along the top edge of the screen. */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: fill }}
        className="fixed inset-x-0 top-0 z-[150] h-[3px] origin-left bg-[#1ee9b5]"
      />

      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-[calc(var(--home-nav-h)+40px)]">
            <p className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]">Contents</p>
            <div className="relative mt-6">
              {/* The rail and its fill. */}
              <span aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-[#06180b]/12" />
              <motion.span
                aria-hidden="true"
                style={{ scaleY: fill }}
                className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-[#0c7a5e]"
              />
              <ol className="m-0 flex list-none flex-col gap-1 p-0">
                {sections.map((s, i) => {
                  const on = i === active;
                  const done = i < active;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => go(s.id)}
                        aria-current={on ? "true" : undefined}
                        className="group flex w-full items-center gap-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                      >
                        <span
                          aria-hidden="true"
                          className={`relative size-[11px] shrink-0 rounded-full border transition-[background-color,border-color,transform] duration-300 ${
                            on ? "scale-125 border-[#0c7a5e] bg-[#1ee9b5]" : done ? "border-[#0c7a5e] bg-[#0c7a5e]" : "border-[#06180b]/25 bg-[#f2efe6]"
                          }`}
                        />
                        <span className={`type-caption tabular-nums ${MONO} ${on ? "text-[#0c7a5e]" : "text-[#06180b]/40"}`}>{s.num}</span>
                        <span
                          className={`min-w-0 flex-1 truncate type-small transition-colors ${
                            on ? "font-medium text-[#06180b]" : "text-[#06180b]/55 group-hover:text-[#06180b]/85"
                          }`}
                        >
                          {s.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </nav>

        <div ref={body} className="min-w-0">
          {sections.map((s) => (
            <motion.article
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              initial={reduce ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE }}
              className="grid gap-4 border-t border-[#06180b]/12 py-10 first:border-t-0 first:pt-0 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8 lg:py-14"
            >
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
                className="font-title text-[56px] leading-[0.85] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_#0c7a5e] md:text-[80px]"
              >
                {s.num}
              </motion.span>
              <div className="min-w-0 max-w-[720px]">
                <h2 id={`${s.id}-title`} className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">
                  {s.title}
                </h2>
                {s.html && <div className={`mt-5 ${PROSE}`} dangerouslySetInnerHTML={{ __html: s.html }} />}
              </div>
            </motion.article>
          ))}

          {/* What to do next. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative mt-6 overflow-hidden rounded-[28px] bg-[#06180b] p-8 text-[#f2efe6] md:mt-10 md:p-12"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_100%,rgb(30_233_181/0.18),transparent_70%)]"
            />
            <div className="relative flex flex-col gap-7">
              <div className="min-w-0">
                <h2 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">Need to request a refund?</h2>
                <p className="m-0 mt-3 max-w-[460px] type-body text-white/75">
                  Send us your full name, the course title and a short reason, and our UK team will take it from there.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact-us"
                  className="group flex items-center gap-3 rounded-full bg-[#1ee9b5] py-2 pl-6 pr-2 type-button font-medium text-[#06180b] transition-[background-color,transform] duration-300 hover:bg-[#5ef0c9] active:scale-[0.98]"
                >
                  Contact us
                  <span className="grid size-9 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform duration-300 group-hover:translate-x-0.5">
                    <Arrow size={12} />
                  </span>
                </Link>
                <a
                  href="mailto:support@educateu.com"
                  className="flex h-[52px] items-center rounded-full border border-white/20 px-6 type-button font-medium text-white/90 transition-colors hover:border-white/40 hover:text-white"
                >
                  support@educateu.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
