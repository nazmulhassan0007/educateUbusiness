"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion-budget";

gsap.registerPlugin(SplitText);

type SplitType = "chars" | "words" | "lines";

// `start="top 85%"` mirrors GSAP ScrollTrigger's own shorthand: fires once
// the trigger element's top edge reaches 85% of the way down the viewport
// (i.e. as soon as it's barely visible above the bottom edge). Approximated
// here as an IntersectionObserver `rootMargin` that shrinks the viewport
// down to just its bottom (100 - percent)% band, so "intersecting" means
// "has entered that band from below."
function startToRootMargin(start: string): string {
  const match = start.match(/(\d+(?:\.\d+)?)\s*%/);
  const percent = match ? Number(match[1]) : 85;
  return `-${percent}% 0px 0px 0px`;
}

export default function SplitTextReveal({
  children,
  as = "div",
  className = "",
  splitType = "lines",
  duration = 0.7,
  stagger = 0.15,
  delay = 0,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  splitType?: SplitType;
  duration?: number;
  stagger?: number;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let split: SplitText | undefined;
    let ctx: gsap.Context | undefined;
    let observer: IntersectionObserver | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let played = false;
    let lastWidth = window.innerWidth;

    // `SplitText.create()` measures the element's CURRENT rendered layout
    // to decide where lines/words/chars break, and bakes that into masking
    // wrapper spans sized off that one measurement. A later viewport-width
    // change (rotating the device, or a devtools/responsive-mode resize)
    // reflows the text into a different number of lines without ever
    // re-measuring, so the stale mask wrappers can end up too short for
    // the new line count and clip the text to invisible. `rebuild` tears
    // down and re-runs the split/tween setup from scratch so the mask
    // always matches the layout that's actually on screen; it re-enters at
    // its already-revealed resting state if the reveal had already played,
    // rather than flashing hidden again.
    function rebuild() {
      if (!el) return;
      observer?.disconnect();
      ctx?.revert();
      split?.revert();

      split = SplitText.create(el, {
        type: splitType,
        mask: splitType,
      });

      ctx = gsap.context(() => {
        const targets = split![splitType];

        if (played) {
          gsap.set(targets, { yPercent: 0, opacity: 1 });
          return;
        }

        gsap.set(targets, { yPercent: 110, opacity: 0 });

        // Deliberately not GSAP ScrollTrigger here: its `start`/`end` are
        // absolute scroll-position math that has to agree with Lenis's own
        // scroll accounting (see SmoothScroll.tsx) — accounting that's
        // itself async and debounced, especially right after a reload at a
        // non-zero scroll position, before images/fonts have settled the
        // page's real height. A `once: true` trigger created (this effect
        // waits on `document.fonts.ready`, an unpredictable delay) against
        // a since-shifted scroll position can miss its only chance to fire,
        // leaving the text permanently hidden. IntersectionObserver doesn't
        // care what moved the scroll position or when — it only reports
        // whether the element is actually on screen, and always reports
        // its current state immediately on `observe()`, so an element
        // that's already visible (or already scrolled fully past) resolves
        // correctly right away instead of waiting on a "crossing" that may
        // never come.
        const tween = gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power3.out",
          paused: true,
          onComplete: () => {
            played = true;
          },
        });

        // Above-the-fold content (e.g. the page banner's own title) can
        // already be sitting inside the viewport the moment this runs —
        // it was never "scrolled to," it was just there on load. The
        // narrow bottom-band observer below only fires for an element
        // entering *from below*, so something already visible (or already
        // scrolled past entirely) would never trigger it: it can only ever
        // move further away, not back down into that band. Anything
        // already overlapping the real viewport at all gets played right
        // away instead of being handed to that observer.
        if (el.getBoundingClientRect().top < window.innerHeight) {
          tween.play();
          return;
        }

        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              tween.play();
              observer?.disconnect();
            }
          },
          { threshold: 0, rootMargin: startToRootMargin(start) },
        );
        observer.observe(el);
      }, el);
    }

    function handleResize() {
      // Mobile browsers fire `resize` on address-bar show/hide too, which
      // changes height but not width — irrelevant to how text wraps, so
      // only a width change is worth tearing down and re-splitting for.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 200);
    }

    document.fonts.ready.then(() => {
      if (cancelled || !el) return;
      rebuild();
      window.addEventListener("resize", handleResize);
    });

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
      ctx?.revert();
      split?.revert();
    };
  }, [splitType, duration, stagger, delay, start]);

  const Tag = as;

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
