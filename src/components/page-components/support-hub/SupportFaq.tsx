"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { STEP_EVENT, SEARCH_EVENT, type StepKey } from "./SupportHero";
import { TOPIC_EVENT, type TopicKey } from "./HelpTopics";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The FAQ's section; the help topics above scroll here. */
export const SUPPORT_FAQ_ID = "support-faq";

export type SupportFaqContent = { faqs?: { question?: string; answer?: string }[] };

const CATEGORIES: { key: TopicKey; label: string; test: RegExp }[] = [
  { key: "certificates", label: "Certificates", test: /certificate/i },
  { key: "refunds", label: "Refunds", test: /refund/i },
  { key: "team", label: "Team purchases", test: /team|company/i },
  { key: "technical", label: "Technical issues", test: /technical/i },
  { key: "contact", label: "Contact", test: /contact/i },
  { key: "access", label: "Course access", test: /access|resume|sitting/i },
];
// The order the list shows them in.
const ORDER: TopicKey[] = ["certificates", "refunds", "team", "access", "technical", "contact"];
const FOR_STEP: Record<StepKey, TopicKey> = { choose: "team", pay: "refunds", access: "access", learn: "technical", certificate: "certificates", resume: "access" };

const plain = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/**
 * Frequently asked questions: the categories down the left with their counts,
 * a search and the questions on the right, one open at a time.
 *
 * Motion: the title rises; the ink fill glides between categories; questions
 * re-flow as the filter changes; an answer unfolds under its question while
 * the plus turns to a minus. The page's topics, steps and search pick the
 * category here too.
 */
