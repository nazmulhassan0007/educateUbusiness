"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { stripHtml } from "@/lib/utils";
import { EASE, type HomeCms } from "./types";

// The CMS bolds a phrase inside the quote; that phrase is set in mint.
function Quote({ html }: { html: string }) {
  const parts = html.replace(/<\/?p>/g, "").split(/(<strong>.*?<\/strong>)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("<strong>") ? (
          <span key={i} className="text-[#0c7a5e]">
            {stripHtml(part).trim()}{" "}
          </span>
        ) : (
          <span key={i}>{stripHtml(part)}</span>
        ),
      )}
    </>
  );
}

function Tile({ className, children, i }: { className: string; children: React.ReactNode; i: number }) {
  return (
    <motion.div
      className={`relative overflow-hidden isolate rounded-[28px] ${className}`}
      initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1, delay: (i % 3) * 0.08, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Photo({ url }: { url?: string }) {
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
    />
  );
}

/**
 * The CMS "Quote" section as one gapless composition: the statement, its three
 * photos and its two cards, sized so the grid closes with no holes.
 */
export default function Bento({ data }: { data?: HomeCms["quote"] }) {
  if (!data?.main_quote) return null;

  return (
    <section className="px-5 pb-24 pt-6 md:px-10 md:pb-36" aria-label="Why educateU">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[260px] xl:auto-rows-[300px]">
        <Tile i={0} className="flex flex-col justify-between bg-white p-8 md:col-span-7 md:row-span-2 md:p-12">
          <p className="m-0 font-title text-[clamp(30px,3.6vw,58px)] leading-[1.05] tracking-[-0.035em] text-[#06180b]">
            <Quote html={data.main_quote} />
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/all-courses/cpd-logo.avif" alt="CPD certified" className="mt-10 h-14 w-auto self-start md:h-16" />
        </Tile>

        <Tile i={1} className="group aspect-[16/10] bg-[#06180b] md:col-span-5 md:aspect-auto">
          <Photo url={data.img_1?.url} />
        </Tile>

        <Tile i={2} className="flex flex-col justify-between bg-[#06180b] p-7 text-white md:col-span-3">
          <div>
            <h3 className="m-0 font-title text-[26px] leading-tight tracking-[-0.02em] xl:text-[30px]">{data.card_1_title}</h3>
            <p className="m-0 mt-3 text-[15px] leading-relaxed text-white/60">{data.card_1_description}</p>
          </div>
          <Link href={data.card_1_cta?.url ?? "/courses"} className="group/cta mt-8 flex items-center gap-3 text-[15px] text-[#1ee9b5]">
            {data.card_1_cta?.text ?? "Explore All Courses"}
            <span className="grid size-9 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-1">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </Tile>

        <Tile i={3} className="group hidden bg-[#06180b] md:col-span-2 md:block">
          <Photo url={data.img_2?.url} />
        </Tile>

        <Tile i={4} className="flex flex-col justify-between gap-10 bg-[#1ee9b5] p-8 text-[#06180b] md:col-span-7 md:p-12">
          <span className="self-start rounded-full bg-[#06180b] px-3.5 py-1.5 text-[13px] text-[#1ee9b5]">{data.card_2_eyebrow}</span>
          <div>
            <h3 className="m-0 max-w-[18ch] font-title text-[clamp(30px,3.4vw,54px)] leading-[1.02] tracking-[-0.035em]">{data.card_2_title}</h3>
            <p className="m-0 mt-4 text-lg text-[#06180b]/70">{data.card_2_subtitle}</p>
          </div>
        </Tile>

        <Tile i={5} className="group aspect-[16/10] bg-[#06180b] md:col-span-5 md:aspect-auto">
          <Photo url={data.img_3?.url} />
        </Tile>
      </div>
    </section>
  );
}
