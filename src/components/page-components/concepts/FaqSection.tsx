"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FaqAnswerText, faqHint, FaqHelpful, FaqNoResults, FaqSearch, matchesFaq } from "@/components/shared/faq-search";
import { Arrow, EASE } from "./shared";

const pad = (n: number) => String(n).padStart(2, "0");

// The homepage's questions, as signed off. They live here rather than in the
// CMS's FAQ section, which no longer feeds this page.
const FAQS: Faq[] = [
  {
    q: "How does team enrolment work?",
    a: "Select the courses you need, choose how many learners you're enrolling, and complete checkout in one go. Each learner gets instant access to their course and receives a CPD certificate upon completion. No waiting, no manual setup.",
  },
  {
    q: "Is this a subscription, or do I pay per course?",
    a: "One-off payment per course, per learner. No monthly fees, no annual contracts. You pay per course and your team gets their certificate upon completion.",
  },
  {
    q: "What's included in the price?",
    a: "Course access, assessment, and your CPD certificate of completion are all included in the course price. VAT is added at checkout. No other hidden fees.",
  },
  {
    q: "What courses are available?",
    a: "educateU Business offers CPD-accredited courses across compliance, health and safety, IT and cyber security, and leadership. We're expanding the catalogue, more courses are on the way.",
  },
  {
    q: "How long does a CPD certificate last?",
    a: "CPD certificates are valid for one year. We update our courses in line with current legislation, so when it's time to renew, your team is always trained to the latest standard.",
  },
  {
    q: "Do you offer enterprise pricing for larger teams?",
    a: "Yes. For larger organisations or bulk enrolments, we offer an enterprise plan. Get in touch and we'll put together a quote based on your team size and course requirements.",
  },
  {
    q: "How do learners access their courses?",
    a: "Learners get instant access the moment enrolment is complete. No fixed start dates. They can study at their own pace, from any device, on their own schedule.",
  },
  {
    q: "What support is available?",
    a: "Our team is based in the UK and available during UK business hours. You can reach us at support@educateu.com and we aim to respond promptly.",
  },
];

/**
 * Frequently asked questions: the questions as a numbered list on the left,
 * the chosen one answered in a card on the right. The mint rule sits above
 * the chosen question; the card's arrows step through them in order.
 */
export type Faq = { q: string; a: string };

const INTRO =
  "Quick answers about educateU Business, our CPD courses, and how enrolment works for individuals, teams, and enterprises.";