export default function SupportFaq({ data }: { data?: SupportFaqContent }) {
  const reduce = useReducedMotion();
  const faqs = useMemo(
    () =>
      (data?.faqs ?? [])
        .map((f) => ({ q: plain(f.question ?? ""), a: plain(f.answer ?? "") }))
        .filter((f) => f.q && f.a)
        .map((f) => ({ ...f, cat: CATEGORIES.find((c) => c.test.test(f.q))?.key ?? "contact" })),
    [data],
  );
  const [cat, setCat] = useState<TopicKey | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);

  // Follow the rest of the page: a topic card, a step, or the header's search.
  useEffect(() => {
    const pickFirst = (k: TopicKey) => {
      setCat(k);
      setQuery("");
      setOpen(faqs.find((f) => f.cat === k)?.q ?? null);
    };
    const onTopic = (e: Event) => pickFirst((e as CustomEvent<TopicKey>).detail);
    const onStep = (e: Event) => {
      const k = FOR_STEP[(e as CustomEvent<StepKey>).detail];
      if (k) pickFirst(k);
    };
    const onSearch = (e: Event) => {
      setCat("all");
      setQuery((e as CustomEvent<string>).detail ?? "");
    };
    window.addEventListener(TOPIC_EVENT, onTopic);
    window.addEventListener(STEP_EVENT, onStep);
    window.addEventListener(SEARCH_EVENT, onSearch);
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the address bar
    if (q) setQuery(q);
    return () => {
      window.removeEventListener(TOPIC_EVENT, onTopic);
      window.removeEventListener(STEP_EVENT, onStep);
      window.removeEventListener(SEARCH_EVENT, onSearch);
    };
  }, [faqs]);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = faqs.filter((f) => (cat === "all" || f.cat === cat) && words.every((w) => `${f.q} ${f.a}`.toLowerCase().includes(w)));
  const tabs = [
    { key: "all" as const, label: "All questions", count: faqs.length },
    ...ORDER.map((k) => ({ key: k, label: CATEGORIES.find((c) => c.key === k)!.label, count: faqs.filter((f) => f.cat === k).length })).filter((t) => t.count),
  ];

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const fade: Variants = { hide: { opacity: 0, y: 24 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.85, delay: d, ease: EASE } }) };
  const up: Variants = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.07, ease: EASE } }) };

  if (!faqs.length) return null;

  return (
    <section id={SUPPORT_FAQ_ID} aria-labelledby="faq-title" className="ragged scroll-mt-[var(--home-nav-h)] bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 lg:pb-[130px] lg:pt-[130px]">
      <motion.div {...group} className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[354px_minmax(0,1fr)] lg:gap-[67px]">
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--home-nav-h)+32px)] lg:self-start">
          <h2 id="faq-title" className="m-0 font-title type-h2 font-normal tracking-[-0.05em]">
            {["Frequently", "asked", "questions"].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.08em]">
                <motion.span className="block" variants={up} custom={i}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.2} className="m-0 mt-6 max-w-[330px] type-lead text-[#06180b]/70">
            Quick answers about certificates, refunds, access and buying for a team.
          </motion.p>
          <LayoutGroup id="faq-cats">
            <motion.ul variants={fade} custom={0.3} className="m-0 mt-10 flex list-none gap-1.5 overflow-x-auto p-0 [scrollbar-width:none] lg:mt-[42px] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden" aria-label="Categories">
              {tabs.map((t) => {
                const on = t.key === cat;
                return (
                  <li key={t.key} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setCat(t.key);
                        setOpen(faqs.find((f) => t.key === "all" || f.cat === t.key)?.q ?? null);
                      }}
                      className={`relative flex h-[50px] w-full items-center justify-between gap-6 rounded-[10px] px-4 text-left type-body font-medium transition-colors duration-300 ${on ? "text-white" : "text-[#06180b]/85 hover:bg-[#f0ede5]"}`}
                    >
                      {on && <motion.span layoutId="faq-cat" aria-hidden="true" className="absolute inset-0 rounded-[10px] bg-[#06180b]" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                      <span className="relative whitespace-nowrap">{t.label}</span>
                      <span className={`relative grid h-5 min-w-[25px] place-items-center rounded-[5px] px-1.5 font-[family-name:var(--font-geist-mono)] type-caption ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b]/[0.07] text-[#06180b]/70"}`}>
                        {t.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </LayoutGroup>
        </div>

        <div className="min-w-0">
          <motion.label variants={fade} custom={0.15} className="flex h-[58px] items-center gap-3.5 rounded-[12px] bg-[#f0ede5] px-6 transition-shadow focus-within:shadow-[0_0_0_3px_rgb(30_233_181/0.35)]">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search the questions</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search certificates, refunds, team purchases…"
              className="h-full min-w-0 flex-1 bg-transparent text-[16.5px] outline-none placeholder:text-[#06180b]/50 [&::-webkit-search-cancel-button]:hidden"
            />
          </motion.label>

          <motion.ul variants={fade} custom={0.25} className="m-0 mt-[17px] list-none p-0">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((f) => {
                const on = open === f.q;
                const id = `faq-${faqs.indexOf(f)}`;
                return (
                  <motion.li
                    key={f.q}
                    layout={!reduce}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.4, ease: EASE, layout: { duration: 0.45, ease: EASE } }}
                    className={`rounded-[16px] transition-[background-color,padding] duration-500 ${on ? "bg-[#f0ede5] px-6" : "rounded-none border-b border-[#06180b]/10 last:border-b-0"}`}
                  >
                    <h3 className="m-0">
                      <button
                        type="button"
                        aria-expanded={on}
                        aria-controls={id}
                        onClick={() => setOpen(on ? null : f.q)}
                        className={`group flex w-full items-center justify-between gap-6 text-left font-title type-h4 font-normal tracking-[-0.03em] transition-[padding] duration-500 ${on ? "pb-3.5 pt-[25px]" : "py-[27px]"}`}
                      >
                        {f.q}
                        <span
                          aria-hidden="true"
                          className={`relative grid size-[34px] shrink-0 place-items-center rounded-full border transition-colors duration-300 ${on ? "border-[#06180b] bg-[#06180b] text-[#1ee9b5]" : "border-[#06180b]/25 group-hover:border-[#06180b]"}`}
                        >
                          <span className="absolute h-[1.5px] w-2.5 rounded bg-current" />
                          <span className={`absolute h-2.5 w-[1.5px] rounded bg-current transition-transform duration-300 ${on ? "scale-y-0 rotate-90" : ""}`} />
                        </span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          id={id}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="m-0 max-w-[900px] pb-6 pr-6 type-body text-[#06180b]/80">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
          {!shown.length && (
            <p className="m-0 mt-8 type-body text-[#06180b]/70">
              No questions match that.{" "}
              <button type="button" onClick={() => { setQuery(""); setCat("all"); }} className="font-medium text-[#0c7a5e] underline underline-offset-4">
                Show all questions
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
