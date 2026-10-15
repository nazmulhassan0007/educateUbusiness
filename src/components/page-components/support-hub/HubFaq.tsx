"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { useState } from "react";
import { faqHint, FaqHelpful, FaqNoResults, FaqSearch, matchesFaq } from "@/components/shared/faq-search";

const EASE = [0.22, 1, 0.36, 1] as const;

export type HubFaqItem = {
  question: string;
  answer: string;
};

export type HubFaqContent = {
  title: string;
  description: string;
  faqs: HubFaqItem[];
};

const DEFAULT_CONTENT: HubFaqContent = {
  title: "Frequently Asked Questions",
  description: "Quick answers about enrolling, accessing your course and getting your certificate.",
  faqs: [],
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Support Hub's questions as an accordion, the first one open.
 *
 * Motion: the title rises word by word and the questions follow it in, one
 * after another. Opening a question grows its panel to fit, the answer
 * sharpens in out of a blur, the plus turns into a minus, and the mint bar
 * slides along to whichever question is open.
 */
export default function HubFaq({ data }: { data?: Partial<HubFaqContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const faqs = (content.faqs ?? []).filter((f) => f.question?.trim());
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState("");
  if (!faqs.length) return null;
  // Each shown question keeps its original number, so a search doesn't renumber them.
  const shown = faqs.map((f, n) => ({ ...f, n })).filter((f) => matchesFaq(query, f.question, f.answer));

  const search = (q: string) => {
    setQuery(q);
    setOpen(0);
  };

  const head: Variants = {
    hide: { y: "105%" },
    show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.06, ease: EASE } }),
  };
  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: EASE } }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="faq" aria-labelledby="hub-faq-title" className="ragged relative overflow-hidden bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 lg:py-[130px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_20%,rgb(30_233_181/0.14),transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-site gap-12 lg:grid-cols-[minmax(0,420fr)_minmax(0,820fr)] lg:gap-20">
          <motion.div initial="hide" whileInView="show" viewport={{ once: true, margin: "-15%" }} className="lg:sticky lg:top-[calc(var(--home-nav-h)+40px)] lg:self-start">
            <h2 id="hub-faq-title" className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
              {content.title.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
                  <motion.span className="inline-block" variants={head} custom={i}>
                    {w}
                    {" "}
                  </motion.span>
                </span>
              ))}
            </h2>
            {content.description && (
              <motion.p variants={fade} custom={0.3} className="m-0 mt-5 max-w-[420px] type-lead text-[#06180b]/65">
                {content.description}
              </motion.p>
            )}
          </motion.div>

          <div>
          <FaqSearch value={query} onChange={search} hint={faqHint(faqs)} className="mb-8" />
          {!shown.length && <FaqNoResults query={query} />}
          <motion.ol initial="hide" whileInView="show" viewport={{ once: true, margin: "-10%" }} className="m-0 list-none p-0">
            {shown.map((f, i) => {
              const on = i === open;
              return (
                <motion.li key={`${f.question}-${f.n}`} variants={fade} custom={Math.min(i * 0.07, 0.5)} className="relative border-b border-[#06180b]/10 first:border-t">
                  {on && (
                    <motion.span
                      layoutId="hub-faq-bar"
                      aria-hidden="true"
                      className="absolute -left-4 bottom-6 top-6 w-[3px] rounded-full bg-[#1ee9b5] lg:-left-6"
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`hub-faq-${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                    className="group grid w-full grid-cols-[44px_minmax(0,1fr)_32px] items-start gap-2 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c7a5e] lg:py-7"
                  >
                    <span className={`pt-1 type-caption tabular-nums transition-colors duration-300 ${on ? "text-[#0c7a5e]" : "text-[#06180b]/40"}`}>{pad(f.n + 1)}</span>
                    <span
                      className={`type-h4 font-medium transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        on ? "text-[#06180b]" : "text-[#06180b]/60 group-hover:translate-x-1.5 group-hover:text-[#06180b]"
                      }`}
                    >
                      {f.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative grid size-8 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-[#06180b] text-[#1ee9b5]" : "bg-[#06180b]/[0.06] text-[#06180b] group-hover:bg-[#1ee9b5]"}`}
                    >
                      <span className="absolute h-[1.5px] w-3 rounded-full bg-current" />
                      <motion.span className="absolute h-3 w-[1.5px] rounded-full bg-current" animate={{ rotate: on ? 90 : 0, opacity: on ? 0 : 1 }} transition={{ duration: 0.4, ease: EASE }} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={`hub-faq-${i}`}
                        role="region"
                        key="answer"
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        className="overflow-hidden"
                      >
                        {/* Some CMS answers are rich text (wrapped in <p>), some plain; innerHTML renders both. */}
                        <motion.div
                          initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(6px)" }}
                          transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
                          className="pb-7 pl-[52px] pr-10"
                        >
                          <div
                            className="type-body text-[#06180b]/70 [&_a]:text-[#0c7a5e] [&_a]:underline [&_p]:m-0 [&_p+p]:mt-3"
                            dangerouslySetInnerHTML={{ __html: f.answer }}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ol>
          {/* Once for the whole list, not under every answer. */}
          {shown.length > 0 && <FaqHelpful className="mt-6" />}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
