"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type StillStuckContent = { cards?: { title?: string; text?: string; description?: string }[] };

const icon = (d: ReactNode) => (
  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

/**
 * Still stuck? Talk to us.: a photo of the team, the support email large with
 * a copy button, then phone, response time and hours as ruled rows.
 *
 * Motion: the photo opens from the bottom and drifts with the scroll; the
 * title rises; the rows' rules draw across before each row arrives; Copy
 * turns to a tick when the address is copied.
 */
export default function StillStuck({ data }: { data?: StillStuckContent }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const zoom = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const [copied, setCopied] = useState(false);

  const card = (re: RegExp) => data?.cards?.find((c) => re.test(c.title ?? ""));
  const email = card(/email/i)?.text?.trim() || "support@educateu.com";
  const phone = card(/phone/i)?.text?.trim() || "+44 204 613 9443";
  const rows = [
    { label: "Phone", value: phone, note: card(/phone/i)?.description?.trim() || "Prefer to talk it through? Call our team directly.", href: `tel:${phone.replace(/[^\d+]/g, "")}`, icon: icon(<path d="M4 3h3l1.5 4-2 1.2a9 9 0 0 0 5.3 5.3l1.2-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C9 17 3 11 2.5 4.6A1.5 1.5 0 0 1 4 3Z" />) },
    { label: "Response time", value: "Within 1 business day", note: card(/response/i)?.description?.trim() || "Real replies from our UK team, not an autoresponder.", icon: icon(<><circle cx="10" cy="10" r="7" /><path d="M10 6.5V10l2.2 1.4" /></>) },
    { label: "Availability", value: "Mon – Fri, 9:00 am – 5:00 pm GMT", note: card(/availab/i)?.description?.trim() || "Closed on UK public holidays; email anytime and we’ll reply the next working day.", icon: icon(<><rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 2.5v3M13 2.5v3" /></>) },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-15%" } };
  const fade: Variants = { hide: { opacity: 0, y: 24 }, show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.85, delay: d, ease: EASE } }) };
  const draw: Variants = { hide: { scaleX: 0 }, show: (d: number) => ({ scaleX: 1, transition: { duration: 0.9, delay: d, ease: EASE } }) };

  return (
    <section ref={ref} aria-labelledby="stuck-title" className="ragged overflow-hidden bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:py-[130px]">
      <motion.div {...group} className="mx-auto grid max-w-site items-center gap-12 lg:grid-cols-[minmax(0,583px)_minmax(0,1fr)] lg:gap-[67px]">
        <motion.div
          className="relative aspect-square overflow-hidden rounded-[20px] bg-[#06180b]/10"
          variants={{ hide: { clipPath: "inset(100% 0 0 0 round 20px)" }, show: { clipPath: "inset(0% 0 0 0 round 20px)", transition: { duration: 1.3, ease: EASE } } }}
        >
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: zoom }}>
            <Image src="/about-us/photo-who-we-are.jpeg" alt="Colleagues laughing together over a laptop" fill sizes="(min-width:1024px) 583px, 100vw" className="object-cover object-[38%_50%]" />
          </motion.div>
        </motion.div>

        <div className="min-w-0">
          <h2 id="stuck-title" className="m-0 font-title type-h2 font-normal tracking-[-0.05em]">
            {["Still stuck?", "Talk to us."].map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.12em] align-top">
                <motion.span className="inline-block" variants={{ hide: { y: "105%" }, show: { y: "0%", transition: { duration: 0.9, delay: i * 0.1, ease: EASE } } }}>
                  {w}
                  {" "}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p variants={fade} custom={0.2} className="m-0 mt-6 max-w-[620px] type-lead text-[#06180b]/75">
            Our UK-based team is here on weekdays. Best for detailed questions, attach screenshots if you’re reporting a technical issue.
          </motion.p>

          <motion.div variants={fade} custom={0.3} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={`mailto:${email}`} className="whitespace-nowrap font-title text-[clamp(26px,7.4vw,52px)] leading-none tracking-[-0.045em] transition-colors hover:text-[#0c7a5e]">
              {email}
            </a>
            <button
              type="button"
              onClick={copy}
              aria-live="polite"
              className={`inline-flex h-[46px] items-center gap-2 rounded-full px-[18px] type-button font-semibold transition-colors duration-300 ${copied ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#06180b] text-white hover:bg-[#0c3a28]"}`}
            >
              <motion.span key={String(copied)} initial={reduce ? false : { scale: 0.4, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 16 }} className={copied ? "" : "text-[#1ee9b5]"}>
                {copied ? (
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="m2.5 7.5 3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.5" /><path d="M9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6" /></svg>
                )}
              </motion.span>
              {copied ? "Copied" : "Copy"}
            </button>
          </motion.div>

          <dl className="m-0 mt-8">
            {rows.map((r, i) => (
              <div key={r.label} className="group relative flex items-center gap-[21px] py-[22px]">
                <motion.span aria-hidden="true" variants={draw} custom={0.4 + i * 0.15} className="absolute inset-x-0 top-0 h-px origin-left bg-[#06180b]/12" />
                {i === rows.length - 1 && <motion.span aria-hidden="true" variants={draw} custom={0.4 + (i + 1) * 0.15} className="absolute inset-x-0 bottom-0 h-px origin-left bg-[#06180b]/12" />}
                <motion.span variants={fade} custom={0.5 + i * 0.15} className="grid size-[50px] shrink-0 place-items-center rounded-[11px] bg-[#06180b] text-[#1ee9b5] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-105">
                  {r.icon}
                </motion.span>
                <motion.div variants={fade} custom={0.55 + i * 0.15} className="min-w-0">
                  <dt className="type-small text-[#06180b]/65">{r.label}</dt>
                  <dd className="m-0 mt-0.5 font-title type-h4 tracking-[-0.035em]">
                    {r.href ? (
                      <a href={r.href} className="transition-colors hover:text-[#0c7a5e]">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                  <dd className="m-0 mt-1 max-w-[560px] type-small text-[#06180b]/70">{r.note}</dd>
                </motion.div>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </section>
  );
}
