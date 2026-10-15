"use client";

import { LayoutGroup, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Arrow } from "@/components/page-components/concepts/shared";
import { SEARCH_EVENT, STEP_EVENT, SUPPORT_ANSWERS_ID, type StepKey } from "./SupportHero";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fired with the topic's key when one is picked, for the answers further down to open. */
export const TOPIC_EVENT = "support-topic";

const icon = (d: ReactNode) => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

export const TOPICS = [
  {
    key: "certificates",
    title: "Certificates",
    body: "Issued automatically the moment you finish. Download from your dashboard.",
    icon: icon(<><circle cx="10" cy="7.5" r="4.5" /><path d="m7 11.5-1 6 4-2 4 2-1-6" /></>),
    hover: "group-hover:-translate-y-0.5",
    words: /certif|cpd|download|proof/i,
  },
  {
    key: "refunds",
    title: "Refunds",
    body: "Contact us within 14 days of purchase. Every request is reviewed fairly.",
    icon: icon(<><path d="M3.5 10a6.5 6.5 0 1 0 2-4.7" /><path d="M3.5 3v3.5H7" /></>),
    hover: "group-hover:-rotate-180",
    words: /refund|money|cancel|charge|pay/i,
  },
  {
    key: "team",
    title: "Team & company purchases",
    body: "Switch to “Company” at checkout. One transaction, one invoice.",
    icon: icon(<><circle cx="8" cy="7" r="3" /><path d="M2.5 16.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M13 4.5a3 3 0 0 1 0 5M15.5 12.5c1.2.7 2 2 2.3 4" /></>),
    hover: "group-hover:scale-110",
    words: /team|company|invoice|group|staff|bulk/i,
  },
  {
    key: "access",
    title: "Course access",
    body: "Instant access, self-paced, resume exactly where you left off.",
    icon: icon(<path d="M11 2.5 4.5 11h5L9 17.5 15.5 9h-5z" />),
    hover: "group-hover:scale-125",
    words: /access|log ?in|start|resume|enrol|self-paced/i,
  },
  {
    key: "technical",
    title: "Technical issues",
    body: "Our UK team replies within 1 business day to get you back on track.",
    icon: icon(<><rect x="2.5" y="3.5" width="15" height="10" rx="1.5" /><path d="M7 17h6M10 13.5V17" /></>),
    hover: "group-hover:-translate-y-0.5",
    words: /technical|error|bug|video|device|browser|load|work/i,
  },
  {
    key: "contact",
    title: "Contact the team",
    body: "support@educateu.com · +44 204 613 9443",
    icon: icon(<><rect x="2.5" y="4.5" width="15" height="11" rx="1.5" /><path d="m3 5.5 7 5 7-5" /></>),
    hover: "group-hover:-translate-y-0.5",
    words: /contact|email|phone|call|talk/i,
  },
] as const;
export type TopicKey = (typeof TOPICS)[number]["key"];

// The header's steps, and the topic each one is about.
const FOR_STEP: Record<StepKey, TopicKey> = {
  choose: "team",
  pay: "refunds",
  access: "access",
  learn: "technical",
  certificate: "certificates",
  resume: "access",
};

const topicFor = (q: string) => TOPICS.find((t) => t.words.test(q))?.key;

/**
 * What do you need help with? Six topics as cards, the current one in ink.
 * The header's step and search pick the topic; picking a card here moves on
 * to its answers.
 *
 * Motion: the title rises word by word and the cards follow in turn; the ink
 * fill glides to the topic picked; on hover a card lifts, its icon moves and
 * its arrow turns.
 */
