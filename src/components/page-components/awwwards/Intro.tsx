"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { EASE } from "./types";

const KEY = "aw-intro-seen";
const EVENT = "aw:intro-done";

// Shared "has the intro finished" flag, so the hero can hold its entrance until the curtain lifts.
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const isDone = () => document.documentElement.dataset.awIntro === "done";

export function useIntroDone() {
  return useSyncExternalStore(subscribe, isDone, () => false);
}

function finish() {
  document.documentElement.dataset.awIntro = "done";
  window.dispatchEvent(new Event(EVENT));
}

/**
 * First visit per session: an ink curtain with the logo and a 0 to 100 count,
 * which wipes up to reveal the hero. Repeat visits and reduced motion skip it.
 */
export default function Intro() {
  const [show, setShow] = useState(true);
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      const id = requestAnimationFrame(() => setShow(false));
      return () => cancelAnimationFrame(id);
    }
    const a = animate(count, 100, {
      duration: 1.1,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        setShow(false);
        // Start the hero entrance as the curtain begins to lift.
        setTimeout(finish, 150);
      },
    });
    return () => a.stop();
  }, [count]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col justify-between bg-[#06180b] p-6 text-white md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          {/* Same lockup as the navbar: the mark sits high and the wordmark low. */}
          <motion.div
            className="flex h-10 items-stretch gap-2 self-start md:h-12 md:gap-2.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/navbar/logo-circle.png" alt="" className="size-[31px] self-start md:size-[37px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/navbar/logo-wordmark.png" alt="" className="h-8 w-auto self-end md:h-[38px]" />
          </motion.div>
          <div className="flex items-end justify-between gap-6">
            <p className="m-0 max-w-[22ch] type-lead text-white/60">Online courses and certification made simple for everyone</p>
            <motion.span className="font-title text-[clamp(80px,16vw,240px)] leading-[0.8] tracking-[-0.05em] text-[#1ee9b5] tabular-nums">
              {label}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
