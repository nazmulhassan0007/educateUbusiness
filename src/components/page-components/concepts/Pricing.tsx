"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Reveal, { RiseItem } from "../awwwards/Reveal";
import type { HomeCourse } from "../awwwards/types";

const INCLUDED = [
  { icon: "/home/icon-instant.png", title: "Instant access", body: "Start the moment you enrol. No waiting for a fixed start date." },
  { icon: "/home/icon-device.png", title: "Self-paced, any device", body: "Online modules you can learn at your own speed." },
  { icon: "/home/icon-certificate.png", title: "Quizzes, then your certificate", body: "Module quizzes, a final assessment, and a CPD Certificate of Completion." },
];

/**
 * The price, said once and large: one figure for every course, and what that
 * figure buys listed beside it.
 */
export default function Pricing({ courses }: { courses: HomeCourse[] }) {
  // Every course is the same price today; the lowest keeps the claim true if that changes.
  const price = courses.length ? Math.min(...courses.map((c) => c.price)) : 15;

  return (
    <section className="bg-[#f7f6f1] px-5 py-24 text-[#06180b] md:px-10 md:py-32" aria-labelledby="c-price">
      <div className="mx-auto grid max-w-site items-center gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="m-0 font-title type-stat tracking-[-0.03em]">
            {formatPrice(price)}
            <span className="text-[#0c7a5e]">.</span>
          </p>
          <h2 id="c-price" className="m-0 max-w-[746px] pt-6 font-title type-h2 font-normal tracking-[-0.03em] [text-wrap:balance]">
            Every course. Certificate included. Pay once.
          </h2>
          <p className="m-0 max-w-[639px] pt-6 type-lead text-[#06180b]/70 [text-wrap:pretty]">
            No subscriptions, no recurring fees, no &ldquo;+ VAT&rdquo; surprises. You know the full cost before you start, and the certificate is yours to keep.
          </p>
        </Reveal>

        <ul className="m-0 grid list-none gap-px overflow-hidden rounded-[24px] bg-[#06180b]/10 p-0 lg:col-span-5" aria-label="Included with every course">
          {INCLUDED.map((item, i) => (
            <RiseItem key={item.title} index={i} className="flex items-start gap-5 bg-[#f7f6f1] p-7">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#06180b]">
                <Image src={item.icon} alt="" width={20} height={20} />
              </span>
              <span className="min-w-0">
                <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.03em]">{item.title}</h3>
                <p className="m-0 pt-1 type-small text-[#06180b]/70 [text-wrap:pretty]">{item.body}</p>
              </span>
            </RiseItem>
          ))}
        </ul>
      </div>
    </section>
  );
}
