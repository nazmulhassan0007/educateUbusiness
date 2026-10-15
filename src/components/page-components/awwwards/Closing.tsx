"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Check, ScaledStage } from "../concepts/shared";
import Reveal from "./Reveal";
import { EASE, type HomeCourse } from "./types";

const PROOF = ["Instant access", "Self-paced, any device", "CPD certificate included"];

// The receipt's barcode, as [x, width] bars across 317px. Decorative.
const BARS: [number, number][] = [
  [0, 1], [3, 1], [5, 3], [10, 2], [14, 2], [17, 1], [21, 1], [24, 2], [29, 2], [32, 1], [36, 2], [40, 2], [43, 1], [47, 1], [49, 2], [54, 1],
  [57, 3], [62, 1], [65, 3], [69, 3], [73, 3], [79, 3], [83, 1], [87, 3], [93, 3], [99, 2], [102, 2], [105, 3], [111, 2], [116, 1], [119, 3],
  [124, 3], [129, 3], [134, 3], [140, 2], [145, 2], [148, 1], [150, 3], [154, 2], [158, 2], [162, 1], [165, 1], [168, 2], [173, 1], [177, 3],
  [183, 2], [187, 3], [192, 2], [195, 2], [198, 3], [203, 3], [207, 1], [211, 3], [215, 3], [220, 3], [225, 2], [228, 1], [232, 3], [236, 3],
  [241, 3], [246, 1], [248, 1], [251, 1], [255, 1], [258, 3], [263, 3], [267, 2], [271, 1], [273, 2], [277, 2], [280, 2], [284, 1], [287, 3],
  [292, 2], [295, 3], [300, 1], [303, 2], [306, 2], [311, 2], [314, 3],
];

// Soft light behind the band, placed as in the 1920 frame.
const GLOWS = [
  { src: "/home/cta-glow-1.svg", left: "66.56%", top: 69, size: 760 },
  { src: "/home/cta-glow-2.svg", left: "78.13%", top: 520, size: 520 },
  { src: "/home/cta-glow-3.svg", left: "-18.8%", top: 202, size: 544 },
];

const pounds = (n: number) => `£${n.toFixed(2)}`;

