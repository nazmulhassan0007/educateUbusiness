"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { saveCookiePreferences, type CookiePreferences } from "@/lib/cookieConsent";
import { Check } from "@/components/page-components/concepts/shared";
import { useCookiePrefs, type CookieKey } from "./useCookiePrefs";

const EASE = [0.22, 1, 0.36, 1] as const;

export const CONSOLE_ID = "cookie-console";

const ESSENTIAL_ONLY: CookiePreferences = { necessary: true, functional: false, analytics: false, marketing: false };

const ROWS: { key: CookieKey; title: string; body: string }[] = [
  { key: "necessary", title: "Essential", body: "Keeps the site secure and working" },
  { key: "functional", title: "Functional", body: "Remembers choices and plays video" },
  { key: "analytics", title: "Analytics", body: "Anonymous stats that help us improve" },
  { key: "marketing", title: "Marketing", body: "Makes our ads more relevant" },
];

/**
 * The Cookies Policy header: the headline on the left, and on the right a
 * live console of the visitor's own cookie settings. It opens on what they
 * last saved (essential only before they've chosen), and saving here is the
 * same save as the banner's, so the ledger below and the banner follow it.
 *
 * Motion: the headline rises line by line; the console lifts in and its rows
 * follow one by one; switches slide on a spring and their light glows when on.
 */
