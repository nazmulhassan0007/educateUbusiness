"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/page-components/concepts/shared";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

export type ContactTopic = {
  topic: string;
  /** What the "goes to" column says. */
  route: string;
  reply: string;
  /** "#form" scrolls to the contact form and picks this topic there; otherwise a link. */
  href: string;
  external?: boolean;
};

export const TOPICS: ContactTopic[] = [
  { topic: "Course enquiry", route: "Contact form", reply: "Within 1 business day", href: "#form" },
  { topic: "Company Training", route: "Contact form · team quote", reply: "Within 1 business day", href: "#form" },
  { topic: "Partnerships", route: "partnerships@educateU.com", reply: "Within 1 business day", href: "mailto:partnerships@educateU.com" },
  { topic: "Certificates", route: "Certificate Checker", reply: "Self-serve, any time", href: "/certificate-checker", external: true },
  { topic: "Technical issue", route: "Contact form", reply: "Within 1 business day", href: "#form" },
  { topic: "Other", route: "hello@educateU.com", reply: "Within 1 business day", href: "mailto:hello@educateU.com" },
];

// The hero heading's size: type-display's steps, each capped at 12.5% of its
// column (cqi). "Where should your" is 7.8em wide, so at most 1/8 of the
// column per em keeps that line whole at every width.
const H1_SIZE =
  "text-[min(2.75rem,12.5cqi)] sm:text-[min(3.25rem,12.5cqi)] md:text-[min(4rem,12.5cqi)] lg:text-[min(5rem,12.5cqi)] xl:text-[min(6rem,12.5cqi)] 2xl:text-[min(6.5rem,12.5cqi)] 4xl:text-[min(7.5rem,12.5cqi)]";

// The board's columns from 1024px (header and rows): topic, where it goes,
// reply, arrow. Flexible shares with real gaps, so no column runs into the next.
const BOARD_COLS = "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.85fr)_40px] lg:gap-x-6 xl:gap-x-8";

/** The form listens for this (detail: the topic's name) to pick its topic. */
export const TOPIC_EVENT = "contact-topic";

// UK office hours: Monday to Friday, 9:00 am to 5:00 pm, London time.
export function london(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = parts.weekday as string;
  const h = Number(parts.hour);
  const weekday = !["Saturday", "Sunday"].includes(day);
  const open = weekday && h >= 9 && h < 17;
  const next = weekday && h < 9 ? "today" : ["Friday", "Saturday", "Sunday"].includes(day) ? "Monday" : "tomorrow";
  return {
    digits: `${parts.hour}${parts.minute}`,
    day,
    open,
    note: open ? "open until 5:00 pm" : `back ${next} at 9:00 am`,
  };
}