export default function HelpTopics({ contact }: { contact?: string }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const [active, setActive] = useState<TopicKey>("certificates");

  // Follow the header: a step, a search, or a shared link (?step=… / ?q=… / ?topic=…).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromLink = (TOPICS.find((t) => t.key === sp.get("topic"))?.key ?? FOR_STEP[sp.get("step") as StepKey]) || topicFor(sp.get("q") ?? "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the address bar
    if (fromLink) setActive(fromLink);
    const onStep = (e: Event) => {
      const t = FOR_STEP[(e as CustomEvent<StepKey>).detail];
      if (t) setActive(t);
    };
    const onSearch = (e: Event) => {
      const t = topicFor((e as CustomEvent<string>).detail ?? "");
      if (t) setActive(t);
    };
    window.addEventListener(STEP_EVENT, onStep);
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => {
      window.removeEventListener(STEP_EVENT, onStep);
      window.removeEventListener(SEARCH_EVENT, onSearch);
    };
  }, []);

  const pick = (key: TopicKey) => (e: React.MouseEvent) => {
    setActive(key);
    if (key === "contact") return; // a real link to the Contact page
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(TOPIC_EVENT, { detail: key }));
    const sp = new URLSearchParams(window.location.search);
    sp.set("topic", key);
    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    // Its answers are in the FAQ further down.
    scrollTo("#support-faq", { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84), immediate: !!reduce });
  };

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const up: Variants = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.05, ease: EASE } }) };
  const fade: Variants = { hide: { opacity: 0, y: 30 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.85, delay: d, ease: EASE } }) };
  const title = "What do you need help with?";

  return (
    <section id={SUPPORT_ANSWERS_ID} aria-labelledby="topics-title" className="ragged scroll-mt-[var(--home-nav-h)] bg-[#f7f6f1] px-5 pb-24 pt-20 text-[#06180b] md:px-10 lg:pb-[120px] lg:pt-[112px]">
      <motion.div {...group} className="mx-auto max-w-site">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <h2 id="topics-title" className="m-0 font-title type-h2 font-normal tracking-[-0.05em]">
            {title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-top">
                <motion.span className="inline-block" variants={up} custom={i}>
                  {w}
                  {" "}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.2} className="m-0 max-w-[320px] type-lead text-[#06180b]/70 lg:mt-[4px]">
            Pick a topic to jump straight to its answers.
          </motion.p>
        </div>

        <LayoutGroup id="topics">
          <ul className="m-0 mt-10 grid list-none items-start gap-6 p-0 md:grid-cols-2 lg:mt-[42px] lg:grid-cols-3">
            {TOPICS.map((t, i) => {
              const on = t.key === active;
              const body = t.key === "contact" && contact ? contact : t.body;
              return (
                <motion.li key={t.key} variants={fade} custom={0.2 + i * 0.07}>
                  <Link
                    href={t.key === "contact" ? "/contact-us" : `?topic=${t.key}`}
                    onClick={pick(t.key)}
                    aria-current={on}
                    className={`group relative block overflow-hidden rounded-[18px] p-7 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1ee9b5] ${
                      on ? "text-[#f2efe6] shadow-[0_30px_60px_-30px_rgb(6_24_11/0.55)]" : "bg-[#f0ede5] hover:shadow-[0_24px_50px_-30px_rgb(6_24_11/0.3)]"
                    }`}
                  >
                    {on && <motion.span layoutId="topic-fill" aria-hidden="true" className="absolute inset-0 bg-[#06180b]" transition={{ type: "spring", stiffness: 300, damping: 32 }} />}
                    <span className="relative flex items-start justify-between">
                      <span className={`grid size-[52px] place-items-center rounded-[11px] transition-colors duration-500 ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#0c3a28] text-[#1ee9b5]"}`}>
                        <span className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${t.hover}`}>{t.icon}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 grid size-10 place-items-center rounded-full transition-[background-color,transform] duration-500 group-hover:-rotate-45 ${on ? "bg-white/10 text-white" : "bg-white text-[#06180b]"}`}
                      >
                        <Arrow size={11} />
                      </span>
                    </span>
                    <span className="relative mt-[22px] block font-title type-h4 tracking-[-0.035em]">{t.title}</span>
                    <span className={`relative mt-3.5 block type-body transition-colors duration-500 ${on ? "text-white/75" : "text-[#06180b]/75"}`}>{body}</span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </LayoutGroup>
      </motion.div>
    </section>
  );
}
