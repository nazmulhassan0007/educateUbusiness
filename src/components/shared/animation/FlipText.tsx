import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps `children` in a hover-triggered "flip" reveal: the original text
 * slides up and out while an identical copy slides up from below to take
 * its place. Add the `group` class to the nearest clickable ancestor
 * (e.g. the `Link`/`button` this sits inside) so hovering anywhere on it
 * — not just directly over the text — triggers the flip.
 */
export function FlipText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden align-top",
        className,
      )}
    >
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute left-0 top-0 block translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
