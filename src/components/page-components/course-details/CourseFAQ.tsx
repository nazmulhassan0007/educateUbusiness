"use client";

import { ArrowRight, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import type { ApiCourseFaq } from "@/lib/courses/loaders";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The course's questions (Figma 184:329), as a reader: the list on the left,
 * the chosen answer in the green panel beside it. Below `lg`, where there is
 * no room beside, each answer opens under its own question instead.
 */
export default function CourseFAQ({ faqs }: { faqs: ApiCourseFaq[] }) {
  const items = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
  const [active, setActive] = useState(0);
  // Phones start with every answer closed; the desktop panel always shows one.
  const [opened, setOpened] = useState(false);
  const still = !!useReducedMotion();
  const id = useId();

  if (!items.length) return null;
  const current = items[active];

  const choose = (i: number) => {
    if (i === active) setOpened((o) => !o);
    else {
      setActive(i);
      setOpened(true);
    }
  };

  return (
    <section aria-labelledby="faq-title" className="ragged bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="w-full lg:w-[600px] lg:shrink-0">
          <h2 id="faq-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            Questions
          </h2>
          <ul className="m-0 mt-8 list-none border-b border-[#06180b]/12 p-0">
            {items.map((faq, i) => {
              const on = i === active;
              const open = on && opened;
              return (
                <li key={faq.id} className="border-t border-[#06180b]/12">
                  <button
                    type="button"
                    id={`${id}-q${i}`}
                    aria-expanded={open}
                    aria-controls={`${id}-a${i}`}
                    onClick={() => choose(i)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                  >
                    <span
                      className={cn(
                        "font-title type-h4 transition-colors duration-300",
                        on ? "text-[#06180b]" : "text-[#06180b]/60 group-hover:text-[#06180b]",
                        !opened && "max-lg:text-[#06180b]",
                      )}
                    >
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                        on ? "border-[#06180b] bg-[#06180b] text-[#1ee9b5]" : "border-[#06180b]/18 bg-[#f7f6f1] text-[#06180b] group-hover:border-[#06180b]/40",
                        !opened && "max-lg:border-[#06180b]/18 max-lg:bg-[#f7f6f1] max-lg:text-[#06180b]",
                      )}
                    >
                      <ArrowRight size={14} strokeWidth={1.8} className="hidden lg:block" />
                      {open ? <Minus size={14} className="lg:hidden" /> : <Plus size={14} className="lg:hidden" />}
                    </span>
                  </button>

                  {/* Phones: the answer opens in place. */}
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`${id}-a${i}`}
                        role="region"
                        aria-labelledby={`${id}-q${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: still ? 0 : 0.4, ease: EASE }}
                        className="overflow-hidden lg:hidden"
                      >
                        <p className="m-0 pb-6 type-body text-[#06180b]/75">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop: the chosen answer in the panel. */}
        <div aria-live="polite" className="relative hidden min-w-0 flex-1 overflow-hidden rounded-[20px] bg-[#0b3a28] p-12 text-[#f2efe6] lg:block">
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-40 size-[420px] rounded-full bg-[#1ee9b5]/20 blur-[100px]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={still ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={still ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative flex flex-col gap-5"
            >
              <p className="m-0 type-caption font-medium text-[#1ee9b5]">
                Answer {active + 1} of {items.length}
              </p>
              <h3 className="m-0 max-w-[560px] font-title type-h3 font-normal tracking-[-0.025em]">{current.question}</h3>
              <p className="m-0 max-w-[560px] type-body text-[#f2efe6]/85">{current.answer}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
