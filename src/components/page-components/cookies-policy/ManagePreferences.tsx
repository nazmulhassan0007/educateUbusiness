"use client";

import { motion, useReducedMotion } from "motion/react";
import { Arrow } from "@/components/page-components/concepts/shared";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import { CONSOLE_ID } from "./CookiesHero";

export type ManagePreferencesContent = {
  title: string;
  description: string;
  button_label: string;
};

const DEFAULT_CONTENT: ManagePreferencesContent = {
  title: "Manage Your Cookie Preferences",
  description: "You can review and change your cookie preferences at any time",
  button_label: "Manage Cookies Settings",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The closing band: the CMS's "manage your preferences" line, and a button
 * that takes the reader back up to the settings console in the header.
 */
export default function ManagePreferences({
  data,
}: {
  data?: Partial<ManagePreferencesContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const scrollTo = useSmoothScrollTo();
  const reduce = useReducedMotion();

  const open = () => {
    scrollTo(`#${CONSOLE_ID}`, {
      offset: -((parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--home-nav-h")) || 84) + 32),
      immediate: !!reduce,
    });
    // A pulse on arrival, so the eye lands on the console.
    const el = document.getElementById(CONSOLE_ID);
    el?.animate(
      [{ boxShadow: "0 0 0 0 rgb(30 233 181 / 0.6)" }, { boxShadow: "0 0 0 18px rgb(30 233 181 / 0)" }],
      { duration: 1100, delay: reduce ? 0 : 700, easing: "ease-out" },
    );
  };

  return (
    <section className="ragged relative overflow-hidden bg-[#06180b] px-5 py-20 text-[#f2efe6] md:px-10 lg:py-28">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_90%_at_85%_50%,rgb(30_233_181/0.14),transparent_70%)]"
      />
      <motion.div
        className="relative mx-auto flex max-w-site flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
        initial={reduce ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="min-w-0">
          <h2 className="m-0 max-w-[16ch] font-title type-h2 font-normal tracking-[-0.03em]">{content.title}</h2>
          <p className="m-0 mt-5 max-w-[520px] type-lead text-white/75">{content.description.trim().replace(/([^.!?])$/, "$1.")}</p>
        </div>
        <button
          type="button"
          onClick={open}
          className="group flex shrink-0 items-center gap-3 self-start rounded-full bg-[#1ee9b5] py-2 pl-6 pr-2 type-button font-medium text-[#06180b] transition-[background-color,transform] duration-300 hover:bg-[#5ef0c9] active:scale-[0.98] lg:self-auto"
        >
          {content.button_label}
          <span className="grid size-10 place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform duration-300 group-hover:-rotate-90">
            <Arrow />
          </span>
        </button>
      </motion.div>
    </section>
  );
}
