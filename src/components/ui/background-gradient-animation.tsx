"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { observeVisibility } from "@/lib/motion-budget";

type PointerState = { curX: number; curY: number; tgX: number; tgY: number };
type FrameRef = { current: number | null };

/**
 * Eases the pointer blob toward the cursor, one rAF at a time, and stops
 * itself once it has arrived. Lives at module scope (and takes the refs it
 * needs) purely so the self-scheduling call can reference it — nothing here
 * touches React state, which is the whole point: see `pointerRef` below.
 */
function easePointer(el: HTMLDivElement, pointer: PointerState, frame: FrameRef) {
  pointer.curX += (pointer.tgX - pointer.curX) / 6;
  pointer.curY += (pointer.tgY - pointer.curY) / 6;
  el.style.transform = `translate(${Math.round(pointer.curX)}px, ${Math.round(
    pointer.curY,
  )}px)`;

  if (
    Math.abs(pointer.tgX - pointer.curX) < 0.5 &&
    Math.abs(pointer.tgY - pointer.curY) < 0.5
  ) {
    frame.current = null;
    return;
  }
  frame.current = requestAnimationFrame(() => easePointer(el, pointer, frame));
}

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  spread = 400,
  blendingValue = "hard-light",
  blurClassName = "blur-2xl",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  spread?: number;
  blendingValue?: string;
  blurClassName?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The pointer blob's position lives in a ref, not in state: it is written
  // straight to `style.transform` and never read during render, so keeping
  // it in state only bought two React re-renders of this whole subtree —
  // six `cn()` / tailwind-merge passes each — for every `mousemove`. On the
  // WhyChooseUs cards that lands on exactly the frames the page is trying
  // to scroll, which is the cheapest kind of stutter to delete.
  const pointerRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });
  const frameRef = useRef<number | null>(null);

  // Scoped as inline CSS custom properties on this component's own
  // container (see the outer div below) instead of document.body, so
  // multiple instances on the same page don't overwrite each other's colors.
  const cssVars = {
    "--gradient-background-start": gradientBackgroundStart,
    "--gradient-background-end": gradientBackgroundEnd,
    "--first-color": firstColor,
    "--second-color": secondColor,
    "--third-color": thirdColor,
    "--fourth-color": fourthColor,
    "--fifth-color": fifthColor,
    "--pointer-color": pointerColor,
    "--size": size,
    "--spread": `${spread}px`,
    "--spread-half": `${spread / 2}px`,
    "--blending-value": blendingValue,
  } as React.CSSProperties;

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeVisibility(el, (visible) => {
      el.classList.toggle("motion-paused", !visible);
    });
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = interactiveRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerRef.current.tgX = event.clientX - rect.left;
    pointerRef.current.tgY = event.clientY - rect.top;
    // Only kick the loop off when it isn't already running, so a burst of
    // `mousemove` events retargets the blob instead of stacking up frames.
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() =>
        easePointer(el, pointerRef.current, frameRef),
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={cssVars}
      className={cn(
        "h-screen w-screen relative isolate overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName,
      )}
    >
      <div className={cn("", className)}>{children}</div>
      <div className={cn("gradients-container h-full w-full", blurClassName)}>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-var(--spread))_calc(50%-var(--spread-half))]`,
            `animate-second`,
            `opacity-100`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+var(--spread))_calc(50%-var(--spread-half))]`,
            `animate-third`,
            `opacity-100`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+var(--spread))_calc(50%+var(--spread-half))]`,
            `animate-fourth`,
            `opacity-70`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-var(--spread))_calc(50%+var(--spread-half))]`,
            `animate-fifth`,
            `opacity-100`,
          )}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`,
            )}
          ></div>
        )}
      </div>
    </div>
  );
};
