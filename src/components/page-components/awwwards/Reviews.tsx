"use client";

import Reveal, { RiseItem } from "./Reveal";
import type { HomeCms } from "./types";

type Review = NonNullable<NonNullable<HomeCms["reviews"]>["reviews"]>[number];

const initial = (name: string) => name.trim().charAt(0).toUpperCase();

/** Whole sentences from the start of a review, up to about `max` characters, so a card never ends mid-thought. */
function excerpt(quote: string, max: number) {
  const sentences = quote.trim().match(/[^.!?]+[.!?]+["”]?\s*|[^.!?]+$/g) ?? [quote];
  let out = "";
  for (const s of sentences) {
    if (out && (out + s).trim().length > max) break;
    out += s;
  }
  out = out.trim();
  return out.length > max * 1.4 ? `${out.slice(0, out.lastIndexOf(" ", max))}…` : out;
}

/** The lead review, set large on ink. */
function Lead({ r }: { r: Review }) {
  return (
    <figure className="relative m-0 flex h-full min-h-[420px] flex-col justify-between gap-12 overflow-hidden rounded-[28px] bg-[#06180b] p-8 text-[#f2efe6] md:p-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-40px] size-[360px] rounded-full bg-[radial-gradient(closest-side,rgb(30_233_181/0.18),transparent_70%)]"
      />
      <blockquote className="relative m-0 max-w-[644px] font-title text-[clamp(26px,2.6vw,38px)] leading-[1.15] tracking-[-0.03em] [text-wrap:balance]">
        &ldquo;{excerpt(r.quote, 200)}&rdquo;
      </blockquote>
      <figcaption className="relative flex items-center gap-4">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#1ee9b5] font-title text-[20px] leading-7 text-[#06180b]">
          {initial(r.name)}
        </span>
        <span>
          <span className="block text-[16px] font-medium leading-6">{r.name}</span>
          <span className="block text-[14px] leading-5 text-[#f2efe6]/65">{r.position}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Card({ r }: { r: Review }) {
  return (
    <figure className="m-0 flex h-full flex-col justify-between gap-6 rounded-[28px] bg-[#f7f6f1] p-8">
      <blockquote className="m-0 max-w-[469px] text-[18px] leading-[29.25px] text-[#06180b]/85">&ldquo;{excerpt(r.quote, 170)}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#06180b] font-title text-[16px] leading-6 text-[#1ee9b5]">
          {initial(r.name)}
        </span>
        <span>
          <span className="block text-[15px] font-medium leading-[22.5px] text-[#06180b]">{r.name}</span>
          <span className="block text-[14px] leading-5 text-[#06180b]/65">{r.position}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Three CMS reviews, each cut to whole sentences: the first set large, the next two stacked beside it. */
export default function Reviews({ data }: { data?: HomeCms["reviews"] }) {
  const [lead, ...rest] = data?.reviews ?? [];
  if (!lead) return null;

  return (
    <section className="bg-[#f2efe6] px-5 py-24 text-[#06180b] md:px-6 md:py-32" aria-labelledby="aw-reviews-title">
      <div className="mx-auto max-w-site">
        <Reveal>
          <h2 id="aw-reviews-title" className="m-0 font-title text-[clamp(44px,5vw,72px)] font-normal leading-none tracking-[-0.03em]">
            {data?.title ?? "What our learners say"}
          </h2>
        </Reveal>
        <ul className="m-0 mt-14 grid list-none gap-6 p-0 lg:grid-cols-12 lg:grid-rows-2">
          <RiseItem className="lg:col-span-7 lg:row-span-2">
            <Lead r={lead} />
          </RiseItem>
          {rest.slice(0, 2).map((r, i) => (
            <RiseItem key={`${r.name}-${i}`} index={i + 1} className="lg:col-span-5">
              <Card r={r} />
            </RiseItem>
          ))}
        </ul>
      </div>
    </section>
  );
}
