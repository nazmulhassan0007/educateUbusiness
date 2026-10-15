"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Glows } from "../concepts/shared";
import Reveal from "./Reveal";
import { EASE, type HomeCms } from "./types";

// The CMS video is 11.5 MB; this is the same clip re-encoded at 0.6 MB.
// Used only while the CMS still points at that clip, so a new upload shows as-is.
const CMS_WHY_VIDEO = "woman-video-conferencing-and-taking-notes-in-cafe";
const LOCAL_WHY_VIDEO = { src: "/aw/why.mp4", poster: "/aw/why-poster.jpg" };

/** The CMS reasons as three large numbered rows beside the section's video, which stays in view. */
export default function Why({ data }: { data?: HomeCms["why"] }) {
  const cards = data?.cards ?? [];
  if (!cards.length) return null;
  const local = data?.video?.includes(CMS_WHY_VIDEO);
  const video = local ? LOCAL_WHY_VIDEO.src : data?.video;
  const poster = local ? LOCAL_WHY_VIDEO.poster : data?.image?.url;

  return (
    <section className="relative overflow-hidden bg-[#06180b] px-5 py-24 text-white md:px-10 md:py-36" aria-labelledby="aw-why-title">
      <Glows
        spots={[
          { at: "left:-15% top:30%", size: "50vw", color: "rgb(12 93 72 / 0.6)" },
          { at: "right:-10% bottom:0%", size: "40vw", color: "rgb(30 233 181 / 0.18)" },
        ]}
      />
      <div className="relative mx-auto max-w-[1440px]">
        <Reveal className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="aw-why-title" className="m-0 font-title text-[clamp(40px,6vw,104px)] leading-[0.92] tracking-[-0.045em]">
            {data?.title}
          </h2>
          <div className="lg:justify-self-end">
            <p className="m-0 max-w-[44ch] text-lg leading-relaxed text-white/65">{data?.description}</p>
            {data?.cta && (
              <Link href={data.cta.url} className="mt-6 inline-flex items-center gap-2 text-[15px] text-[#1ee9b5] underline-offset-8 hover:underline">
                {data.cta.text}
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-[34px] p-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] sm:aspect-[4/5] bg-[#0c5d48] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] lg:aspect-[4/4.6]">
              {video ? (
                <video
                  src={video}
                  poster={poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                data?.image?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )
              )}
            </div>
            </div>
          </div>

          <ol className="m-0 grid list-none gap-3 p-0">
            {cards.map((c, i) => (
              <motion.li
                key={c.title}
                className="glass group rounded-[28px] p-7 md:p-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <div className="flex items-start gap-6 md:gap-10">
                  <span className="font-title text-[clamp(48px,6vw,96px)] leading-[0.8] tracking-[-0.05em] text-[#1ee9b5]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <h3 className="m-0 font-title text-[clamp(24px,2.4vw,38px)] leading-tight tracking-[-0.02em]">{c.title}</h3>
                    <p className="m-0 mt-4 max-w-[46ch] text-base leading-relaxed text-white/65 md:text-lg">{c.description}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
