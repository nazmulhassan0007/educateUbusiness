"use client";

import { MotionConfig, motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type CmsAsset = {
  url: string;
  alt: string;
};

export type HowItWorksStep = {
  icon: CmsAsset;
  label: string;
  description: string;
};

export type HowItWorksContent = {
  steps: HowItWorksStep[];
};

const DEFAULT_CONTENT: HowItWorksContent = {
  steps: [
    {
      icon: { url: "/support-hub/icon-enrol.svg", alt: "" },
      label: "Enrol and Pay Online",
      description:
        "Sign up in minutes and complete your secure payment online to get started.",
    },
    {
      icon: { url: "/support-hub/icon-clock.svg", alt: "" },
      label: "Access your course instantly",
      description:
        "Get instant access to your course materials as soon as payment is confirmed.",
    },
    {
      icon: { url: "/support-hub/icon-alarm.svg", alt: "" },
      label: "Access your course instantly",
      description:
        "Learn on your own schedule — there are no fixed start dates or deadlines.",
    },
    {
      icon: { url: "/support-hub/icon-book.svg", alt: "" },
      label: "Complete the course",
      description:
        "Work through each module at your own pace, whenever it suits you.",
    },
    {
      icon: { url: "/support-hub/icon-diploma.png", alt: "" },
      label: "Download your certificate",
      description:
        "Finish the course and download your CPD-certified certificate immediately.",
    },
    {
      icon: { url: "/support-hub/icon-resume.svg", alt: "" },
      label: "Resume your course anytime",
      description:
        "Pick up right where you left off, on any device, whenever you're ready.",
    },
  ],
};

const pad = (n: number) => String(n).padStart(2, "0");

// A mint light that follows the pointer inside a card (read by the card's own gradient).
function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}

/**
 * How it works: the CMS's steps as numbered cards, in order.
 *
 * Motion: the cards come up out of a slight backward lean, one after another,
 * and each one's mint rule runs across as it lands, so the row reads as a
 * sequence. On hover a light follows the pointer, the icon lifts and turns,
 * and the step's description slides up under its title (on touch screens the
 * description is simply always shown).
 */
export default function HowItWorks({ data }: { data?: Partial<HowItWorksContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };

  const card: Variants = {
    hide: { opacity: 0, y: 70, rotateX: 18 },
    show: (i: number) => ({ opacity: 1, y: 0, rotateX: 0, transition: { duration: 1, delay: (i % 3) * 0.12 + Math.floor(i / 3) * 0.08, ease: EASE } }),
  };
  const rule: Variants = {
    hide: { scaleX: 0 },
    show: (i: number) => ({ scaleX: 1, transition: { duration: 0.9, delay: 0.35 + (i % 3) * 0.12 + Math.floor(i / 3) * 0.08, ease: EASE } }),
  };
  const icon: Variants = {
    hide: { scale: 0.4, rotate: -25, opacity: 0 },
    show: (i: number) => ({ scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 180, damping: 14, delay: 0.45 + (i % 3) * 0.12 } }),
  };
  const head: Variants = {
    hide: { y: "105%" },
    show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: i * 0.06, ease: EASE } }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="how-it-works" aria-labelledby="how-title" className="ragged bg-linear-to-b from-[#f1fefa] to-white px-5 py-20 text-[#042018] md:px-10 lg:py-[120px]">
        <div className="mx-auto max-w-site">
          <motion.div initial="hide" whileInView="show" viewport={{ once: true, margin: "-15%" }} className="mb-12 flex flex-col gap-3 lg:mb-16">
            <motion.p
              className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]"
              variants={{ hide: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
            >
              {pad(content.steps.length)} steps
            </motion.p>
            <h2 id="how-title" className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
              {"How it works".split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
                  <motion.span className="inline-block" variants={head} custom={i}>
                    {w}
                    {" "}
                  </motion.span>
                </span>
              ))}
            </h2>
          </motion.div>

          <motion.ol
            initial="hide"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="m-0 grid list-none grid-cols-1 gap-5 p-0 perspective-[1200px] sm:grid-cols-2 lg:gap-6 2xl:grid-cols-3"
          >
            {content.steps.map((step, i) => (
              <motion.li
                key={`${step.label}-${i}`}
                variants={card}
                custom={i}
                onPointerMove={spotlight}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="group relative flex min-h-[260px] origin-bottom flex-col overflow-hidden rounded-[20px] border border-[#042018]/[0.07] bg-white/70 p-7 shadow-[0_24px_48px_-32px_rgb(4_32_24/0.35)] backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-[#1ee9b5]/60 hover:shadow-[0_32px_64px_-30px_rgb(12_122_94/0.45)] lg:min-h-[300px] lg:p-8"
              >
                {/* The pointer's light, only while hovered. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(320px_circle_at_var(--x,50%)_var(--y,50%),rgb(30_233_181/0.22),transparent_65%)]"
                />
                <motion.span aria-hidden="true" variants={rule} custom={i} className="absolute inset-x-0 top-0 h-[3px] origin-left bg-[#1ee9b5]" />

                <div className="relative flex items-start justify-between">
                  <motion.span
                    variants={icon}
                    custom={i}
                    className="grid size-16 place-items-center rounded-2xl bg-[#f1fefa] ring-1 ring-[#042018]/[0.06] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:-rotate-6 group-hover:bg-[#1ee9b5]"
                  >
                    {/* The icon assets are white silhouettes, so they're painted through a mask. */}
                    <span
                      role="img"
                      aria-label={step.icon.alt}
                      className="size-9 bg-[#042018] mask-center mask-contain mask-no-repeat"
                      style={{ maskImage: `url(${step.icon.url})`, WebkitMaskImage: `url(${step.icon.url})` }}
                    />
                  </motion.span>
                  <span className="font-title text-[44px] leading-none tracking-[-0.04em] text-[#042018]/10 transition-colors duration-500 group-hover:text-[#0c7a5e]/40 lg:text-[56px]">
                    {pad(i + 1)}
                  </span>
                </div>

                {/* Wide screens: the title sits low and the description rises into view on hover. */}
                <div className="relative mt-auto pt-10 lg:translate-y-[calc(var(--desc-h,3.2em))] lg:transition-transform lg:duration-500 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:translate-y-0">
                  <h3 className="m-0 type-h4 font-medium tracking-[-0.01em]">{step.label}</h3>
                  <p className="m-0 mt-2 type-small text-[#38463c]/80 lg:opacity-0 lg:transition-opacity lg:duration-500 lg:group-hover:opacity-100">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>
    </MotionConfig>
  );
}
