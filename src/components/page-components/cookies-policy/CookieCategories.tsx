"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import { keyForCategory, useCookiePrefs } from "./useCookiePrefs";

export type CookieItem = {
  name: string;
  description: string;
};

export type CookieCategory = {
  title: string;
  description: string;
  items: CookieItem[];
};

export type CookieCategoriesContent = {
  categories: CookieCategory[];
};

const DEFAULT_CONTENT: CookieCategoriesContent = {
  categories: [
    {
      title: "Essential Cookies",
      description:
        "Critical for the website to function effectively. They enable basic functionality such as page navigation, secure areas access, and protection against fraudulent traffic. These cookies cannot be disabled.",
      items: [
        {
          name: "Cloudflare:",
          description:
            "Used to enhance website security and performance, identify trusted web traffic and protect against malicious users.",
        },
      ],
    },
    {
      title: "Functional Cookies",
      description:
        "Allow the website to remember choices you make and provide enhanced functionality and personalization. They may be used to provide services you have requested.",
      items: [
        {
          name: "Vimeo:",
          description:
            "Used to deliver video content, store user preferences, and collect usage statistics.",
        },
        {
          name: "YouTube:",
          description:
            "Used to deliver video content, store user preferences, and collect usage statistics.",
        },
      ],
    },
    {
      title: "Analytics",
      description:
        "Collect information about how visitors use our website. The data collected is aggregated and anonymised to help us improve usability and performance.",
      items: [
        {
          name: "Google Analytics:",
          description:
            "Used to deliver video content, store user preferences, and collect usage statistics.",
        },
        {
          name: "Vercel Analytics:",
          description:
            "Helps enable video playback, collect user interaction data, and deliver personalised content.",
        },
      ],
    },
    {
      title: "Marketing",
      description:
        "Used to deliver advertisements more relevant to you and your interests. They help measure the effectiveness of advertising campaigns.",
      items: [
        {
          name: "Facebook Pixel:",
          description:
            "Tracks conversions, optimises ads, and builds targeted audiences for future campaigns.",
        },
      ],
    },
  ],
};

const EASE = [0.22, 1, 0.36, 1] as const;
const MONO = "font-[family-name:var(--font-geist-mono)]";

const pad = (n: number) => String(n).padStart(2, "0");
const slug = (t: string) => `cookies-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
// The CMS writes provider names with a trailing colon ("Vimeo:").
const tidy = (name: string) => name.trim().replace(/:$/, "");

/**
 * The cookie ledger: on wide screens a sticky index of the categories on the
 * left, each with the visitor's own on/off state, and the categories
 * themselves on the right, every service that sets cookies as its own card.
 * The index follows the reader down the page; choosing one scrolls to it.
 */
export default function CookieCategories({
  data,
}: {
  data?: Partial<CookieCategoriesContent>;
}) {
  const categories = useMemo(() => ({ ...DEFAULT_CONTENT, ...data }).categories.filter((c) => c.title?.trim()), [data]);
  const prefs = useCookiePrefs();
  const scrollTo = useSmoothScrollTo();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // The category crossing the upper middle of the screen is the current one.
  useEffect(() => {
    const els = categories.map((c) => document.getElementById(slug(c.title))).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [categories]);

  const state = (title: string) => {
    const key = keyForCategory(title);
    if (key === "necessary") return { label: "Always on", on: true };
    if (!key) return null;
    const on = !!prefs?.[key];
    return { label: on ? "On for you" : "Off for you", on };
  };

  const go = (title: string) =>
    scrollTo(`#${slug(title)}`, {
      offset: -((parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84) + 24),
      immediate: !!reduce,
    });

  return (
    <section aria-label="Cookie categories" className="ragged relative bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
        {/* The index. */}
        <nav aria-label="Categories" className="hidden lg:block">
          <div className="sticky top-[calc(var(--home-nav-h)+40px)]">
            <p className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]">On this page</p>
            <ol className="m-0 mt-6 list-none border-t border-[#06180b]/12 p-0">
              {categories.map((c, i) => {
                const on = i === active;
                const st = state(c.title);
                return (
                  <li key={c.title} className="relative border-b border-[#06180b]/12">
                    {on && (
                      <motion.span
                        layoutId="cookie-index"
                        aria-hidden="true"
                        className="absolute -top-px left-0 h-0.5 w-full bg-[#0c7a5e]"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => go(c.title)}
                      aria-current={on ? "true" : undefined}
                      className="group flex w-full items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
                    >
                      <span className={`type-caption tabular-nums ${MONO} ${on ? "text-[#0c7a5e]" : "text-[#06180b]/40"}`}>{pad(i + 1)}</span>
                      <span className={`min-w-0 flex-1 type-body transition-colors ${on ? "font-medium text-[#06180b]" : "text-[#06180b]/55 group-hover:text-[#06180b]/85"}`}>
                        {c.title}
                      </span>
                      {st && (
                        <span className={`flex items-center gap-1.5 type-caption ${st.on ? "text-[#0c7a5e]" : "text-[#06180b]/45"}`}>
                          <span className={`size-1.5 rounded-full ${st.on ? "bg-[#1ee9b5]" : "bg-[#06180b]/25"}`} />
                          {st.on ? "On" : "Off"}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="m-0 mt-6 max-w-[300px] type-small text-[#06180b]/60">
              On and off show your own settings, saved in this browser.
            </p>
          </div>
        </nav>

        {/* The categories. */}
        <div className="flex min-w-0 flex-col gap-16 lg:gap-24">
          {categories.map((c, i) => {
            const st = state(c.title);
            const items = (c.items ?? []).filter((it) => it.name?.trim());
            return (
              <motion.article
                key={c.title}
                id={slug(c.title)}
                aria-labelledby={`${slug(c.title)}-title`}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[#06180b]/12 pb-6">
                  <div className="min-w-0">
                    <p aria-hidden="true" className={`m-0 type-caption text-[#0c7a5e] ${MONO}`}>
                      {pad(i + 1)} / {pad(categories.length)}
                    </p>
                    <h2 id={`${slug(c.title)}-title`} className="m-0 mt-3 font-title type-h2 font-normal tracking-[-0.03em]">
                      {c.title}
                    </h2>
                  </div>
                  {st && (
                    <span
                      className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 type-caption font-medium ${
                        st.on ? "bg-[#06180b] text-[#1ee9b5]" : "bg-[#06180b]/[0.06] text-[#06180b]/60"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${st.on ? "bg-[#1ee9b5]" : "bg-[#06180b]/30"}`} />
                      {st.label}
                    </span>
                  )}
                </div>
                <p className="m-0 mt-6 max-w-[680px] type-lead text-[#06180b]/75">{c.description}</p>

                {items.length > 0 && (
                  <ul className="m-0 mt-8 grid list-none gap-3 p-0 md:grid-cols-2">
                    {items.map((it, j) => (
                      <motion.li
                        key={it.name}
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-8%" }}
                        transition={{ duration: 0.7, delay: 0.15 + j * 0.08, ease: EASE }}
                        className="group flex gap-4 rounded-[20px] bg-[#f7f6f1] p-5 shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_0_0_1px_rgb(6_24_11/0.05),0_24px_48px_-36px_rgb(6_24_11/0.35)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#06180b] font-title text-[20px] text-[#1ee9b5] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6"
                        >
                          {tidy(it.name).charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-title type-h4 tracking-[-0.02em]">{tidy(it.name)}</span>
                          <span className="mt-1.5 block type-small text-[#06180b]/70">{it.description}</span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
