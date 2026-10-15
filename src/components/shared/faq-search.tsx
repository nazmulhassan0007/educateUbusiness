"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";

const ENTITIES: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', ndash: "-", mdash: "-", pound: "£" };

/** Lower-case text with tags stripped and entities decoded, curly quotes made straight, so "don't" finds "don&rsquo;t". */
const normalise = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();

/** True when every word of the query appears in the question or its answer (answers may be HTML). */
export function matchesFaq(query: string, question: string, answer: string) {
  const words = normalise(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const text = normalise(`${question} ${answer}`);
  return words.every((w) => text.includes(w));
}

// Example searches for the placeholder, most useful first. Only one that matches
// the section's own questions or answers is shown, so the hint always finds something.
const HINTS = ["certificate", "enrol", "payment", "refund", "access", "price", "support", "course"];

/** The first example search that this FAQ list can actually answer. */
export function faqHint(faqs: { question: string; answer: string }[]) {
  const text = normalise(faqs.map((f) => `${f.question} ${f.answer}`).join(" "));
  return HINTS.find((h) => text.includes(h));
}

/** The search box above an FAQ list. */
export function FaqSearch({ value, onChange, hint, className = "" }: { value: string; onChange: (v: string) => void; hint?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-[#06180b]/45" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Short enough to fit a 320px phone without being cut off; the right
        // padding only makes room for the clear button once there's text to clear.
        placeholder={hint ? `Search FAQs, e.g. ${hint}` : "Search FAQs"}
        aria-label="Search frequently asked questions"
        className={`h-14 w-full rounded-full border border-[#06180b]/10 bg-white pl-12 ${value ? "pr-12" : "pr-5"} type-body text-[#06180b] shadow-[0_10px_30px_-18px_rgb(6_24_11/0.35)] outline-none transition-[border-color,box-shadow] placeholder:text-[#06180b]/40 focus:border-[#0c7a5e] focus:shadow-[0_0_0_3px_rgb(30_233_181/0.25)] [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#06180b]/50 transition-colors hover:bg-[#06180b]/[0.06] hover:text-[#06180b]"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Once, under an FAQ list: where to go when the answers didn't help. */
export function FaqHelpful({ contactHref = "/contact-us", className = "" }: { contactHref?: string; className?: string }) {
  return (
    <p className={`m-0 type-small text-[#06180b]/60 ${className}`}>
      Didn&apos;t find your answer?{" "}
      <Link href={contactHref} className="font-medium text-[#0c7a5e] underline underline-offset-2 hover:text-[#06180b]">
        Contact us
      </Link>
      .
    </p>
  );
}

const EMAIL = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/;

/** Plain-text answer with any email address in it made a mailto link. */
export function FaqAnswerText({ text }: { text: string }) {
  return text.split(EMAIL).map((part, i) =>
    i % 2 ? (
      <a key={i} href={`mailto:${part}`} className="font-medium text-[#0c7a5e] underline underline-offset-2 hover:text-[#06180b]">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

/** Shown in place of the list when nothing matches. */
export function FaqNoResults({ query, contactHref = "/contact-us" }: { query: string; contactHref?: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#06180b]/15 px-6 py-10 text-center">
      <p className="m-0 type-h4 font-medium text-[#06180b]">No questions match “{query.trim()}”.</p>
      {/* `text-center!`: the FAQ sections are `ragged`, which would otherwise pull this body line back to the left. */}
      <p className="m-0 mt-2 type-body text-center! text-[#06180b]/60">
        Try another word, or{" "}
        <Link href={contactHref} className="font-medium text-[#0c7a5e] underline underline-offset-2 hover:text-[#06180b]">
          contact us
        </Link>{" "}
        and we&apos;ll help.
      </p>
    </div>
  );
}
