"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Arrow, Plus } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

export type AboutAudienceContent = { title?: string; description?: string; audience?: { label?: string }[] };

// Photo and line for each audience, matched on the CMS label. Only the first
// line is in the design; the other three are written to match it.
const DETAIL: [RegExp, { photo: string; position: string; line: string }][] = [
  [/working/i, { photo: "/about-us/photo-why-bottom-right.jpeg", position: "62% 40%", line: "Keep your skills and compliance current without stepping away from the job." }],
  [/changer/i, { photo: "/about-us/photo-why-top.jpeg", position: "45% 50%", line: "Build the knowledge for a new field at your own pace, with a certificate to show for it." }],
  [/early/i, { photo: "/about-us/photo-who-we-are.jpeg", position: "55% 40%", line: "Start your career with the workplace essentials employers look for." }],
  [/international/i, { photo: "/about-us/photo-why-bottom-left.jpeg", position: "50% 35%", line: "Earn UK-recognised CPD certificates online, wherever you are in the world." }],
];

const DEFAULT = {
  title: "Who educateU is for",
  description: "Courses are written in plain, professional language and are suitable for learners with varied backgrounds and experience levels.",
  labels: ["Working professionals", "Career changers", "Early-career professionals", "International learners"],
};

// "Early-Career Professionals " → "Early-career professionals", as in the design.
const tidy = (label: string) => {
  const t = label.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * Who educateU is for: one wide photo panel per audience, the open one wide
 * with its line, the rest narrow with their name running up the side.
 * Hovering, focusing or tapping a panel opens it.
 */
export default function AboutAudience({ data }: { data?: AboutAudienceContent }) {
  const reduce = useReducedMotion();
  const labels = (data?.audience ?? []).map((a) => a.label?.trim()).filter((l): l is string => Boolean(l));
  const items = (labels.length ? labels : DEFAULT.labels).map((label, i) => {
    const d = DETAIL.find(([re]) => re.test(label))?.[1] ?? DETAIL[i % DETAIL.length][1];
    return { label: tidy(label), ...d };
  });
  const [open, setOpen] = useState(0);
  const view = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const fade = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };

  return (
    <section aria-labelledby="audience-title" className="ragged bg-[#f2efe6] px-5 py-24 text-[#06180b] md:px-10 lg:pb-[130px] lg:pt-[120px]">
      <div className="mx-auto max-w-site">
        <motion.div {...view} className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <motion.h2 id="audience-title" variants={fade} custom={0} className="m-0 font-title type-h2 font-normal tracking-[-0.035em] lg:mt-3">
            {data?.title?.trim() || DEFAULT.title}
          </motion.h2>
          <motion.p variants={fade} custom={0.1} className="m-0 max-w-[460px] type-lead text-[#06180b]/75">
            {data?.description?.trim() || DEFAULT.description}
          </motion.p>
        </motion.div>

        <motion.ul {...view} className="m-0 mt-12 flex list-none flex-col gap-3 p-0 lg:mt-[60px] lg:h-[580px] lg:flex-row">
          {items.map((it, i) => {
            const on = i === open;
            return (
              <motion.li
                key={it.label}
                variants={{
                  hide: { opacity: 0, y: 60 },
                  show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.15 + i * 0.1, ease: EASE } },
                }}
                onPointerEnter={(e) => e.pointerType === "mouse" && window.matchMedia("(min-width: 1024px)").matches && setOpen(i)}
                className={`relative min-h-0 overflow-hidden isolate rounded-[26px] bg-[#0c3a28] transition-[flex-grow,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-full lg:basis-0 ${
                  on ? "h-[420px] lg:grow-[4.25]" : "h-[96px] lg:grow"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={on}
                  onClick={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  className="group absolute inset-0 block w-full text-left text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[#1ee9b5]"
                >
                  <Image
                    src={it.photo}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    style={{ objectPosition: it.position }}
                    className={`object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "scale-100" : "scale-110 group-hover:scale-105"}`}
                  />
                  {/* Closed panels wear the brand green; the open one only darkens at the foot for its text. */}
                  <span aria-hidden="true" className={`absolute inset-0 bg-[#0c5d48] mix-blend-multiply transition-opacity duration-700 ${on ? "opacity-0" : "opacity-90"}`} />
                  <span aria-hidden="true" className={`absolute inset-0 bg-[#0c5d48]/45 transition-opacity duration-700 ${on ? "opacity-0" : "opacity-100"}`} />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#06180b]/85 via-[#06180b]/10 to-transparent" />

                  {/* Corner button: an arrow when open, a plus that turns when closed. */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-5 top-5 grid size-11 place-items-center rounded-full transition-[background-color,transform,color] duration-500 ${
                      on ? "rotate-0 bg-[#1ee9b5] text-[#06180b]" : "border border-white/40 bg-white/10 text-white backdrop-blur-sm group-hover:rotate-90"
                    }`}
                  >
                    {on ? <Arrow size={14} /> : <Plus size={14} />}
                  </span>

                  {/* Closed: the name runs up the side on wide screens, across on phones. */}
                  <span
                    className={`absolute font-title type-h3 tracking-[-0.03em] transition-opacity duration-300 lg:bottom-9 lg:left-1/2 lg:origin-bottom-left lg:-rotate-90 lg:translate-x-[0.5em] lg:whitespace-nowrap max-lg:bottom-0 max-lg:left-6 max-lg:right-20 max-lg:top-0 max-lg:flex max-lg:items-center ${
                      on ? "opacity-0" : "opacity-100 delay-200"
                    }`}
                  >
                    {it.label}
                  </span>

                  {/* Open: the name and its line. */}
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        className="absolute inset-x-0 bottom-0 block p-6 md:p-10"
                        initial={reduce ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: EASE } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      >
                        <span className="block font-title type-h3 tracking-[-0.035em]">{it.label}</span>
                        <span className="mt-4 block max-w-[460px] type-body text-white/85">{it.line}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>

      </div>
    </section>
  );
}
