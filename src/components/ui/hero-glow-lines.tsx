"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DarkVeil } from "@/components/ui/dark-veil";
import { allowHeavyMotion } from "@/lib/motion-budget";

const RAY_COUNT: number = 120;
const RAY_STROKE_WIDTH = 0.9;

// White-on-black SVG — luminance mask so aurora only paints the strokes.
function buildRaysMaskUri(width: number, height: number) {
  const originX = width / 2;
  const originY = height;
  const startAngle = -Math.PI;
  const endAngle = 0;
  const length = Math.max(width, height) * 2;

  let lines = "";
  for (let i = 0; i < RAY_COUNT; i++) {
    const t = RAY_COUNT === 1 ? 0.5 : i / (RAY_COUNT - 1);
    const angle = startAngle + (endAngle - startAngle) * t;
    const x2 = originX + Math.cos(angle) * length;
    const y2 = originY + Math.sin(angle) * length;
    lines += `<line x1="${originX}" y1="${originY}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fff" stroke-width="${RAY_STROKE_WIDTH}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#000"/>${lines}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Glow lives at the poles (top edge + bottom origin); center stays black
// so strokes only appear where the aurora gradient is.
const GLOW_FALLOFF = [
  "radial-gradient(ellipse 110% 62% at 50% 100%, #fff 0%, rgba(255,255,255,0.95) 14%, rgba(255,255,255,0.55) 36%, rgba(255,255,255,0.2) 55%, transparent 72%)",
  "radial-gradient(ellipse 90% 48% at 50% 0%, #fff 0%, rgba(255,255,255,0.7) 28%, rgba(255,255,255,0.25) 52%, transparent 75%)",
  "radial-gradient(ellipse 45% 40% at 0% 0%, #fff 0%, rgba(255,255,255,0.45) 45%, transparent 72%)",
  "radial-gradient(ellipse 45% 40% at 100% 0%, #fff 0%, rgba(255,255,255,0.45) 45%, transparent 72%)",
].join(", ");

const STATIC_AURORA =
  "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(30,233,181,0.45) 0%, transparent 62%), radial-gradient(ellipse 70% 40% at 50% 0%, rgba(30,233,181,0.28) 0%, transparent 70%)";

export function HeroGlowLines({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setUseShader(allowHeavyMotion());
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const raysMask =
    width > 0 && height > 0 ? buildRaysMaskUri(width, height) : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Soft blurred aurora wash. One shader (not three) — extra copies
          were the same field at different speeds and dominated GPU fill. */}
      <div
        className="absolute inset-0 h-full w-full scale-110 opacity-50 blur-2xl"
        style={{
          maskImage: GLOW_FALLOFF,
          WebkitMaskImage: GLOW_FALLOFF,
          maskMode: "luminance",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        {useShader ? (
          <DarkVeil
            colorA="#1ee9b5"
            colorB="#0d9f7a"
            floorColor="#020805"
            noiseIntensity={0.12}
            scanlineIntensity={0}
            speed={3.6}
            scanlineFrequency={0}
            warpAmount={3.2}
          />
        ) : (
          <div className="size-full" style={{ background: STATIC_AURORA }} />
        )}
      </div>

      {/* Thin rays: static mint wash under the stroke mask — no second WebGL. */}
      {raysMask && (
        <div
          className="absolute inset-0"
          style={{
            maskImage: GLOW_FALLOFF,
            WebkitMaskImage: GLOW_FALLOFF,
            maskMode: "luminance",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <div
            className="absolute inset-0 opacity-45 mix-blend-screen"
            style={{
              maskImage: raysMask,
              WebkitMaskImage: raysMask,
              maskMode: "luminance",
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              background: STATIC_AURORA,
            }}
          />
        </div>
      )}
    </div>
  );
}
