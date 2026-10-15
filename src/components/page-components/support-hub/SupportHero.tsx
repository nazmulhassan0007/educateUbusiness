"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { london } from "@/components/page-components/contact-us/ContactHero";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Where the answers live further down; the steps and the search send the reader there. */
export const SUPPORT_ANSWERS_ID = "support-answers";
/** Fired with the step's key when one is picked, for the answers below to follow. */
export const STEP_EVENT = "support-step";
/** Fired with the search text when the header's search is sent. */
export const SEARCH_EVENT = "support-search";

const icon = (d: ReactNode) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

export const STEPS = [
  { key: "choose", title: "Choose", sub: "Individual or company", icon: icon(<><circle cx="8" cy="7" r="3" /><path d="M2.5 16.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M13 4.5a3 3 0 0 1 0 5M15.5 12.5c1.2.7 2 2 2.3 4" /></>) },
  { key: "pay", title: "Pay", sub: "One-off, secure", icon: icon(<><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="M2.5 8.5h15" /></>) },
  { key: "access", title: "Access", sub: "Instant, self-paced", icon: icon(<path d="M11 2.5 4.5 11h5L9 17.5 15.5 9h-5z" />) },
  { key: "learn", title: "Learn", sub: "Any device", icon: icon(<path d="M5 3.5h10v13l-5-3-5 3z" />) },
  { key: "certificate", title: "Certificate", sub: "Automatic download", icon: icon(<><circle cx="10" cy="7.5" r="4.5" /><path d="m7 11.5-1 6 4-2 4 2-1-6" /></>) },
  { key: "resume", title: "Resume", sub: "Pick up where you left off", icon: icon(<><path d="M3.5 10a6.5 6.5 0 1 0 2-4.7" /><path d="M3.5 3v3.5H7" /></>) },
] as const;
export type StepKey = (typeof STEPS)[number]["key"];