export default function CookiesHero({ title, subtitle, services }: { title: string; subtitle?: string; services: number }) {
  const reduce = useReducedMotion();
  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", animate: "show" };
  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
  };
  const line: Variants = {
    hide: { y: "105%" },
    show: (d: number) => ({ y: "0%", transition: { duration: 1, delay: d, ease: EASE } }),
  };

  return (
    <section
      aria-labelledby="cookies-title"
      className="ragged relative overflow-hidden bg-[#04140a] px-5 pb-20 pt-[calc(var(--home-nav-h)+48px)] text-[#f2efe6] md:px-10 lg:pb-[120px] lg:pt-[calc(var(--home-nav-h)+96px)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_45%,#0e3d24_0%,rgb(9_42_24/0.5)_45%,transparent_80%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[10%] size-[760px] rounded-full bg-[#1ee9b5]/[0.05] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]"
      />

      <motion.div {...group} className="relative mx-auto grid max-w-site items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <div className="min-w-0">
          <motion.nav variants={fade} custom={0} aria-label="Breadcrumb" className="type-small font-medium">
            <ol className="m-0 flex list-none items-center gap-2.5 p-0">
              <li>
                <Link href="/" className="text-white/85 transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">
                /
              </li>
              <li aria-current="page" className="text-[#1ee9b5]">
                {title}
              </li>
            </ol>
          </motion.nav>
          <h1 id="cookies-title" className="m-0 mt-7 font-title type-display font-normal tracking-[-0.05em] lg:mt-[30px]">
            <span className="sr-only">{title}: </span>
            {["Cookies, in", "plain English."].map((l, i) => (
              <span key={l} aria-hidden="true" className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <motion.span className={`block ${i === 1 ? "text-[#1ee9b5]" : ""}`} variants={line} custom={0.1 + i * 0.1}>
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p variants={fade} custom={0.35} className="m-0 mt-7 max-w-[520px] type-lead text-white/80">
            {subtitle?.trim() ||
              "What each cookie on educateU Business does, who sets it, and the switch that controls it. Your own settings are in the panel here, and you can change them any time."}
          </motion.p>
          <motion.ul variants={fade} custom={0.45} className="m-0 mt-8 flex list-none flex-wrap gap-2 p-0">
            {["4 categories", `${services} services named`, "Essential only, until you choose"].map((f) => (
              <li key={f} className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 type-caption text-white/85">
                <span className="text-[#1ee9b5]">
                  <Check size={10} />
                </span>
                {f}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div variants={fade} custom={0.5} className="min-w-0">
          <Console />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Console() {
  const reduce = useReducedMotion();
  const saved = useCookiePrefs();
  const [draft, setDraft] = useState<CookiePreferences | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const current = draft ?? saved ?? ESSENTIAL_ONLY;
  const base = saved ?? ESSENTIAL_ONLY;
  const dirty = ROWS.some((r) => current[r.key] !== base[r.key]);
  const on = ROWS.filter((r) => current[r.key]).length;

  const flip = (key: CookieKey) => {
    if (key === "necessary") return;
    setJustSaved(false);
    setDraft({ ...current, [key]: !current[key] });
  };
  const save = (prefs: CookiePreferences) => {
    saveCookiePreferences(prefs);
    setDraft(null);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  };

  const status = justSaved ? "Saved" : dirty ? "Unsaved changes" : saved ? "Your saved settings" : "Not chosen yet";

  return (
    <div
      id={CONSOLE_ID}
      className="scroll-mt-32 rounded-[28px] bg-[linear-gradient(180deg,#425c4d_0%,#243d2e_16%,#14201a_62%,#17221a_100%)] p-1.5 shadow-[-40px_40px_90px_-20px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]"
    >
      <div className="flex items-center gap-1.5 px-4 py-4">
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="size-2.5 rounded-full bg-white/20" />
        <span className="ml-1 type-caption text-white/55">Cookie settings</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            aria-live="polite"
            className={`ml-auto rounded-[5px] px-2 py-[3px] type-caption font-semibold ${
              justSaved ? "bg-[#1ee9b5] text-[#06180b]" : dirty ? "bg-[#f2c94c] text-[#06180b]" : "bg-white/10 text-white/80"
            }`}
          >
            {status}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,#405a4b_0%,#1c2a22_45%,#131b16_100%)] px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <ul className="m-0 list-none p-0">
          {ROWS.map((r, i) => {
            const active = current[r.key];
            const locked = r.key === "necessary";
            return (
              <motion.li
                key={r.key}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.75 + i * 0.08, ease: EASE }}
                className="border-b border-white/[0.08] last:border-b-0"
              >
                <div className="flex items-center gap-4 py-4">
                  <span className="relative grid size-3 shrink-0 place-items-center" aria-hidden="true">
                    <span className={`size-2 rounded-full transition-colors duration-300 ${active ? "bg-[#1ee9b5]" : "bg-white/20"}`} />
                    {active && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#1ee9b5]/40 [animation-duration:2.4s]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block type-body font-medium text-white">{r.title}</span>
                    <span className="block type-caption text-white/55">{r.body}</span>
                  </span>
                  {locked && <span className="hidden type-caption text-white/45 sm:inline">Always on</span>}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    aria-label={`${r.title} cookies`}
                    disabled={locked}
                    onClick={() => flip(r.key)}
                    className={`relative h-7 w-[50px] shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1ee9b5] ${
                      active ? "bg-[#1ee9b5]" : "bg-white/15"
                    } ${locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 520, damping: 32 }}
                      className={`absolute top-[3px] size-[22px] rounded-full bg-white shadow ${active ? "right-[3px]" : "left-[3px]"}`}
                    />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-3 flex flex-col gap-3 rounded-[14px] border border-white/10 bg-[#1c231f]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 type-caption text-white/60">
            <span className="font-[family-name:var(--font-geist-mono)] text-[#1ee9b5]">{on}</span> of {ROWS.length} on
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => save(ESSENTIAL_ONLY)}
              className="h-10 whitespace-nowrap rounded-[10px] border border-white/15 px-4 type-small font-medium text-white/85 transition-colors hover:border-white/30 hover:text-white"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => save(current)}
              disabled={!dirty && !!saved}
              className="h-10 whitespace-nowrap rounded-[10px] bg-[#1ee9b5] px-4 type-small font-semibold text-[#06180b] transition-[background-color,transform,opacity] duration-200 hover:bg-[#5ef0c9] active:scale-[0.98] disabled:cursor-default disabled:opacity-40"
            >
              Save choices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
