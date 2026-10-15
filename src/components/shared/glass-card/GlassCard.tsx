import type { ReactNode } from "react";
import { EdgeGradientAnimation } from "@/components/ui/edge-gradient-animation";

/**
 * Recurring card shell used across the About Us page: an animated gradient
 * background (same treatment as `CourseCard`/`BenefitCard`) behind a
 * frosted glass panel, so the animation only affects the background, never
 * the content stacked on top of it.
 */
export default function GlassCard({
  className = "",
  contentClassName = "",
  children,
  variant = "dark",
  gradientBackgroundStart = "rgb(6, 24, 11)",
  gradientBackgroundEnd = "rgb(8, 33, 15)",
}: {
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  // "light": a flat, non-animated card for light-themed sections (no
  // gradient glow, no frosted-glass blur) — the mint fill/border is a hover
  // state on every card, not a permanent highlight on any one of them.
  variant?: "dark" | "light";
  // Base of the "dark" variant's animated blob background — override per
  // section when its cards need to sit on a different dark tone than the
  // near-black default (e.g. a section whose own background is a lighter
  // green, where the default card gradient would look mismatched).
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
}) {
  if (variant === "light") {
    return (
      <div
        className={`group relative overflow-hidden rounded-[20px] border border-transparent bg-[#f9f9f9] transition-colors duration-300 hover:border-primary-700 hover:bg-primary-50 ${className}`}
      >
        <div className={`relative z-10 ${contentClassName}`}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border border-white/9 ${className}`}
    >
      <EdgeGradientAnimation
        gradientBackgroundStart={gradientBackgroundStart}
        gradientBackgroundEnd={gradientBackgroundEnd}
        blendingValue="screen"
        firstColor="30, 233, 181"
        secondColor="24, 186, 145"
        thirdColor="18, 140, 109"
        fourthColor="24, 186, 145"
        fifthColor="30, 233, 181"
        size="220px"
        spread={220}
        blurClassName="blur-lg"
        interactive={false}
        containerClassName="absolute inset-0 h-full w-full"
      />
      <div
        className="absolute inset-0 bg-[rgba(137,137,137,0.05)] backdrop-blur-[75px]"
        aria-hidden
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}