/** One split-flap digit: the old face folds down as the new one arrives. */
function Flap({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative grid h-[84px] w-[60px] place-items-center overflow-hidden rounded-[10px] bg-[#0b3a2c] [perspective:400px] md:h-[111px] md:w-[78px] md:rounded-[12px]">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="block font-[family-name:var(--font-geist-mono)] text-[62px] leading-none text-[#f2efe6] [backface-visibility:hidden] md:text-[84px]"
          initial={reduce ? false : { rotateX: -95, opacity: 0.3 }}
          animate={{ rotateX: 0, opacity: 1, transition: { duration: 0.55, delay, ease: EASE } }}
          exit={reduce ? undefined : { rotateX: 95, opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }}
          style={{ transformOrigin: "50% 50%" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {/* The hinge across the middle, with its two pins. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#06180b]/70" />
      <span aria-hidden="true" className="absolute left-0 top-1/2 h-2 w-[3px] -translate-y-1/2 rounded-r-sm bg-white/25" />
      <span aria-hidden="true" className="absolute right-0 top-1/2 h-2 w-[3px] -translate-y-1/2 rounded-l-sm bg-white/25" />
    </span>
  );
}

function Clock() {
  // Rendered after mount: the time on the server is not the visitor's.
  const [now, setNow] = useState<ReturnType<typeof london> | null>(null);
  useEffect(() => {
    const tick = () => setNow(london(new Date()));
    tick();
    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
  }, []);
  const d = now?.digits ?? "    ";

  return (
    <div className="flex flex-col items-start gap-4 lg:items-end">
      <p className="m-0 type-small font-semibold text-[#1ee9b5]" aria-live="polite">
        <span className={now && !now.open ? "text-white/70" : undefined}>{now && !now.open ? "Our UK team is out" : "Our UK team is in"}</span>
      </p>
      <div role="img" aria-label={now ? `London time ${d.slice(0, 2)}:${d.slice(2)}` : "London time"} className="flex items-center gap-2">
        <Flap value={d[0]} />
        <Flap value={d[1]} delay={0.08} />
        <span aria-hidden="true" className="flex w-[15px] flex-col items-center gap-3 md:gap-4">
          <span className="size-[7px] bg-[#1ee9b5] motion-safe:animate-[colon-blink_2s_steps(1)_infinite] md:size-2" />
          <span className="size-[7px] bg-[#1ee9b5] motion-safe:animate-[colon-blink_2s_steps(1)_infinite] md:size-2" />
        </span>
        <Flap value={d[2]} delay={0.16} />
        <Flap value={d[3]} delay={0.24} />
      </div>
      <p className="m-0 type-small text-white/75">
        London time{now ? ` · ${now.day} · ${now.note}` : ""}
      </p>
    </div>
  );
}

/**
 * The Contact hero: the question as a headline, the London clock showing
 * whether the UK team is in, and a departures board of topics, each saying
 * where a message goes and when to expect a reply.
 *
 * Motion: the headline rises line by line; the clock's digits flip in and
 * flip again as the minutes turn; the board's rows arrive one by one and the
 * highlight glides to the row under the pointer.
 */
export default function ContactHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const [active, setActive] = useState(0);
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", animate: "show" };
  const board = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-10%" } };

  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };
  const line: Variants = {
    hide: { y: "105%" },
    show: (d: number) => ({ y: "0%", transition: { duration: 1, delay: d, ease: EASE } }),
  };

  const heading = title?.trim() || "Where should your message go?";
  // The heading wraps word by word, and the last two words stay together so
  // it never ends on a lone word. Its size is also capped by its column
  // (H1_SIZE), so the design's "Where should your / message go?" always fits
  // on two lines; before, where "Where should your" didn't fit (phones, and
  // beside the clock at 1024px and 1920px) "your" was left alone on a line.
  const words = heading.split(/\s+/);
  const chunks = words.length > 2 ? [...words.slice(0, -2), words.slice(-2).join("\u00A0")] : words;

  const choose = (t: ContactTopic) => (e: React.MouseEvent) => {
    if (t.href !== "#form") return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(TOPIC_EVENT, { detail: t.topic }));
    scrollTo("#contact-form", { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84), immediate: !!reduce });
  };

  const hover = (i: number) => setActive(i);

  return (
    <section
      aria-labelledby="contact-title"
      className="ragged relative overflow-hidden bg-[#04140a] px-5 pb-24 pt-[calc(var(--home-nav-h)+56px)] text-[#f2efe6] md:px-10 lg:pb-[136px] lg:pt-[calc(var(--home-nav-h)+115px)]"
    >
      {/* The light falling from the top right. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_85%_30%,#0e3d24_0%,rgb(9_42_24/0.55)_40%,transparent_75%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-[-20%] size-[900px] rounded-full bg-[#1ee9b5]/[0.05] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]" />

      <div className="relative mx-auto max-w-site">
        <motion.div {...group} className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          {/* A size container, so the heading can scale to the column's width. */}
          <div className="@container min-w-0 lg:flex-1">
            <motion.nav variants={fade} custom={0} aria-label="Breadcrumb" className="type-small font-medium">
              <ol className="m-0 flex list-none items-center gap-2.5 p-0">
                <li>
                  <Link href="/" className="text-white/85 transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/40">
                  /
                </li>
                <li aria-current="page" className="text-[#1ee9b5]">
                  Contact us
                </li>
              </ol>
            </motion.nav>
            <h1 id="contact-title" className={`m-0 mt-8 font-title font-normal leading-none tracking-[-0.055em] lg:mt-[30px] ${H1_SIZE}`}>
              {chunks.map((c, i) => (
                <span key={i}>
                  <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
                    <motion.span className="inline-block" variants={line} custom={0.1 + i * 0.06}>
                      {c}
                    </motion.span>
                  </span>
                  {i < chunks.length - 1 && " "}
                </span>
              ))}
            </h1>
            <motion.p variants={fade} custom={0.35} className="m-0 mt-6 max-w-[520px] type-lead text-white/80 lg:mt-[22px]">
              {subtitle?.trim() || "Pick your topic on the board. We’ll send you to the fastest route, and tell you when to expect a reply."}
            </motion.p>
          </div>
          <motion.div variants={fade} custom={0.45} className="shrink-0 lg:mb-[3px]">
            <Clock />
          </motion.div>
        </motion.div>

        {/* The board. Below 1024px each topic is a stacked row (name, then
            where it goes and the reply time); from 1024px it reads as a table,
            the header and rows sharing BOARD_COLS. Nothing is cut off: long
            names wrap rather than truncate. */}
        <motion.div
          {...board}
          variants={{ hide: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.3, ease: EASE } } }}
          className="mt-14 overflow-hidden rounded-[16px] border border-white/[0.09] bg-[#051d14]/90 font-[family-name:var(--font-geist-mono)] lg:mt-[63px]"
          onPointerLeave={() => setActive(0)}
        >
          <div aria-hidden="true" className={`hidden h-[66px] items-center border-b border-white/[0.07] px-9 type-caption uppercase tracking-[0.08em] text-white/60 lg:grid ${BOARD_COLS}`}>
            <span>Topic</span>
            <span>Goes to</span>
            <span>Reply</span>
          </div>
          <ul className="m-0 list-none p-0">
            {TOPICS.map((t, i) => {
              const on = i === active;
              const toForm = t.href === "#form";
              const mail = t.href.startsWith("mailto:");
              return (
                <motion.li
                  key={t.topic}
                  variants={{ hide: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.5 + i * 0.07, ease: EASE } } }}
                  className="relative border-b border-white/[0.06] last:border-b-0"
                >
                  {on && (
                    <motion.span
                      layoutId="board-row"
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#0b3a2c]"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                  <Link
                    href={toForm ? "#contact-form" : t.href}
                    onClick={choose(t)}
                    onPointerEnter={() => hover(i)}
                    onFocus={() => hover(i)}
                    className={`relative grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-4 gap-y-2 px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1ee9b5] sm:px-7 lg:min-h-[85px] lg:gap-y-0 lg:px-9 lg:py-4 ${BOARD_COLS}`}
                  >
                    <span className={`flex min-w-0 items-center gap-4 type-h4 transition-colors duration-300 lg:type-h3 ${on ? "text-[#1ee9b5]" : "text-[#f2efe6]"}`}>
                      <span aria-hidden="true" className={`size-2 shrink-0 transition-colors duration-300 ${on ? "bg-[#1ee9b5]" : "bg-white/25"}`} />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{t.topic}</span>
                    </span>
                    {/* Under the name: phones and small tablets stack "goes to" over the reply; from
                        768px they share one line; from 1024px they are table cells. */}
                    <span className="col-start-1 row-start-2 flex min-w-0 flex-col items-start gap-0.5 pl-6 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-1 lg:contents">
                      <span className={`flex min-w-0 items-center gap-2 type-small transition-colors duration-300 lg:type-body ${on ? "text-[#1ee9b5]" : "text-white/85"}`}>
                        {/* An email may only break after its @. */}
                        <span className="min-w-0 [overflow-wrap:anywhere]">{t.route.replace("@", "@\u200B")}</span>
                        {t.external && (
                          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-[#1ee9b5]">
                            <path d="M2 8 8 2M3.5 2H8v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span aria-hidden="true" className="hidden size-1 shrink-0 rounded-full bg-white/25 md:block lg:hidden" />
                      <span className="type-small text-white/60 lg:type-body lg:text-white/75">{t.reply}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`col-start-2 row-span-2 row-start-1 grid size-10 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 lg:col-start-auto lg:row-span-1 lg:row-start-auto ${
                        on ? "border-[#1ee9b5] bg-[#1ee9b5] text-[#06180b]" : "border-white/25 text-white"
                      } ${on && toForm ? "rotate-90" : on && !mail ? "-rotate-45" : ""}`}
                    >
                      <Arrow size={12} />
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </div>
      <style>{`@keyframes colon-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }`}</style>
    </section>
  );
}
