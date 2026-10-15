"use client";

import { MotionConfig, motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type CmsAsset = {
  url: string;
  alt: string;
};

export type GetInTouchCard = {
  // "iocn" (sic) mirrors the CMS field name the API returns.
  iocn: CmsAsset;
  title: string;
  text: string;
  description: string;
};

export type GetInTouchContent = {
  title: string;
  cards: GetInTouchCard[];
};

const DEFAULT_CONTENT: GetInTouchContent = {
  title: "Get in Touch",
  cards: [
    {
      iocn: { url: "/support-hub/icon-mail.svg", alt: "" },
      title: "Email Support",
      text: "support@educateu.com",
      description:
        "Drop us a message anytime — we typically reply within one business day.",
    },
    {
      iocn: { url: "/support-hub/icon-phone.svg", alt: "" },
      title: "Phone Number",
      text: "Within 24 hours",
      description:
        "Give us a call and speak directly with our support team.",
    },
    {
      iocn: { url: "/support-hub/icon-response.svg", alt: "" },
      title: "Response Time",
      text: "Within 1 business day",
      description:
        "We aim to answer every query within one working day, Monday to Friday.",
    },
    {
      iocn: { url: "/support-hub/icon-availability.svg", alt: "" },
      title: "Availability",
      text: "Monday–Friday, UK business hours",
      description:
        "Our team is on hand during UK business hours to help with anything you need.",
    },
  ],
};

// A card's detail as a link when it's an email address or a phone number.
function hrefOf(text: string) {
  if (/^\S+@\S+\.\S+$/.test(text)) return `mailto:${text}`;
  if (/^\+?[\d\s()-]{7,}$/.test(text)) return `tel:${text.replace(/[^\d+]/g, "")}`;
  return undefined;
}

// A mint light that follows the pointer inside a card (read by the card's own gradient).
function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}

/**
 * Get in touch: the CMS's ways to reach the team, as cards on a dark ground.
 *
 * Motion: two mint lights drift slowly behind the section; the title rises
 * letter by letter; the cards spring up one after another, each icon then
 * bobbing gently out of step with its neighbours. On hover a light follows
 * the pointer round the card, its edge lights mint and the card lifts.
 */
export default function GetInTouch({ data }: { data?: Partial<GetInTouchContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };

  const letter: Variants = {
    hide: { y: "110%", opacity: 0 },
    show: (i: number) => ({ y: "0%", opacity: 1, transition: { duration: 0.8, delay: i * 0.03, ease: EASE } }),
  };
  const card: Variants = {
    hide: { opacity: 0, y: 60, scale: 0.94 },
    show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 16, delay: 0.25 + i * 0.1 } }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="get-in-touch" aria-labelledby="touch-title" className="ragged relative isolate overflow-hidden bg-[#092310] px-5 py-20 text-[#f2efe6] md:px-10 lg:py-[120px]">
        <span aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 -z-10 size-[560px] rounded-full bg-[#1ee9b5]/[0.12] blur-[110px] motion-safe:animate-[touch-drift_18s_ease-in-out_infinite_alternate]" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 -z-10 size-[480px] rounded-full bg-[#18ba91]/[0.12] blur-[110px] motion-safe:animate-[touch-drift_22s_ease-in-out_infinite_alternate-reverse]" />

        <motion.div initial="hide" whileInView="show" viewport={{ once: true, margin: "-15%" }} className="mx-auto flex max-w-site flex-col items-start gap-10 md:items-center lg:gap-14">
          <h2 id="touch-title" aria-label={content.title} className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
            {[...content.title].map((ch, i) => (
              <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-top">
                <motion.span className="inline-block" variants={letter} custom={i}>
                  {ch === " " ? " " : ch}
                </motion.span>
              </span>
            ))}
          </h2>

          <ul className="m-0 grid w-full list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:gap-6 2xl:grid-cols-4">
            {content.cards.map((c, i) => {
              const text = c.text.trim();
              const href = hrefOf(text);
              return (
                <motion.li
                  key={c.title}
                  variants={card}
                  custom={i}
                  onPointerMove={spotlight}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-[border-color] duration-500 hover:border-[#1ee9b5]/50 lg:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(300px_circle_at_var(--x,50%)_var(--y,50%),rgb(30_233_181/0.2),transparent_65%)]"
                  />
                  <motion.span
                    className="relative grid size-[68px] place-items-center rounded-2xl border border-white/10 bg-white/[0.05] transition-colors duration-500 group-hover:border-[#1ee9b5]/40 group-hover:bg-[#1ee9b5]/10"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
                    <img alt={c.iocn.alt} src={c.iocn.url} className="size-10" />
                  </motion.span>

                  <div className="relative mt-auto pt-10">
                    <h3 className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#1ee9b5]">{c.title}</h3>
                    {href ? (
                      <a href={href} className="mt-3 inline-block break-all type-h4 font-medium text-white underline decoration-[#1ee9b5]/0 underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-[#1ee9b5]">
                        {text}
                      </a>
                    ) : (
                      <p className="m-0 mt-3 type-h4 font-medium text-white">{text}</p>
                    )}
                    <p className="m-0 mt-3 type-small text-[#f2efe6]/65">{c.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <style>{`@keyframes touch-drift { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(180px, 120px) scale(1.15); } }`}</style>
      </section>
    </MotionConfig>
  );
}