/** The support card: who answers, and whether they're in right now. */
function TeamCard() {
  const [now, setNow] = useState<ReturnType<typeof london> | null>(null);
  useEffect(() => {
    const tick = () => setNow(london(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  const out = now && !now.open;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#06180b]/35 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="relative shrink-0">
          <Image src="/support/advisor.jpg" alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
          {!out && <span aria-hidden="true" className="absolute inset-0 rounded-full ring-2 ring-[#1ee9b5]/60 motion-safe:animate-[support-ring_2.4s_ease-out_infinite]" />}
        </span>
        <div>
          <p className="m-0 font-title type-h4 tracking-[-0.03em]">Real people, real support.</p>
          <p className={`m-0 mt-1 flex items-center gap-2 type-small font-semibold ${out ? "text-white/70" : "text-[#1ee9b5]"}`} aria-live="polite">
            <span aria-hidden="true" className={`size-2 rounded-full ${out ? "bg-white/40" : "bg-[#1ee9b5]"}`} />
            {out ? `Our UK team is out · back ${now.note.replace(/^back /, "")}` : "Our UK team is in"}
          </p>
        </div>
      </div>
      <p className="m-0 mt-5 type-small text-white/75">Mon – Fri, 9:00 am – 5:00 pm GMT. Real replies within 1 business day, not an autoresponder.</p>
    </div>
  );
}

/**
 * The Support Hub header: "Stuck? Start where you are.", a search over the
 * answers and the support card; under them the six steps of an educateU
 * course, each opening the answers for that moment.
 *
 * Motion: the headline rises line by line; the card slides in with the
 * advisor's ring pulsing while the team is in; the steps rise in turn, the
 * mint fill glides to the step picked, and each step's icon moves on hover.
 */
export default function SupportHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  const reduce = useReducedMotion();
  const scrollTo = useSmoothScrollTo();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<StepKey>("certificate");
  const [query, setQuery] = useState("");

  // A shared link (?step=…&q=…) opens on that step and search. Read after load: the page itself is static.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("step");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the address bar
    if (STEPS.some((x) => x.key === s)) setStep(s as StepKey);
    setQuery(sp.get("q") ?? "");
    // A step picked further down (the timeline) is the header's step too.
    const onStep = (e: Event) => {
      const k = (e as CustomEvent<StepKey>).detail;
      if (STEPS.some((x) => x.key === k)) setStep(k);
    };
    window.addEventListener(STEP_EVENT, onStep);
    return () => window.removeEventListener(STEP_EVENT, onStep);
  }, []);

  const go = (next: { step?: StepKey; q?: string }) => {
    const sp = new URLSearchParams(window.location.search);
    if (next.step) sp.set("step", next.step);
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    scrollTo(`#${SUPPORT_ANSWERS_ID}`, { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84), immediate: !!reduce });
  };
  const pick = (key: StepKey) => {
    setStep(key);
    window.dispatchEvent(new CustomEvent(STEP_EVENT, { detail: key }));
    go({ step: key });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: query.trim() }));
    go({ q: query.trim() });
  };

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", animate: "show" };
  const fade: Variants = { hide: { opacity: 0, y: 24 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }) };
  const line: Variants = { hide: { y: "105%" }, show: (d: number) => ({ y: "0%", transition: { duration: 1, delay: d, ease: EASE } }) };

  // "Stuck? Start where you are." in two lines, the second in mint.
  const heading = title?.trim() || "Stuck? Start where you are.";
  const [first, ...restWords] = heading.split(/(?<=\?)\s+/);
  const second = restWords.join(" ");

  return (
    <section
      aria-labelledby="support-title"
      className="relative overflow-hidden bg-[#0b3a28] px-5 pb-20 pt-[calc(var(--home-nav-h)+48px)] text-[#f2efe6] md:px-10 lg:pb-[97px] lg:pt-[calc(var(--home-nav-h)+88px)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_20%_0%,#0f4d37_0%,transparent_70%),linear-gradient(170deg,#0d4330_0%,#0b3a28_55%,#09301f_100%)]"
      />
      <span aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 size-[700px] rounded-full bg-[#1ee9b5]/[0.06] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]" />

      <motion.div {...group} className="relative mx-auto max-w-site">
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
              Support Hub
            </li>
          </ol>
        </motion.nav>

        <h1 id="support-title" className="m-0 mt-7 font-title type-display font-normal tracking-[-0.055em] lg:mt-[30px]">
          <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
            <motion.span className="block" variants={line} custom={0.1}>
              {first}
            </motion.span>
          </span>
          {second && (
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span className="block text-[#1ee9b5]" variants={line} custom={0.2}>
                {second}
              </motion.span>
            </span>
          )}
        </h1>

        <div className="mt-7 flex flex-col gap-10 lg:-mt-[16px] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 lg:w-[640px]">
            <motion.p variants={fade} custom={0.35} className="m-0 max-w-[590px] type-lead text-white/80">
              {subtitle?.trim() || "Pick the step you’re at and we’ll show the answers for that moment, or search everything."}
            </motion.p>
            <motion.form
              variants={fade}
              custom={0.45}
              role="search"
              onSubmit={submit}
              className="group/search mt-7 flex h-16 w-full items-center gap-3 rounded-[12px] bg-[#f2efe6] pl-5 pr-2 transition-shadow duration-300 focus-within:shadow-[0_0_0_4px_rgb(30_233_181/0.35)] md:h-[66px] md:pl-6 lg:mt-[23px]"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-[#06180b] transition-transform duration-300 group-focus-within/search:scale-110">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <label htmlFor="support-search" className="sr-only">
                Search support answers
              </label>
              <input
                id="support-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search certificates, refunds, team purchases…"
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#06180b] outline-none placeholder:text-[#06180b]/55 md:text-[19px] [&::-webkit-search-cancel-button]:hidden"
              />
              <button type="submit" className="h-12 shrink-0 rounded-[10px] bg-[#06180b] px-5 type-button font-medium text-white transition-colors duration-300 hover:bg-[#0c3a28] md:h-[51px] md:px-[21px]">
                Search
              </button>
            </motion.form>
          </div>
          <motion.div
            className="w-full lg:mb-[1px] lg:w-[398px] [&>div]:lg:py-[22px]"
            variants={{ hide: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 1.1, delay: 0.5, ease: EASE } } }}
          >
            <TeamCard />
          </motion.div>
        </div>

        {/* The six steps of a course. */}
        <ul className="m-0 mt-14 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:mt-[75px] lg:grid-cols-6 lg:gap-[13px]" aria-label="Where are you up to?">
          {STEPS.map((s, i) => {
            const on = s.key === step;
            return (
              <motion.li key={s.key} variants={fade} custom={0.6 + i * 0.06}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(s.key)}
                  className={`group relative flex h-full min-h-[140px] w-full flex-col overflow-hidden rounded-[14px] border pb-[21px] pl-5 pr-3 pt-5 text-left transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1ee9b5]/70 md:pl-[21px] md:pt-[21px] ${
                    on ? "border-[#1ee9b5] text-[#06180b]" : "border-white/10 bg-[#06180b]/30 text-[#f2efe6] hover:border-white/25"
                  }`}
                >
                  {on && <motion.span layoutId="support-step" aria-hidden="true" className="absolute inset-0 bg-[#1ee9b5]" transition={{ type: "spring", stiffness: 340, damping: 34 }} />}
                  <span className="relative flex items-center justify-between pr-[9px]">
                    <span className={`font-[family-name:var(--font-geist-mono)] type-caption transition-colors duration-500 ${on ? "text-[#06180b]" : "text-[#1ee9b5]"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        s.key === "resume" ? "group-hover:-rotate-180" : s.key === "access" ? "group-hover:scale-125" : "group-hover:-translate-y-0.5"
                      }`}
                    >
                      {s.icon}
                    </span>
                  </span>
                  <span className="relative mt-[17px] block font-title type-h4 tracking-[-0.035em]">{s.title}</span>
                  <span className={`relative mt-[13px] block type-small tracking-[-0.005em] transition-colors duration-500 ${on ? "text-[#06180b]/75" : "text-white/65"}`}>{s.sub}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
      <style>{`@keyframes support-ring { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(1.35); opacity: 0; } }`}</style>
    </section>
  );
}
