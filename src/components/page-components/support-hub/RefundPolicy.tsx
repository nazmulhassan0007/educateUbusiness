"use client";

import { MotionConfig, motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type CmsAsset = {
  url: string;
  alt: string;
};

export type RefundPolicyPoint = {
  point: string;
};

export type RefundPolicyContent = {
  icon: CmsAsset;
  title: string;
  points: RefundPolicyPoint[];
};

const DEFAULT_TITLE = "Refund Policy";

const DEFAULT_CONTENT: RefundPolicyContent = {
  icon: { url: "/support-hub/icon-refund.png", alt: "" },
  title: DEFAULT_TITLE,
  points: [
    { point: "Clear, concise summary of refund procedures." },
    {
      point:
        "If you experience technical issues that prevent access, please contact support within 14 days of purchase. Refunds are assessed fairly on a case-by-case basis.",
    },
  ],
};

/**
 * The refund policy: an amber card with its badge and the CMS's points.
 *
 * Motion: the card settles in and a band of light sweeps across it once; the
 * badge's ring draws itself round and then keeps slowly turning, like a
 * clock's hand; each point's tick is drawn in turn as its line slides in.
 */
export default function RefundPolicy({ data }: { data?: Partial<RefundPolicyContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };
  // The CMS field can come back as an empty string, not absent.
  const title = content.title || DEFAULT_TITLE;

  const point: Variants = {
    hide: { opacity: 0, x: -16 },
    show: (i: number) => ({ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.55 + i * 0.15, ease: EASE } }),
  };
  const tick: Variants = {
    hide: { pathLength: 0 },
    show: (i: number) => ({ pathLength: 1, transition: { duration: 0.5, delay: 0.7 + i * 0.15, ease: EASE } }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="refund-policy" className="ragged bg-white px-5 py-16 md:px-10 lg:py-[90px]">
        <motion.div
          initial="hide"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hide: { opacity: 0, y: 40, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: EASE } } }}
          className="relative mx-auto flex max-w-site flex-col items-start gap-8 overflow-hidden rounded-[24px] border border-[#f5a623]/50 bg-[#f5a623]/[0.08] p-7 md:p-10 lg:flex-row lg:items-center lg:gap-10"
        >
          {/* One sweep of light across the card as it arrives. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/70 to-transparent"
            variants={{ hide: { x: "0%" }, show: { x: "450%", transition: { duration: 1.6, delay: 0.4, ease: [0.45, 0, 0.2, 1] } } }}
          />

          <div className="relative grid size-32 shrink-0 place-items-center">
            {/* A dotted ring that keeps turning, and a solid one drawn round once over it. */}
            <svg aria-hidden="true" viewBox="0 0 128 128" className="absolute inset-0 size-full motion-safe:animate-[refund-turn_24s_linear_infinite]">
              <circle cx="64" cy="64" r="62" fill="rgb(245 166 35 / 0.12)" />
              <circle cx="64" cy="64" r="54" fill="none" stroke="#f5a623" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 8" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 128 128" className="absolute inset-0 size-full -rotate-90">
              <motion.circle
                cx="64"
                cy="64"
                r="62"
                fill="none"
                stroke="#f5a623"
                strokeWidth="2"
                strokeLinecap="round"
                variants={{ hide: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.4, delay: 0.3, ease: EASE } } }}
              />
            </svg>
            <motion.span
              role="img"
              aria-label={content.icon.alt}
              className="relative size-12 bg-[#f5a623] mask-center mask-contain mask-no-repeat"
              style={{ maskImage: `url(${content.icon.url})`, WebkitMaskImage: `url(${content.icon.url})` }}
              variants={{ hide: { scale: 0.3, rotate: -90, opacity: 0 }, show: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 160, damping: 13, delay: 0.35 } } }}
            />
          </div>

          <div className="relative flex flex-col gap-4">
            <motion.h2
              className="m-0 font-title type-h3 font-normal tracking-[-0.03em] text-[#010502]"
              variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, ease: EASE } } }}
            >
              {title}
            </motion.h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {content.points.map((item, i) => (
                <motion.li key={item.point} variants={point} custom={i} className="flex items-start gap-3">
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-[3px] size-5 shrink-0" fill="none">
                    <circle cx="10" cy="10" r="10" fill="rgb(245 166 35 / 0.18)" />
                    <motion.path d="m6 10.2 2.6 2.6L14 7.4" stroke="#b46f00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" variants={tick} custom={i} />
                  </svg>
                  <p className="m-0 type-body text-[#38463c]">{item.point}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
        <style>{`@keyframes refund-turn { to { transform: rotate(360deg); } }`}</style>
      </section>
    </MotionConfig>
  );
}
