"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Reveal, { RiseItem } from "../awwwards/Reveal";
import type { HomeCourse } from "../awwwards/types";
import { EASE, ScaledStage } from "./shared";

const STEPS = [
  { title: "Choose your course", body: "Pick one for yourself, or select company purchase for your team." },
  { title: "Complete checkout", body: "One-off payment. You get instant access straight away." },
  { title: "Pass and download", body: "Finish the final assessment and your CPD certificate is issued. Anyone can verify it with Certificate Checker." },
];

/** A sample of the certificate every course ends with. */
function Certificate({ course, price }: { course: string; price: number }) {
  return (
    <motion.div
      className="absolute left-[50px] top-[30px] h-[496px] w-[639px]"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <div className="relative h-full w-full -rotate-3 rounded-[10px] bg-[#fbf9f3] text-[#06180b] [filter:drop-shadow(0_60px_30px_rgb(0_0_0/0.8))]">
        <div className="absolute inset-3 rounded-[6px] border border-[#06180b]/15" />
        <div className="absolute inset-x-12 top-12 flex items-start justify-between">
          <p className="m-0 flex items-center gap-2">
            <span className="font-title text-[24px] leading-6 tracking-[-0.03em]">
              educate<span className="text-[#0c7a5e]">U</span>
            </span>
            <span className="rounded-[4px] bg-[#06180b] px-1.5 py-1 text-[12px] font-medium leading-3 text-[#f2efe6]">BUSINESS</span>
          </p>
          <p className="m-0 font-mono text-[11px] leading-[16.5px] text-[#06180b]/60">SAMPLE CERTIFICATE</p>
        </div>
        <div className="absolute left-12 top-[120px]">
          <p className="m-0 font-mono text-[12px] leading-[18px] tracking-[0.12em] text-[#0c7a5e]">CERTIFICATE OF COMPLETION</p>
          <p className="m-0 mt-4 text-[15px] leading-[22.5px] text-[#06180b]/70">This is to certify that</p>
          <p className="m-0 mt-2 font-title text-[44px] leading-[44px] tracking-[-0.03em]">Your Name Here</p>
          <p className="m-0 mt-6 text-[15px] leading-[22.5px] text-[#06180b]/70">has successfully completed the CPD-certified course</p>
          <p className="m-0 mt-2 font-title text-[30px] leading-[37.5px] tracking-[-0.03em]">{course}</p>
        </div>
        <div className="absolute inset-x-12 top-[368px] flex items-end justify-between">
          <div>
            <p className="m-0 font-mono text-[11px] leading-[16.5px] text-[#06180b]/60">CERTIFICATE NO.</p>
            <p className="m-0 font-mono text-[14px] leading-[21px]">EU-XXXX-XXXX</p>
          </div>
          <Image src="/home/cpd-certified.png" alt="CPD Certified" width={80} height={80} className="size-20 object-contain" />
        </div>
      </div>
      {/* The price seal, stuck on at an angle over the certificate's edge. */}
      <motion.div
        className="absolute left-[553px] top-[150px] grid size-[144px] place-items-center rounded-full bg-[#1ee9b5] text-center text-[#06180b] [filter:drop-shadow(0_20px_10px_rgb(0_0_0/0.6))]"
        initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 8, opacity: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
      >
        <span className="w-[112px]">
          <span className="block font-title text-[32px] leading-10 tracking-[-0.03em]">{formatPrice(price)}</span>
          <span className="block text-[12px] font-medium leading-[15px]">certificate included</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

/** Three steps from choosing a course to holding the certificate, beside a sample of it. */
export default function HowItWorks({ courses }: { courses: HomeCourse[] }) {
  const sample = courses.find((c) => /fire safety/i.test(c.title)) ?? courses[0];
  const price = courses.length ? Math.min(...courses.map((c) => c.price)) : 15;

  return (
    <section className="relative overflow-hidden bg-[#06180b] px-5 py-24 text-[#f2efe6] md:px-10 md:py-32" aria-labelledby="c-how">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[200px] left-[46%] size-[1260px] rounded-full bg-[radial-gradient(closest-side,rgb(12_93_72/0.6),rgb(12_93_72/0.2)_45%,transparent_70%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url(/home/how-texture.png)] bg-[length:160px_160px] opacity-[0.06]" />

      <div className="relative mx-auto grid max-w-site items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 id="c-how" className="m-0 max-w-[510px] font-title type-h2 font-normal tracking-[-0.03em] [text-wrap:balance]">
              From enrol to certificate.
            </h2>
          </Reveal>
          <ol className="relative m-0 ml-3 mt-12 list-none border-l border-white/15 p-0">
            <motion.span
              aria-hidden="true"
              className="absolute -left-px top-0 w-px origin-top bg-[#1ee9b5]/60"
              style={{ height: "100%" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {STEPS.map((s, i) => (
              <RiseItem key={s.title} index={i} className={`relative pl-10 ${i ? "pt-10" : ""}`}>
                <span
                  aria-hidden="true"
                  className={`absolute -left-[13px] grid size-6 place-items-center rounded-full font-mono type-caption text-[#06180b] ${i ? "top-10 bg-[#f2efe6]" : "top-0 bg-[#1ee9b5]"}`}
                >
                  {i + 1}
                </span>
                <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.03em]">{s.title}</h3>
                <p className="m-0 max-w-[437px] pt-2 type-body text-[#f2efe6]/70 [text-wrap:pretty]">{s.body}</p>
              </RiseItem>
            ))}
          </ol>
        </div>

        <div className="flex justify-center lg:col-span-7">
          <ScaledStage width={740} height={560}>
            <Certificate course={sample?.title ?? "Fire Safety Awareness"} price={price} />
          </ScaledStage>
        </div>
      </div>
    </section>
  );
}
