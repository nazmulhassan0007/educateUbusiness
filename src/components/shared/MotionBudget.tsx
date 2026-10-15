"use client";

import { useEffect } from "react";
import {
  getMotionBudget,
  watchMotionBudget,
  type MotionBudget,
} from "@/lib/motion-budget";

/** How long after the last scroll event decorative loops are allowed back. */
const SCROLL_SETTLE_MS = 160;

/** Publishes the client motion budget on `<html data-motion>` for CSS fallbacks. */
export default function MotionBudget() {
  useEffect(() => {
    const apply = (budget: MotionBudget) => {
      document.documentElement.dataset.motion = budget;
    };
    apply(getMotionBudget());
    return watchMotionBudget(apply);
  }, []);

  // Publishes "the page is moving right now" on `<html data-scrolling>` so
  // CSS can freeze decorative loops for the duration (see globals.css).
  //
  // The animated gradient blobs are the one thing on the page that keeps a
  // layer dirty when nothing else is happening: each `.gradients-container`
  // carries a `filter: blur()`, so a child moving inside it forces that
  // whole card-sized surface to be re-rastered and re-blurred every frame —
  // and the frosted `backdrop-filter` layer stacked above it (WhyChooseUs's
  // cards) then has to re-sample the result, a second full-size blur, also
  // every frame. Standing still that is invisible. During a scroll it is
  // competing for the same frames as the scroll itself, and with three of
  // those cards owning the fold at once the dropped frames read as the
  // section juddering / jumping instead of tracking the wheel.
  //
  // Frozen, both surfaces are static, so scrolling past them is pure
  // compositing. `animation-play-state` resumes from where it paused rather
  // than restarting, and the loops are 20-40s long, so the freeze isn't
  // visible in the moment the page is moving.
  //
  // Deliberately a plain passive `scroll` listener rather than a Lenis hook:
  // this has to work on the native-scroll path too (SmoothScroll skips Lenis
  // entirely on reduced-motion / low-power clients). The attribute is
  // written exactly twice per scroll gesture — once at the start, once when
  // it settles — not on every event, so it doesn't invalidate style itself.
  useEffect(() => {
    const root = document.documentElement;
    let scrolling = false;
    let settleTimer = 0;

    const settle = () => {
      scrolling = false;
      root.removeAttribute("data-scrolling");
    };

    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        root.setAttribute("data-scrolling", "");
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SCROLL_SETTLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
      settle();
    };
  }, []);

  return null;
}
