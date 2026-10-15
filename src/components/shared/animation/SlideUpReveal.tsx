"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion-budget";

gsap.registerPlugin(ScrollTrigger);

export default function SlideUpReveal({
  children,
  as = "div",
  className = "",
  distance = 60,
  duration = 0.8,
  delay = 0,
  start = "top 85%",
  disableOnMobile = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
  start?: string;
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
      gsap.set(el, { y: distance, opacity: 0 });
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease: "power3.out",
        // Once settled, drop the inline transform entirely rather than
        // leaving `translate(0, 0)` behind — a lingering transform turns
        // this element into the containing block for any `position: fixed`
        // descendant, which silently breaks fixed-position children elsewhere.
        clearProps: "transform",
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [distance, duration, delay, start, disableOnMobile]);

  const Tag = as;

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
