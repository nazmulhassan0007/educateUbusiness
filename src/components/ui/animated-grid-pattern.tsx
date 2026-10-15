"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion-budget";

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  // Fraction of the container (0–1) squares are allowed to spawn within.
  // Defaults to the full box; narrow this when the pattern is masked to
  // only part of its container (e.g. a corner fade) so highlighted squares
  // don't keep landing in the masked-out, invisible area.
  xRange?: [number, number];
  yRange?: [number, number];
}

type Square = {
  id: number;
  pos: [number, number];
};

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  xRange = [0, 1],
  yRange = [0, 1],
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement | null>(null);
  const squaresGroupRef = useRef<SVGSVGElement | null>(null);
  // Not React state on purpose — nothing needs to re-render when this
  // changes, only `squares` (below) does, and generating that is what the
  // ResizeObserver callback does directly once real dimensions are known.
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const [squares, setSquares] = useState<Square[]>([]);
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const getPos = useCallback((): [number, number] => {
    const { width: containerWidth, height: containerHeight } =
      containerSizeRef.current;
    const randX = xMin * containerWidth + Math.random() * (xMax - xMin) * containerWidth;
    const randY = yMin * containerHeight + Math.random() * (yMax - yMin) * containerHeight;
    return [Math.floor(randX / width), Math.floor(randY / height)];
  }, [width, height, xMin, xMax, yMin, yMax]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextWidth = entry.contentRect.width;
        const nextHeight = entry.contentRect.height;
        const current = containerSizeRef.current;
        if (current.width === nextWidth && current.height === nextHeight) {
          continue;
        }
        containerSizeRef.current = { width: nextWidth, height: nextHeight };
        if (nextWidth && nextHeight) {
          setSquares(
            Array.from({ length: numSquares }, (_, i) => ({
              id: i,
              pos: getPos(),
            })),
          );
        }
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [numSquares, getPos]);

  // Highlight loop: each square fades in then back out in place, then jumps
  // to a fresh random cell and repeats after a pause — driven by GSAP
  // (matching every other scroll/reveal effect in this codebase) rather
  // than Framer Motion. Position updates are written straight to the SVG
  // attributes instead of through React state, so relocating squares a few
  // times a second never triggers a re-render.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const group = squaresGroupRef.current;
    if (!group || squares.length === 0) return;

    const rects = Array.from(group.querySelectorAll<SVGRectElement>("rect"));

    const ctx = gsap.context(() => {
      rects.forEach((rect, index) => {
        const cycle = () => {
          gsap.set(rect, { opacity: 0 });
          gsap.to(rect, {
            opacity: maxOpacity,
            duration: duration / 2,
            delay: index * 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
            onComplete: () => {
              const [nextX, nextY] = getPos();
              rect.setAttribute("x", String(nextX * width + 1));
              rect.setAttribute("y", String(nextY * height + 1));
              gsap.delayedCall(repeatDelay, cycle);
            },
          });
        };
        cycle();
      });
    }, group);

    return () => ctx.revert();
  }, [squares, width, height, maxOpacity, duration, repeatDelay, getPos]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg ref={squaresGroupRef} x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id: squareId }) => (
          // No explicit `fill` here — it inherits the `fill-*` Tailwind
          // class passed via `className` on the outer `<svg>` above, same
          // as the grid lines' `stroke-*`. An earlier version set
          // `fill="currentColor"`, which resolves through the inherited
          // `color` property rather than `fill` — on this dark hero that
          // was a near-black `color`, so the highlight pulses were
          // animating opacity correctly but rendering black-on-black,
          // invisible regardless of `maxOpacity`.
          <rect
            key={squareId}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            strokeWidth="0"
            opacity={0}
          />
        ))}
      </svg>
    </svg>
  );
}
