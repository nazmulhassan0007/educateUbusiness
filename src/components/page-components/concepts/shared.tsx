"use client";

import { useEffect, useRef, useState } from "react";
import { useCartHydrated, useCartStore } from "@/store/cart-store";
import type { HomeCourse } from "../awwwards/types";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const HERO_VIDEO = "/aw/hero.mp4";
export const HERO_POSTER = "/aw/hero-poster.jpg";

// The cart persists what it's given, so it gets the plain course, not the page's extras.
export function toCartCourse(c: HomeCourse) {
  const course = { ...c };
  delete course.detail;
  return course;
}

export function useCartCount() {
  const hydrated = useCartHydrated();
  const count = useCartStore((s) => s.items.length);
  return hydrated ? count : 0;
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="m2 5.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Soft colour behind a band, so the glass on top has something to frost.
 * Each glow drifts slowly; reduced motion holds them still.
 */
export function Glows({ spots, className = "" }: { spots: { at: string; size: string; color: string; delay?: number }[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {spots.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full blur-[110px] motion-safe:animate-[glow-drift_22s_ease-in-out_infinite]"
          style={{ ...Object.fromEntries(s.at.split(" ").map((p) => p.split(":"))), width: s.size, height: s.size, background: s.color, animationDelay: `${s.delay ?? i * -6}s` }}
        />
      ))}
    </div>
  );
}

/**
 * Draws a composed object (a certificate, a receipt) at its design size and
 * scales it down to fit a narrower column, never up.
 */
export function ScaledStage({ width, height, className = "", children }: { width: number; height: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={`relative w-full ${className}`} style={{ maxWidth: width, height: height * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
