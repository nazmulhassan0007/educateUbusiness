"use client";

import { motion, useMotionTemplate, useReducedMotion, useSpring } from "motion/react";
import type { HomeCms } from "../awwwards/types";
import { EASE } from "./shared";

type Review = NonNullable<NonNullable<HomeCms["reviews"]>["reviews"]>[number];

// The design's shortened wording of three reviews from the CMS (each is the
// reviewer's own sentences, trimmed). Matched on name; anyone else shows the
// opening of their own quote.
const EXCERPTS: [RegExp, string][] = [
  [
    /merazul/i,
    "I learned practical concepts and skills that are directly applicable to my role. The course content was well-structured and relevant, and the examples helped reinforce the learning.",
  ],
  [
    /dipto/i,
    "The course materials were exceptionally clear, concise, and easy to follow. The hands-on examples, videos and supplementary articles were particularly valuable.",
  ],
  [
    /bushra/i,
    "The courses provided a solid understanding of essential topics such as fire safety, equality, diversity and inclusion, and harassment and sexual misconduct.",
  ],
];

function excerpt(r: Review) {
  const own = EXCERPTS.find(([re]) => re.test(r.name))?.[1];
  if (own) return own;
  const sentences = r.quote.trim().match(/[^.!?]+[.!?]+/g) ?? [r.quote.trim()];
  return sentences.slice(0, 2).join(" ").trim();
}

// The featured review first (the design's), then the two beside it.
function pick(reviews: Review[]) {
  const ordered = EXCERPTS.map(([re]) => reviews.find((r) => re.test(r.name))).filter((r): r is Review => Boolean(r));
  for (const r of reviews) if (ordered.length < 3 && !ordered.includes(r)) ordered.push(r);
  return ordered.slice(0, 3);
}

const initial = (name: string) => name.trim().charAt(0).toUpperCase();

/**
 * What our learners say: one review large on ink, two beside it on paper.
 * The light in the large card drifts toward the pointer.
 */
export default function Testimonials({ data }: { data?: HomeCms["reviews"] }) {
  const [lead, ...rest] = pick(data?.reviews ?? []);
  if (!lead) return null;

  return (
    <section aria-labelledby="reviews-title" className="ragged bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 md:py-28 lg:pb-32 lg:pt-[120px]">
      <div className="mx-auto max-w-site">
        <motion.h2
          id="reviews-title"
          className="m-0 font-title type-h2 font-normal tracking-[-0.03em]"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          What our learners say
        </motion.h2>

        <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-[755fr_532fr]">
          <LeadCard review={lead} />
          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              {rest.map((r, i) => (
                <motion.figure
                  key={r.name}
                  className="m-0 flex flex-col justify-between gap-7 rounded-[26px] bg-[#f7f6f1] p-8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgb(6_24_11/0.3)]"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.9, delay: 0.12 + i * 0.1, ease: EASE }}
                >
                  <blockquote className="m-0 type-lead text-[#06180b]/85">&ldquo;{excerpt(r)}&rdquo;</blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#06180b] type-small text-[#1ee9b5]">
                      {initial(r.name)}
                    </span>
                    <span>
                      <strong className="block type-body font-semibold">{r.name}</strong>
                      <span className="block type-small text-[#06180b]/60">{r.position}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LeadCard({ review: r }: { review: Review }) {
  const reduce = useReducedMotion();
  // The glow rests top right and leans toward the pointer.
  const gx = useSpring(86, { stiffness: 60, damping: 20 });
  const gy = useSpring(14, { stiffness: 60, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgb(30 233 181 / 0.2), transparent 72%)`;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    gx.set(((e.clientX - b.left) / b.width) * 100);
    gy.set(((e.clientY - b.top) / b.height) * 100);
  };
  const reset = () => {
    gx.set(86);
    gy.set(14);
  };

  return (
    <motion.figure
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative m-0 flex min-h-[440px] flex-col justify-between gap-12 overflow-hidden rounded-[26px] bg-[#06180b] px-7 pb-10 pt-10 text-white md:px-14 md:pb-14 md:pt-[54px] lg:min-h-[519px]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, ease: EASE }}
    >
      <motion.span aria-hidden="true" style={{ background: glow }} className="pointer-events-none absolute inset-0" />
      <blockquote className="relative m-0 max-w-[660px] font-title type-h3 tracking-[-0.03em]">
        &ldquo;{excerpt(r)}&rdquo;
      </blockquote>
      <figcaption className="relative flex items-center gap-4">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[#1ee9b5] type-lead text-[#06180b]">
          {initial(r.name)}
        </span>
        <span>
          <strong className="block type-body font-semibold">{r.name}</strong>
          <span className="block type-small text-white/60">{r.position}</span>
        </span>
      </figcaption>
    </motion.figure>
  );
}
