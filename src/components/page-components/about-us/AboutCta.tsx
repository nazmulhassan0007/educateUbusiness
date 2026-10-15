"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Check } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The closing call to action: a mint panel with the headline, a line, two
 * actions and three facts, with the fire safety course card breaking out of
 * the top edge and a certificate out of the bottom-right corner.
 *
 * Motion: the panel opens from its middle; the headline rises line by line;
 * the course card and certificate fly in from opposite edges into their
 * tilts, then follow the pointer at different depths.
 */
export default function AboutCta({
  price,
  contactHref = "/contact-us",
  coursesHref = "/courses",
}: {
  price: string;
  contactHref?: string;
  coursesHref?: string;
}) {
  const reduce = useReducedMotion();
  // Starts as soon as the top of the banner is 60px into the screen (it used
  // to wait until it was 15% in, so it read as late), and the whole sequence
  // is done in about a second. With reduced motion it is simply shown.
  const group = reduce
    ? { initial: "show", animate: "show" }
    : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "0px 0px -60px 0px" } };

  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: EASE } }),
  };
  const line: Variants = {
    hide: { y: "105%" },
    show: (d: number) => ({ y: "0%", transition: { duration: 0.7, delay: d, ease: EASE } }),
  };

  // Pointer depth: the two cards drift by different amounts.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const nearX = useTransform(px, [-0.5, 0.5], [-16, 16]);
  const nearY = useTransform(py, [-0.5, 0.5], [-12, 12]);
  const farX = useTransform(px, [-0.5, 0.5], [10, -10]);
  const farY = useTransform(py, [-0.5, 0.5], [8, -8]);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  const facts = [`${price} per course`, "CPD certificate included", "Instant access"];

  return (
    <section aria-labelledby="cta-title" className="overflow-x-clip bg-[#f2efe6] px-5 pb-24 pt-20 text-[#06180b] md:px-10 lg:pb-[170px] lg:pt-[120px]">
      <motion.div {...group} onPointerMove={onMove} onPointerLeave={reset} className="relative mx-auto max-w-site">
        {/* The panel. */}
        <motion.div
          className="relative overflow-hidden rounded-[18px] bg-[#1ee9b5] px-6 pb-10 pt-12 md:px-[72px] lg:h-[520px] lg:pb-0 lg:pt-[78px]"
          variants={{
            hide: { clipPath: "inset(10% 6% 10% 6% round 40px)", opacity: 0 },
            show: { clipPath: "inset(0% 0% 0% 0% round 18px)", opacity: 1, transition: { duration: 0.7, ease: EASE } },
          }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute -left-[10%] top-[30%] size-[520px] rounded-full bg-white/25 blur-[90px] motion-safe:animate-[glow-drift_18s_ease-in-out_infinite]" />

          <div className="relative">
            <h2 id="cta-title" className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" variants={line} custom={0.15}>
                  Advance your skills,
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span className="block text-[#0b3a28]" variants={line} custom={0.22}>
                  achieve your goals.
                </motion.span>
              </span>
            </h2>
            <motion.p variants={fade} custom={0.3} className="m-0 mt-7 type-lead text-[#06180b]/85 lg:mt-4">
              Start your learning journey today with educateU.
            </motion.p>

            <motion.div variants={fade} custom={0.36} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-7">
              <Link
                href={coursesHref}
                className="group relative inline-flex h-[60px] items-center gap-4 overflow-hidden rounded-full bg-[#06180b] py-1.5 pl-7 pr-1.5 type-button font-medium text-white"
              >
                <span aria-hidden="true" className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#0c3a28] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                <span className="relative">Explore Courses</span>
                <span className="relative grid size-[46px] place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 group-hover:-rotate-45">
                  <Arrow size={14} />
                </span>
              </Link>
              <Link
                href={contactHref}
                className="relative type-button font-medium after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-full after:origin-right after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:animate-[cta-underline_0.6s_ease]"
              >
                Contact us
              </Link>
            </motion.div>

            <ul className="m-0 mt-9 flex list-none flex-wrap gap-x-7 gap-y-3 p-0">
              {facts.map((f, i) => (
                <motion.li key={f} variants={fade} custom={0.42 + i * 0.05} className="flex items-center gap-2.5 type-small font-medium">
                  <span aria-hidden="true" className="grid size-[21px] place-items-center rounded-full bg-[#06180b] text-[#1ee9b5]">
                    <Check size={10} />
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* The course card, breaking out of the top edge. */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { x: farX, y: farY }}
          className="absolute right-[18.9%] top-[-46px] hidden w-[300px] lg:block"
        >
          <motion.div
            className="rounded-[16px] bg-white p-3 pb-4 shadow-[0_30px_60px_-24px_rgb(6_24_11/0.4)]"
            variants={{
              hide: { opacity: 0, y: -80, rotate: -10 },
              show: { opacity: 1, y: 0, rotate: 4, transition: { type: "spring", stiffness: 90, damping: 13, delay: 0.3 } },
            }}
            whileHover={reduce ? undefined : { rotate: 0, scale: 1.04 }}
          >
            <div className="relative aspect-[290/180] overflow-hidden rounded-[10px]">
              <Image src="/hero/fire-safety.jpg" alt="" fill sizes="300px" className="object-cover" />
            </div>
            <div className="flex items-baseline justify-between px-1 pt-4">
              <span className="type-body font-medium">Fire Safety Awareness</span>
              <span className="font-title type-h4 text-[#0c7a5e]">{price}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* The certificate, breaking out of the bottom-right corner. */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { x: nearX, y: nearY }}
          className="absolute bottom-[-40px] right-[2.8%] hidden w-[372px] lg:block"
        >
          <motion.div
            className="rounded-[14px] bg-[#f2efe6] p-3 shadow-[0_40px_70px_-24px_rgb(6_24_11/0.4)]"
            variants={{
              hide: { opacity: 0, x: 120, rotate: 8 },
              show: { opacity: 1, x: 0, rotate: -4, transition: { type: "spring", stiffness: 80, damping: 13, delay: 0.4 } },
            }}
            whileHover={reduce ? undefined : { rotate: 0, scale: 1.03 }}
          >
            <div className="flex flex-col items-center rounded-[8px] border border-[#0c7a5e]/40 px-6 pb-7 pt-10 text-center">
              <span className="grid size-[62px] place-items-center rounded-full bg-[#1ee9b5]">
                <svg width="22" height="26" viewBox="0 0 22 24" fill="none">
                  <circle cx="11" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                  <path d="m7 13.5-1.5 8.5 5.5-3 5.5 3-1.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mt-4 type-small font-medium text-[#0c7a5e]">Certificate of completion</span>
              <span className="mt-2 font-title type-h3 tracking-[-0.035em]">Your name here</span>
              <span className="mt-1.5 h-px w-[66%] bg-[#06180b]/15" />
              <span className="mt-3 type-small text-[#06180b]/80">Fire Safety Awareness · CPD certified</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      <style>{`@keyframes cta-underline { 0% { transform: scaleX(1); transform-origin: right; } 50% { transform: scaleX(0); transform-origin: right; } 51% { transform-origin: left; } 100% { transform: scaleX(1); transform-origin: left; } }`}</style>
    </section>
  );
}
