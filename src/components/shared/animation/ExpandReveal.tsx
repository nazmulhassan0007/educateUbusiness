"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion-budget";

gsap.registerPlugin(ScrollTrigger);

export default function ExpandReveal({
  children,
  as = "div",
  className = "",
  scaleFrom = 0.6,
  duration = 0.6,
  delay = 0,
  start = "top 85%",
  ease = "back.out(1.7)",
  disableOnMobile = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  scaleFrom?: number;
  duration?: number;
  delay?: number;
  start?: string;
  ease?: string;
  disableOnMobile?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    if (disableOnMobile && window.innerWidth < 1024) {
      gsap.set(el, { clearProps: "transform,opacity" });
      return;
    }

    // Stale ScrollTrigger cleanup: Fast Refresh can re-run this effect
    // without the DOM node remounting, leaving a leftover trigger pinned
    // to the same element from a previous save.
    ScrollTrigger.getAll()
      .filter((trigger) => trigger.trigger === el)
      .forEach((trigger) => trigger.kill());

    const ctx = gsap.context(() => {
      gsap.set(el, { scale: scaleFrom, opacity: 0 });
      gsap.to(el, {
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease,
        // Drop the inline transform once settled — a lingering transform
        // would otherwise become the containing block for any
        // `position: fixed` descendant, silently breaking it.
        clearProps: "transform",
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [scaleFrom, duration, delay, start, ease, disableOnMobile]);

  const Tag = as;

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
