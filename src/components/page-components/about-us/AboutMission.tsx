"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

// The design's copy. The CMS's "Who We Are" section holds the same words at
// greater length; its photo is used when it has one.
const LEAD: { text: string; mark?: boolean }[] = [
  { text: "To make quality education " },
  { text: "accessible", mark: true },
  { text: ", " },
  { text: "achievable", mark: true },
  { text: " and " },
  { text: "aligned", mark: true },
  { text: " with today’s professional landscape." },
];
const SUB =
  "We’re here to help people shape their own success through learning, and give every learner the individual support they need to succeed with confidence and clarity.";
const ROWS = [
  {
    title: "Our vision",
    body: "To make high-quality, UK-accredited education globally accessible by connecting students, universities and employers, delivering flexible online learning that empowers growth and removes barriers to UK-recognised qualifications.",
  },
  {
    title: "Our values",
    body: "To lead the way in accessible, globally recognised online learning, creating a world where every learner has the opportunity to learn, grow and succeed, regardless of their background or location. Our goal is clear, affordable, self-serve learning that fits into real lives and real working schedules.",
  },
];

/**
 * The mission, under the About hero: two photos on the left (the small one
 * overlapping the large), the mission as a headline with its three key words
 * underlined in mint, then vision and values as ruled rows.
 *
 * Motion: the photos drift at different speeds as the page scrolls; the
 * headline rises word by word and the underlines draw in after it; each
 * row's rule draws across before its text arrives.
 */
export default function AboutMission({ photo, price }: { photo?: string; price: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bigY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const smallY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const smallRotate = useTransform(scrollYProgress, [0, 1], [5, -3]);
  const zoom = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  // The headline's words, keeping which ones are underlined. Punctuation
  // rides with the word before it, so a comma never wraps onto its own.
  const words: { w: string; tail: string; mark: boolean }[] = [];
  for (const part of LEAD) {
    for (const tok of part.text.split(/(\s+)/).filter(Boolean)) {
      if (/^\s+$/.test(tok)) continue;
      const last = words[words.length - 1];
      if (last && /^[^\w’]/.test(tok) && !part.mark) last.tail += tok;
      else words.push({ w: tok, tail: "", mark: !!part.mark });
    }
  }
  const up = { hide: { y: "105%" }, show: (i: number) => ({ y: "0%", transition: { duration: 0.85, delay: i * 0.04, ease: EASE } }) };
  const draw = { hide: { scaleX: 0 }, show: (d: number) => ({ scaleX: 1, transition: { duration: 0.9, delay: d, ease: EASE } }) };
  const fade = { hide: { opacity: 0, y: 16 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: EASE } }) };
  // Each group starts when the group itself is on screen; its parts follow the variants.
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-10%" } };

  return (
    <section ref={ref} aria-labelledby="mission-title" className="ragged overflow-hidden bg-[#f2efe6] px-5 py-24 text-[#06180b] md:px-10 lg:py-[150px]">
      <div className="mx-auto grid max-w-site gap-16 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-[88px]">
        {/* Photos. */}
        <motion.div {...group} className="relative mx-auto w-full max-w-[500px] self-start pb-[30%] lg:mx-0 lg:pb-0">
          <motion.div
            style={reduce ? undefined : { y: bigY }}
            className="relative aspect-[420/600] w-[84%] overflow-hidden rounded-[22px] bg-[#06180b]/10"
            variants={{ hide: { clipPath: "inset(0 0 100% 0 round 22px)" }, show: { clipPath: "inset(0 0 0% 0 round 22px)", transition: { duration: 1.3, ease: EASE } } }}
          >
            <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: zoom }}>
              <Image
                src={photo || "/about-us/photo-who-we-are.jpeg"}
                alt="A learner laughing with colleagues at work"
                fill
                sizes="(min-width:1024px) 420px, 84vw"
                className="object-cover object-[57%_50%]"
              />
            </motion.div>
            <motion.span
              className="absolute left-5 top-5 flex items-center gap-2 rounded-[10px] bg-[#f7f6f1] px-3.5 py-2 type-caption font-medium"
              variants={fade}
              custom={0.9}
            >
              CPD-certified courses · {price} each
            </motion.span>
          </motion.div>

          <motion.div
            style={reduce ? undefined : { y: smallY, rotate: smallRotate }}
            className="absolute bottom-0 right-0 w-[54%] rounded-[20px] bg-[#f7f6f1] p-2.5 shadow-[0_34px_60px_-24px_rgb(6_24_11/0.35)] transition-shadow duration-500 hover:shadow-[0_44px_70px_-24px_rgb(6_24_11/0.45)] lg:bottom-auto lg:left-[44.8%] lg:right-auto lg:top-[76.5%]"
            variants={{ hide: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.35, ease: EASE } } }}
          >
            <div className="group relative aspect-[260/322] overflow-hidden isolate rounded-[13px]">
              <Image
                src="/about-us/photo-why-bottom-right.jpeg"
                alt="A learner studying online with headphones"
                fill
                sizes="(min-width:1024px) 260px, 50vw"
                className="object-cover object-[62%_50%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Copy. */}
        <div className="min-w-0">
          <motion.h2 id="mission-title" {...group} className="m-0 font-title type-h2 font-normal tracking-[-0.035em]">
            {words.map(({ w, tail, mark }, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-top">
                  <motion.span className="inline-block" variants={up} custom={i}>
                    <span className="relative inline-block">
                      {w}
                      {mark && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-[0.02em] h-[0.09em] origin-left rounded-full bg-[#1ee9b5]"
                          variants={draw}
                          custom={0.75 + i * 0.05}
                        />
                      )}
                    </span>
                    {tail}
                  </motion.span>
                </span>{" "}
              </span>
            ))}
          </motion.h2>
          <motion.p {...group} variants={fade} custom={0.5} className="m-0 mt-8 max-w-[600px] type-lead text-[#06180b]/70">
            {SUB}
          </motion.p>

          <dl className="m-0 mt-16 lg:mt-[90px]">
            {ROWS.map((r, i) => (
              <motion.div key={r.title} {...group} className="group relative grid gap-3 py-8 md:grid-cols-[216px_minmax(0,1fr)] md:gap-6 lg:py-10">
                {/* Each rule draws across before its row arrives; the last row closes with one too. */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[#06180b]/15"
                  variants={draw}
                  custom={0}
                />
                {i === ROWS.length - 1 && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px origin-left bg-[#06180b]/15"
                    variants={draw}
                    custom={0.3}
                  />
                )}
                <motion.dt
                  className="font-title type-h3 tracking-[-0.03em] text-[#0c7a5e] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
                  variants={fade}
                  custom={0.2}
                >
                  {r.title}
                </motion.dt>
                <motion.dd
                  className="m-0 type-body text-[#06180b]/80"
                  variants={fade}
                  custom={0.3}
                >
                  {r.body}
                </motion.dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