/** A sample receipt for one course: everything after the price is £0.00. */
function Receipt({ course, price }: { course?: HomeCourse; price: number }) {
  const modules = course?.detail?.modules.length;
  const lines: [string, string][] = [
    ["CPD certificate", "INCLUDED"],
    ["Monthly subscription", pounds(0)],
    ["Renewal fee", pounds(0)],
    ["Cancellation fee", pounds(0)],
  ];
  return (
    <div className="relative w-[380px] rotate-3 text-[#06180b] [filter:drop-shadow(0_2px_2px_rgb(0_0_0/0.25))_drop-shadow(0_40px_35px_rgb(0_0_0/0.55))]">
      <div className="rounded-t-[6px] bg-[#fbf9f3] px-8 pb-7 pt-8">
        <div className="flex items-center justify-between">
          <p className="m-0 font-title text-[22px] leading-[26px] tracking-[-0.02em]">educateU</p>
          <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.06em] text-[#06180b]/60">SAMPLE RECEIPT</p>
        </div>
        <div className="my-[18px] border-t border-dashed border-[#06180b]/35" />
        <div className="flex items-baseline justify-between gap-4 py-[9px] font-mono text-[14px] font-medium leading-5">
          <span className="truncate">1 × {course?.title ?? "Fire Safety Awareness"}</span>
          <span>{pounds(price)}</span>
        </div>
        <p className="m-0 whitespace-pre py-[9px] font-mono text-[13px] leading-5 text-[#06180b]/60">
          {"    "}
          {[modules ? `${modules} modules` : null, course?.duration].filter(Boolean).join(" · ")}
        </p>
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between py-[9px] font-mono text-[13px] leading-5 text-[#06180b]/85">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="my-[18px] border-t border-dashed border-[#06180b]/35" />
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[13px] font-medium leading-5 tracking-[0.04em]">TOTAL · PAID ONCE</span>
          <span className="font-title text-[44px] leading-[44px] tracking-[-0.03em]">{pounds(price)}</span>
        </div>
        <p className="m-0 mt-5 inline-flex items-center gap-2 rounded-full bg-[#1ee9b5] py-2 pl-3 pr-3.5 text-[13px] font-medium leading-[18px]">
          <Check />
          No renewal date. Ever.
        </p>
        <svg aria-hidden="true" width="317" height="40" viewBox="0 0 317 40" className="mt-6 block">
          {BARS.map(([x, w]) => (
            <rect key={x} x={x} width={w} height={40} fill="rgb(6 24 11 / 0.85)" />
          ))}
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/torn-edge.svg" alt="" width={380} height={14} className="-mt-px block" />
    </div>
  );
}

/**
 * The closing band for buyers: the one-off price as the last word, a sample
 * receipt showing nothing recurs, and two photographs set in arches.
 */
export default function Closing({ title, subtitle, courses }: { title?: string; subtitle?: string; courses: HomeCourse[] }) {
  const headline = title?.trim() || "No subscriptions, no recurring fees.";
  // "No subscriptions," on the first line, the rest in mint below it.
  const cut = headline.indexOf(",") + 1;
  const [first, second] = cut > 0 ? [headline.slice(0, cut), headline.slice(cut).trim()] : [headline, ""];
  const price = courses.length ? Math.min(...courses.map((c) => c.price)) : 15;
  const sample = courses.find((c) => /fire safety/i.test(c.title)) ?? courses[0];
  const sub = `${subtitle?.trim() || "Pay once, keep your certificate for good."} Every course is a single £${price} payment: no renewal date, no auto-billing, nothing to cancel.`;

  return (
    <section className="relative overflow-hidden bg-[#06180b] px-5 py-24 text-[#f2efe6] md:px-6 lg:py-[150px]" aria-labelledby="aw-close-title">
      {GLOWS.map((g) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={g.src}
          src={g.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute max-w-none"
          style={{ left: g.left, top: g.top, width: g.size, height: g.size, transform: "scale(1.39)" }}
        />
      ))}

      <div className="relative mx-auto flex max-w-site flex-col gap-16 lg:flex-row lg:items-center lg:gap-4">
        <Reveal className="min-w-0 lg:max-w-[760px] lg:flex-[0_1_760px]">
          <h2 id="aw-close-title" className="m-0 font-title text-[clamp(48px,6.6vw,96px)] font-normal leading-none tracking-[-0.03em]">
            <span className="block">{first}</span>
            {second && <span className="block text-[#1ee9b5]">{second}</span>}
          </h2>
          <p className="m-0 max-w-[600px] pt-7 text-[18px] leading-[1.5] text-[#f2efe6]/75 md:text-[20px] md:leading-[30px]">{sub}</p>
          <div className="flex flex-wrap items-center gap-3 pt-11">
            <Link
              href="/courses"
              className="group flex items-center gap-3.5 rounded-full bg-[#1ee9b5] py-2 pl-7 pr-2 text-[17px] font-medium leading-6 text-[#06180b] transition-transform active:scale-[0.98]"
            >
              Explore Our Courses
              <span className="grid size-11 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
            <Link href="/contact-us" className="rounded-full border border-[#f2efe6]/28 px-7 py-[18px] text-[17px] font-medium leading-6 transition-colors hover:bg-[#f2efe6]/10">
              Contact Us
            </Link>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0 pt-10">
            {PROOF.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[15px] leading-[22px] text-[#f2efe6]/82">
                <span className="grid size-5 place-items-center rounded-full bg-[#1ee9b5]/16 text-[#1ee9b5]">
                  <Check size={10} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* The receipt over two arched photographs, composed at 780 × 640 and scaled to fit. */}
        <div className="min-w-0 flex-1 lg:-mr-[max(0px,calc((100vw-1312px)/2-60px))]">
          <ScaledStage width={780} height={640}>
            <motion.div
              className="absolute left-[260px] top-0 h-[560px] w-[300px] overflow-hidden rounded-b-[24px] rounded-t-[150px] border border-[#f2efe6]/10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image src="/home/cta-team-training.jpg" alt="" fill sizes="300px" className="object-cover" />
            </motion.div>
            <motion.div
              className="absolute left-[580px] top-[270px] h-[360px] w-[200px] overflow-hidden rounded-b-[24px] rounded-t-[100px] border border-[#f2efe6]/10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            >
              <Image src="/home/cta-learner.jpg" alt="" fill sizes="200px" className="object-cover" />
            </motion.div>
            <motion.div
              className="absolute left-[15px] top-[60px]"
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            >
              <Receipt course={sample} price={price} />
            </motion.div>
          </ScaledStage>
        </div>
      </div>
    </section>
  );
}
