"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The Certificate Checker's header: the question, the line under it, and the
 * lookup itself (`children`) as the hero's one control.
 *
 * Only the words animate. The form is passed through untouched so it renders
 * visible in the server HTML: it is a plain GET form that has to work with no
 * JavaScript, and a motion `initial` state would ship it at opacity 0.
 */
export default function CertificateHero({ checked, children }: { checked: boolean; children: React.ReactNode }) {
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
  const lines = ["Is this certificate", "genuine?"];

  return (
    <section
      aria-labelledby="checker-title"
      className={`ragged relative overflow-hidden bg-[#04140a] px-5 pt-[calc(var(--home-nav-h)+48px)] text-[#f2efe6] md:px-10 print:hidden lg:pt-[calc(var(--home-nav-h)+96px)] ${
        checked ? "pb-16 lg:pb-20" : "pb-20 lg:pb-[120px]"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_85%_20%,#0e3d24_0%,rgb(9_42_24/0.55)_40%,transparent_75%),linear-gradient(180deg,#06200f_0%,#04140a_100%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[-25%] size-[860px] rounded-full bg-[#1ee9b5]/[0.05] blur-[120px] motion-safe:animate-[glow-drift_20s_ease-in-out_infinite]"
      />

      <div className="relative mx-auto max-w-site">
        <motion.div {...group} className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
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
                  Certificate Checker
                </li>
              </ol>
            </motion.nav>
            <h1 id="checker-title" className="m-0 mt-7 font-title type-display font-normal tracking-[-0.04em] lg:mt-[30px]">
              {lines.map((l, i) => (
                <span key={l} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                  <motion.span className={`block ${i === lines.length - 1 ? "text-[#1ee9b5]" : ""}`} variants={line} custom={0.1 + i * 0.1}>
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>
          <motion.p
            variants={fade}
            custom={0.35}
            className="m-0 max-w-[440px] type-lead text-white/80 lg:mb-2"
          >
            Every educateU certificate carries a verification code. Enter it to confirm the certificate is real and to see the soft copy.
          </motion.p>
        </motion.div>

        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </section>
  );
}