export default function FaqSection({
  faqs = FAQS,
  intro = INTRO,
  contactHref = "/contact-us",
}: {
  faqs?: Faq[];
  intro?: string;
  contactHref?: string;
}) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [query, setQuery] = useState("");
  if (!faqs.length) return null;
  // Each shown question keeps its original number, so a search doesn't renumber them.
  const shown = faqs.map((f, n) => ({ ...f, n })).filter((f) => matchesFaq(query, f.q, f.a));
  const current = shown[active];

  const search = (q: string) => {
    setQuery(q);
    setDir(1);
    setActive(0);
  };

  const go = (i: number) => {
    const next = (i + shown.length) % shown.length;
    setDir(next >= active ? 1 : -1);
    setActive(next);
  };

  return (
    <section aria-labelledby="faq-title" className="ragged relative overflow-hidden bg-[#f7f6f1] px-5 pb-20 pt-14 text-[#06180b] md:px-10 md:py-28 lg:pb-[145px] lg:pt-[124px]">
      {/* Mint light behind the answer card, and a fainter wash along the bottom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_circle_at_88%_65%,rgb(30_233_181/0.3),transparent_72%),radial-gradient(900px_420px_at_45%_100%,rgb(30_233_181/0.1),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-site">
        <motion.div
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-11"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <h2 id="faq-title" className="m-0 shrink-0 font-title type-h2 font-normal tracking-[-0.04em]">
            Frequently
            <br />
            asked questions
          </h2>
          <p className="m-0 max-w-[540px] pb-1 type-lead text-[#06180b]/65">
            {intro}
          </p>
        </motion.div>

        <FaqSearch value={query} onChange={search} hint={faqHint(faqs.map((f) => ({ question: f.q, answer: f.a })))} className="mt-10 max-w-[561px] md:mt-14" />

        {!current ? (
          <div className="mt-8">
            <FaqNoResults query={query} contactHref={contactHref} />
          </div>
        ) : (
        <div className="mt-8 grid items-start gap-10 md:mt-10 lg:grid-cols-[minmax(0,561fr)_minmax(0,686fr)] lg:gap-16">
          <div>
          <ol className="m-0 list-none p-0">
            {shown.map((f, i) => {
              const on = i === active;
              return (
                <li key={f.q} className="relative border-b border-[#06180b]/10 first:border-t-2 first:border-t-[#06180b]/10">
                  {/* The mint rule moves to whichever question is open. */}
                  {on && (
                    <motion.span
                      layoutId="faq-rule"
                      aria-hidden="true"
                      className={`absolute inset-x-0 h-0.5 bg-[#1ee9b5] ${i === 0 ? "-top-0.5" : "-top-px"}`}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls="faq-answer"
                    onClick={() => go(i)}
                    className="group grid w-full grid-cols-[62px_minmax(0,1fr)_14px] items-start py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                  >
                    <span className={`pt-[5px] type-caption tabular-nums transition-colors ${on ? "text-[#0c7a5e]" : "text-[#06180b]/45"}`}>{pad(f.n + 1)}</span>
                    <span
                      className={`pr-6 type-h4 transition-colors ${
                        on ? "font-medium text-[#06180b]" : "text-[#06180b]/55 group-hover:text-[#06180b]/85"
                      }`}
                    >
                      {f.q}
                    </span>
                    <span
                      className={`pt-[6px] transition-[color,transform] duration-300 ${on ? "text-[#0c7a5e]" : "text-[#06180b]/40 group-hover:translate-x-1 group-hover:text-[#0c7a5e]"}`}
                    >
                      <Arrow size={13} />
                    </span>
                  </button>
                  {/* Phones and tablets: the answer opens under its question (the card is for wide screens). */}
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="pb-6 pl-[62px] pr-6">
                        <p className="m-0 type-body text-[#06180b]/70">
                          <FaqAnswerText text={f.a} />
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {/* Once for the whole list, not under every answer. */}
          <FaqHelpful contactHref={contactHref} className="mt-6" />
          </div>

          <motion.div
            className="relative hidden min-h-[531px] flex-col overflow-hidden rounded-[26px] lg:flex bg-[linear-gradient(140deg,#fdfdfc_0%,#f6faf7_45%,#e3f7ef_100%)] px-7 pb-12 pt-10 shadow-[0_40px_80px_-40px_rgb(6_24_11/0.35),0_2px_8px_rgb(6_24_11/0.04)] md:px-12 md:pt-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: EASE }}
          >
            <div id="faq-answer" role="region" aria-live="polite" aria-label={current.q}>
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={current.n}
                  custom={dir}
                  variants={{
                    in: (d: number) => ({ opacity: 0, x: d * 24 }),
                    show: { opacity: 1, x: 0 },
                    out: (d: number) => ({ opacity: 0, x: d * -24 }),
                  }}
                  initial="in"
                  animate="show"
                  exit="out"
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p aria-hidden="true" className="m-0 font-title type-stat tracking-[-0.04em] text-[#1ee9b5]">
                    {pad(current.n + 1)}
                  </p>
                  <h3 className="m-0 mt-8 max-w-[600px] type-h3 font-medium md:mt-8">
                    {current.q}
                  </h3>
                  <p className="m-0 mt-[22px] max-w-[610px] type-body text-[#06180b]/70">
                    <FaqAnswerText text={current.a} />
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-auto flex gap-2.5 pt-10">
              {[
                { label: "Previous question", to: active - 1, flip: true },
                { label: "Next question", to: active + 1, flip: false },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  aria-label={b.label}
                  onClick={() => go(b.to)}
                  className="grid size-[46px] place-items-center rounded-full bg-white text-[#06180b] shadow-[0_10px_24px_-8px_rgb(6_24_11/0.25)] transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#06180b] hover:text-[#1ee9b5] active:scale-95"
                >
                  <span className={`block ${b.flip ? "rotate-180" : ""}`}>
                    <Arrow size={14} />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </section>
  );
}
