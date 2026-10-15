"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { EASE } from "./shared";

const STEPS: { title: string; body: React.ReactNode }[] = [
  { title: "Choose your course", body: "Pick one for yourself, or select company purchase for your team." },
  { title: "Complete checkout", body: "One-off payment. You get instant access straight away." },
  {
    title: "Pass and download",
    body: (
      <>
        Finish the final assessment and your CPD certificate is issued. Anyone can verify it with{" "}
        <Link href="/certificate-checker" className="underline decoration-[#1ee9b5]/60 underline-offset-4 transition-colors hover:text-[#1ee9b5]">
          Certificate Checker
        </Link>
        .
      </>
    ),
  },
];

/**
 * From enrol to certificate: the three steps to a certificate on the left,
 * a sample certificate on the right. The steps light up in turn as the
 * section scrolls through, along a line that fills behind them; the
 * certificate tilts toward the pointer.
 */
export default function EnrolToCertificate() {
  return (
    <section
      aria-labelledby="journey-title"
      className="ragged relative overflow-hidden bg-[#06180b] px-5 py-20 text-[#f2efe6] md:px-10 md:py-28 lg:pb-[120px] lg:pt-[136px]"
    >
      {/* The mint light the certificate sits in. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_44%_70%_at_84%_64%,rgb(30_233_181/0.16),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-site items-center gap-16 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[minmax(0,1fr)_700px] xl:gap-6">
        <div>
          <motion.h2
            id="journey-title"
            className="m-0 font-title type-h2 font-normal tracking-[-0.03em]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            From enrol to
            <br />
            certificate.
          </motion.h2>
          <Steps />
        </div>
        <Certificate />
      </div>
    </section>
  );
}

function Steps() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  // 0 as the list enters the lower part of the screen, 1 once it has risen past the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setReached(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length + 0.15))));
  const lit = reduce ? STEPS.length - 1 : reached;

  return (
    <ol ref={ref} className="relative m-0 mt-12 list-none p-0 md:mt-16">
      {/* The line runs from the first circle to the end of the last step; mint fills it as you scroll. */}
      <span aria-hidden="true" className="absolute bottom-0 left-[11.5px] top-3 w-px bg-[#0c7a5e]/50" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: reduce ? 1 : fill }}
        className="absolute bottom-0 left-[11.5px] top-3 w-px origin-top bg-[#1ee9b5]"
      />
      {STEPS.map((s, i) => {
        const on = i <= lit;
        return (
          <motion.li
            key={s.title}
            className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-[30px] pb-9 last:pb-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
          >
            <span
              aria-hidden="true"
              className={`relative mt-[3px] grid size-6 place-items-center rounded-full type-caption font-medium text-[#06180b] transition-[background-color,box-shadow] duration-500 ${
                on ? "bg-[#1ee9b5] shadow-[0_0_0_6px_rgb(30_233_181/0.12)]" : "bg-[#f2efe6]"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.02em]">{s.title}</h3>
              <p className="m-0 mt-2.5 max-w-[470px] type-body text-[#f2efe6]/75">{s.body}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/**
 * The sample certificate. Every size inside is in container units, so the
 * whole sheet scales like an image from phone to desktop. Its width is the
 * smallest of 460px, 80% of the screen's width, and whatever keeps the sheet
 * (842x1134) within 64% of the screen's height, so it keeps one proportion to
 * the screen: short laptops and phones no longer get a sheet that fills them.
 */
function Certificate() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), spring);

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

  return (
    <div className="relative mx-auto w-full max-w-[min(460px,80vw,calc(64svh*842/1134))] [perspective:1400px]">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, y: 80, rotate: -9 }}
        whileInView={{ opacity: 1, y: 0, rotate: -3 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, ease: EASE }}
        className="group relative [container-type:inline-size]"
      >
        {/* The real educateU certificate, with a sample name and course. */}
        <figure className="m-0 overflow-hidden rounded-[1.6cqw] bg-white shadow-[0_60px_120px_-40px_rgb(0_0_0/0.8),0_24px_48px_-24px_rgb(0_0_0/0.55)]">
          <Image
            src="/home/certificate-sample.png"
            alt="Sample educateU CPD certificate of achievement, showing the learner's name, course name, completion date and certificate ID"
            width={842}
            height={1134}
            sizes="(min-width: 1024px) 460px, 80vw"
            className="block h-auto w-full"
          />
        </figure>
      </motion.div>
    </div>
  );
}
