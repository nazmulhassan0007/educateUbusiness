"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BorderGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "34, 197, 94",
  secondColor = "250, 204, 21",
  thirdColor = "34, 211, 238",
  pointerColor = "140, 100, 255",
  size = "100%",
  spread = 100,
  blendingValue = "hard-light",
  blurClassName = "blur-md",
  borderWidth = 2,
  borderRadius = "1rem",
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
  pointerColor?: string;
  size?: string;
  spread?: number;
  blendingValue?: string;
  blurClassName?: string;
  borderWidth?: number;
  borderRadius?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);

  // Scoped as inline CSS custom properties on this component's own
  // container instead of document.body, so multiple instances on the same
  // page don't overwrite each other's colors.
  const cssVars = {
    "--gradient-background-start": gradientBackgroundStart,
    "--gradient-background-end": gradientBackgroundEnd,
    "--first-color": firstColor,
    "--second-color": secondColor,
    "--third-color": thirdColor,
    "--pointer-color": pointerColor,
    "--size": size,
    "--spread": `${spread}px`,
    "--spread-half": `${spread / 2}px`,
    "--blending-value": blendingValue,
  } as React.CSSProperties;

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) {
        return;
      }
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(
        curX,
      )}px, ${Math.round(curY)}px)`;
    }

    move();
  }, [tgX, tgY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  return (
    <div
      className={cn("relative isolate", containerClassName)}
      // Padding insets the (normal-flow) children by borderWidth so they
      // don't visually cover the absolutely-positioned border layer below,
      // which otherwise spans the same full box (abs elements size against
      // the containing block's padding box, ignoring this padding).
      style={{ borderRadius, padding: borderWidth }}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      {/* Border layer: the animated blobs are rendered here, then masked so
          only the border ring (border-box minus content-box) stays visible,
          leaving the inner area fully transparent. */}
      <div
        style={{
          ...cssVars,
          padding: borderWidth,
          borderRadius,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
        className={cn(
          "absolute inset-0 overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
          blurClassName,
        )}
      >
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_70%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_70%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-var(--spread))_calc(50%-var(--spread-half))]`,
            `animate-second`,
            `opacity-100`,
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_70%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+var(--spread))_calc(50%-var(--spread-half))]`,
            `animate-third`,
            `opacity-100`,
          )}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_70%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`,
            )}
          ></div>
        )}
      </div>

      {/* Content sits above the border layer, filling the inner area. */}
      <div className={cn("relative z-10", className)} style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
};
