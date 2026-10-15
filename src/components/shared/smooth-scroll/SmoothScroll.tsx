"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import LocomotiveScroll from "locomotive-scroll";
import type {
  ILenisScrollToOptions,
  lenisTargetScrollTo,
} from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { allowHeavyMotion } from "@/lib/motion-budget";

gsap.registerPlugin(ScrollTrigger);

// Programmatic scrolling anywhere in the app (e.g. "jump to this section")
// has to go through Lenis's own `scrollTo`, not a plain
// `element.scrollIntoView()`: Lenis's render loop runs continuously (see the
// `autoSleep: 0` config below) and repositions the real scrollTop every
// frame to match its *own* internally tracked target, so a native scroll
// call that Lenis doesn't know about gets fought — and usually loses —
// within a frame or two, especially once the page is already mid-scroll.
// Routing through this context keeps Lenis's target in sync instead.
type ScrollToFn = (
  target: lenisTargetScrollTo,
  options?: ILenisScrollToOptions,
) => void;

const SmoothScrollContext = createContext<ScrollToFn | null>(null);

function nativeScrollTo(
  target: lenisTargetScrollTo,
  options?: ILenisScrollToOptions,
) {
  const behavior = options?.immediate ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior });
    return;
  }
  if (target && typeof target === "object" && "scrollIntoView" in target) {
    (target as Element).scrollIntoView({ behavior });
  }
}

export function useSmoothScrollTo(): ScrollToFn {
  const scrollTo = useContext(SmoothScrollContext);
  return scrollTo ?? (() => {});
}

