"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { STEP_EVENT, STEPS, type StepKey } from "./SupportHero";

const EASE = [0.22, 1, 0.36, 1] as const;

// The design's words for each step of the header's six.
const TEXT: Record<StepKey, [string, string]> = {
  choose: ["Choose individual or company", "Buying for yourself or your whole team? Pick the right option at checkout, no separate sales call needed."],
  pay: ["Enrol & pay online", "One-off secure payment. No subscription, no recurring charges."],
  access: ["Get instant access", "Start straight away. Every course is self-paced and available the moment you enrol."],
  learn: ["Complete the course", "Work through the material in your own time, on any device."],
  certificate: ["Download your certificate", "Issued automatically the moment you finish, nothing extra to request."],
  resume: ["Resume anytime", "Log back in whenever suits you and pick up exactly where you left off."],
};

/**
 * From checkout to certificate: the six steps on a line, the ones behind the
 * current step done in ink, the current one in mint, the rest still to come.
 * The current step follows the header's pick; any step here can be picked too.
 *
 * Motion: the title rises word by word; the line draws from the first step to
 * the current one while each step it reaches fills in; the current step's
 * ring pulses. Picking another step runs the line on or back to it.
 */
export default function StepsTimeline() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-20%" });
  const [active, setActive] = useState(4); // Certificate, as in the header

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const i = STEPS.findIndex((s) => s.key === sp.get("step"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the address bar
    if (i >= 0) setActive(i);
    const onStep = (e: Event) => {
      const j = STEPS.findIndex((s) => s.key === (e as CustomEvent<StepKey>).detail);
      if (j >= 0) setActive(j);
    };
    window.addEventListener(STEP_EVENT, onStep);
    return () => window.removeEventListener(STEP_EVENT, onStep);
  }, []);

  const pick = (i: number) => {
    setActive(i);
    window.dispatchEvent(new CustomEvent(STEP_EVENT, { detail: STEPS[i].key }));
  };

  // Until the section is seen, nothing is filled; then the line runs out to the current step.
  const reached = seen || reduce ? active : -1;
  const n = STEPS.length;
  const share = (i: number) => (i <= 0 ? 0 : i / (n - 1));

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const up: Variants = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.05, ease: EASE } }) };
  const fade: Variants = { hide: { opacity: 0, y: 20 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: EASE } }) };
  const title = "From checkout to certificate.";
  // Seconds for the line to run between neighbouring steps.
  const PER = 0.28;

  return (
    <section aria-labelledby="timeline-title" className="ragged bg-[#f2efe6] px-5 pb-24 pt-20 text-[#06180b] md:px-10 lg:pb-[130px] lg:pt-[118px]">
      <motion.div {...group} className="mx-auto max-w-site">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <h2 id="timeline-title" className="m-0 font-title type-h2 font-normal tracking-[-0.05em]">
            {title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-top">
                <motion.span className="inline-block" variants={up} custom={i}>
                  {w}
                  {" "}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.2} className="m-0 max-w-[340px] type-lead text-[#06180b]/70 lg:mt-[4px]">
            Six steps, on your schedule. Nothing to book, nothing to wait for.
          </motion.p>
        </div>

        <div ref={ref} className="relative mt-12 lg:mt-[62px]">
          {/* The line: grey all the way, green as far as the current step. Across on wide screens, down on narrow. */}
          <span aria-hidden="true" className="absolute left-[27px] top-7 h-[calc(100%-56px)] w-[1.5px] bg-[#06180b]/15 lg:left-[calc(100%/12)] lg:right-[calc(100%/12)] lg:top-[27px] lg:h-[1.5px] lg:w-auto" />
          <span aria-hidden="true" className="absolute left-[27px] top-7 h-[calc(100%-56px)] w-[1.5px] lg:left-[calc(100%/12)] lg:right-[calc(100%/12)] lg:top-[27px] lg:h-[1.5px] lg:w-auto">
            <span
              className="absolute inset-0 origin-top bg-[#0c7a5e] transition-transform ease-[cubic-bezier(0.45,0,0.2,1)] [transform:scaleY(var(--fill))] lg:origin-left lg:[transform:scaleX(var(--fill))]"
              style={{ ["--fill" as string]: share(reached), transitionDuration: `${reduce ? 0 : Math.max(1, reached) * PER}s` }}
            />
          </span>

          <ol className="relative m-0 grid list-none gap-8 p-0 lg:grid-cols-6 lg:gap-0">
            {STEPS.map((s, i) => {
              const done = i < reached;
              const on = i === reached;
              const [t, d] = TEXT[s.key];
              // When the line reaches this step on its way out.
              const at = Math.max(0, i) * PER;
              return (
                <li key={s.key} className="flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:px-2 lg:text-center">
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-current={on ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${t}`}
                    className="group relative grid size-14 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1ee9b5]"
                  >
                    {on && !reduce && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#1ee9b5]/40 motion-safe:animate-[step-ring_2s_ease-out_infinite]" />}
                    <motion.span
                      className="absolute inset-0 rounded-full border"
                      initial={false}
                      animate={{
                        backgroundColor: on ? "#1ee9b5" : done ? "#06180b" : "#f7f6f1",
                        borderColor: on ? "#1ee9b5" : done ? "#06180b" : "rgba(6,24,11,0.18)",
                        scale: on ? 1.06 : 1,
                      }}
                      transition={{ duration: 0.45, delay: seen && !reduce ? (reached >= i ? at : 0) : 0, ease: EASE }}
                    />
                    <motion.span
                      className="relative font-[family-name:var(--font-geist-mono)] text-[22px] leading-none"
                      initial={false}
                      animate={{ color: on ? "#06180b" : done ? "#1ee9b5" : "#06180b" }}
                      transition={{ duration: 0.45, delay: seen && !reduce ? (reached >= i ? at : 0) : 0 }}
                    >
                      {i + 1}
                    </motion.span>
                    <span aria-hidden="true" className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-110" />
                  </button>
                  <motion.div variants={fade} custom={0.3 + i * 0.08} className="pt-2 lg:pt-0">
                    <h3 className="m-0 type-h4 font-medium tracking-[-0.01em] lg:mt-7">{t}</h3>
                    <p className={`m-0 mt-1.5 type-small transition-colors duration-500 lg:mt-1 ${on ? "text-[#06180b]/85" : "text-[#06180b]/65"}`}>{d}</p>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </motion.div>
      <style>{`@keyframes step-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }`}</style>
    </section>
  );
}