/**
 * Wraps the app in Lenis-powered smooth scrolling (via locomotive-scroll v5).
 *
 * Because this site drives pinned/scrubbed sections with GSAP ScrollTrigger
 * (see HeroMediaReveal, EverythingYouNeed, WhyChooseUs, Reviews), the Lenis
 * scroll loop is bridged to ScrollTrigger two ways:
 *  - `scrollCallback` runs `ScrollTrigger.update()` on every Lenis scroll
 *    event, so pinned timelines see the eased position immediately.
 *  - `initCustomTicker`/`destroyCustomTicker` hand Lenis's own render loop
 *    over to `gsap.ticker`, instead of letting locomotive-scroll run its own
 *    independent `requestAnimationFrame` loop alongside GSAP's. Two
 *    unsynchronized rAF loops — one easing Lenis's scroll position, one
 *    driving every GSAP tween/ScrollTrigger update — can drift a frame or
 *    more out of sync with each other over time; pinned/scrubbed sections
 *    are sensitive enough to that drift that it shows up as the pin getting
 *    visibly stuck, and since the desync lives in GSAP's own internal
 *    state rather than resetting itself, only a full reload (which rebuilds
 *    both loops from scratch) clears it.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const scrollTo = useCallback<ScrollToFn>((target, options) => {
    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.scrollTo(target, options);
      return;
    }
    nativeScrollTo(target, options);
  }, []);

  useEffect(() => {
    // Native scroll is far cheaper on low-power / reduced-motion clients:
    // Lenis intercepts the wheel and re-applies it in JS every frame.
    if (!allowHeavyMotion()) return;

    let render: (() => void) | undefined;

    const locomotiveScroll = new LocomotiveScroll({
      // `duration` is deliberately omitted: passing a numeric `duration`
      // without an explicit `easing` makes Lenis auto-assign its own
      // default easing function, and once both are set, Lenis's internal
      // Animate class runs a full duration-based ease-out for every wheel
      // tick instead of the continuous `lerp` damping below — `lerp` is
      // silently ignored in that case. That produced a long (1.5s) settle
      // tail after every scroll input, most noticeable at a hard boundary
      // (e.g. the very bottom): reversing direction while that tail was
      // still resolving toward the old target made scrolling feel stuck
      // for a beat. `duration`/`easing` are meant for discrete
      // `scrollTo()` calls, not continuous wheel/touch smoothing.
      lenisOptions: {
        // 0.05 is half of Lenis's own default (0.1) — that slower
        // convergence is most noticeable right at a hard scroll boundary
        // (e.g. the very bottom): reversing direction still has to "catch
        // up" the outstanding ease from the old target first, which reads
        // as the page getting stuck for a beat before it responds.
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      },
      scrollCallback: () => ScrollTrigger.update(),
      initCustomTicker: (onRender) => {
        render = onRender;
        gsap.ticker.add(render);
      },
      destroyCustomTicker: () => {
        if (render) gsap.ticker.remove(render);
      },
    });
    locomotiveScrollRef.current = locomotiveScroll;

    // Lenis's own understanding of "how far can I scroll" (its `limit`,
    // derived from the document's scrollHeight) is recalculated via a
    // ResizeObserver on `document.documentElement` — but that's debounced
    // 250ms internally by Lenis itself (not something exposed via options).
    // GSAP's pin-spacers change the document's real height every time
    // ScrollTrigger refreshes; for up to 250ms after that, Lenis can be
    // clamping scroll against a now-stale boundary, which is exactly the
    // kind of mismatch that shows up as the page getting stuck right at an
    // edge (like the very bottom). `lenisInstance.resize()` recalculates
    // immediately, bypassing that debounce, so hook it into every GSAP
    // refresh — both our own manual ones and any automatic ones GSAP fires
    // itself (e.g. on window resize).
    const resyncLenisDimensions = () => {
      locomotiveScrollRef.current?.lenisInstance?.resize();
    };
    ScrollTrigger.addEventListener("refresh", resyncLenisDimensions);

    // Lenis already eases scroll input itself; GSAP's own lag-compensation
    // would double up on that easing and can show up as a stutter/skip.
    gsap.ticker.lagSmoothing(0);

    // GSAP's ticker auto-sleeps (stops its rAF loop entirely) after ~2s with
    // no active tween AND fewer than 2 listeners registered on it — and
    // Lenis's render loop above is the only listener we add. Whenever the
    // user scrolls idly (no ScrollTrigger scrub actively tweening), the
    // ticker goes to sleep and Lenis's render() stops being called, so mouse
    // wheel input (which Lenis intercepts) silently stops moving the page —
    // while dragging the native scrollbar still works, since that sets
    // scroll position directly rather than through Lenis. Disabling autoSleep
    // keeps the ticker (and so Lenis) running continuously.
    gsap.config({ autoSleep: 0 });

    // Recalculate trigger start/end positions now that smooth scroll is active.
    ScrollTrigger.refresh();

    // Custom fonts aren't render-blocking, so they can keep swapping in well
    // after `load` fires — reflowing any section's height after pinned
    // triggers already measured their start/end. `window.load` (used by
    // individual pinned sections as a fallback) can fire before that swap
    // completes, so this is the more reliable signal: refresh once more the
    // moment fonts actually settle, globally, for every pinned section.
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();

      // Reloading mid-page (not at the top) is the case this second refresh
      // exists for: Lenis's own scroll `limit` — and so the actual scroll
      // position it settles on — depends on the ResizeObserver above, which
      // is debounced ~250ms internally by Lenis itself. If that settling
      // finishes AFTER this refresh (very plausible right after a hard
      // reload, before images below the fold have contributed their real
      // height), every `once: true` ScrollTrigger created against this
      // refresh's snapshot is measured against a scroll position that's
      // about to shift — including ones whose `start` the *pre-shift*
      // position had already been scrolled past, which then never get a
      // live crossing to fire on once the shift lands them back below it.
      // Refreshing again once that debounce window has definitely closed
      // catches any such drift.
      window.setTimeout(() => ScrollTrigger.refresh(), 300);
    });

    return () => {
      ScrollTrigger.removeEventListener("refresh", resyncLenisDimensions);
      locomotiveScroll.destroy();
      locomotiveScrollRef.current = null;
    };
  }, []);

  // Reset scroll to the top on every client-side route change. Lenis tracks
  // scroll position itself rather than relying on the browser's native
  // value, so without this a navigation to a new page keeps rendering
  // wherever the PREVIOUS page had scrolled to instead of starting fresh.
  // Skips the very first run so it doesn't fight an initial `#hash` deep
  // link on first load.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={scrollTo}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
