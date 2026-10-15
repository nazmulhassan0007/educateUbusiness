"use client";

import { useEffect, useRef, useState } from "react";
import { allowHeavyMotion } from "@/lib/motion-budget";

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 1121px)";
const TRAIL_COUNT = 5;
const NODES_PER_TRAIL = 8;
const FRICTION = 0.5;
const DAMPENING = 0.1;
const TENSION = 0.98;
const STROKE_COLOR = "rgba(30, 233, 181, 0.2)"; // --accent-500 at low alpha
const IDLE_MS = 120;
const SETTLE_SPEED = 0.12;

type Point = { x: number; y: number };

class TrailNode {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

class Trail {
  spring: number;
  friction: number;
  nodes: TrailNode[] = [];

  constructor(spring: number, origin: Point) {
    this.spring = spring + Math.random() * 0.1 - 0.02;
    this.friction = FRICTION + Math.random() * 0.01 - 0.002;
    for (let i = 0; i < NODES_PER_TRAIL; i++) {
      const node = new TrailNode();
      node.x = origin.x;
      node.y = origin.y;
      this.nodes.push(node);
    }
  }

  update(pointer: Point) {
    let spring = this.spring;
    let node = this.nodes[0];
    node.vx += (pointer.x - node.x) * spring;
    node.vy += (pointer.y - node.y) * spring;

    for (let i = 0; i < this.nodes.length; i++) {
      node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * DAMPENING;
        node.vy += prev.vy * DAMPENING;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= TENSION;
    }
  }

  maxSpeed() {
    let max = 0;
    for (const node of this.nodes) {
      const speed = Math.abs(node.vx) + Math.abs(node.vy);
      if (speed > max) max = speed;
    }
    return max;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0].x;
    let y = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(x, y);

    let i = 1;
    for (; i < this.nodes.length - 2; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      x = (a.x + b.x) * 0.5;
      y = (a.y + b.y) * 0.5;
      ctx.quadraticCurveTo(a.x, a.y, x, y);
    }
    const a = this.nodes[i];
    const b = this.nodes[i + 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke();
    ctx.closePath();
  }
}

/**
 * Fullscreen canvas overlay drawing several spring-physics "ribbons" that
 * chase the pointer with lag, additively blended for a glow. Desktop-only
 * (the usual matchMedia pattern) since the effect assumes a
 * hover-capable pointer. Skipped on reduced-motion / low-power clients, and
 * the rAF loop sleeps once the trails have settled.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    if (!mediaQuery.matches || !allowHeavyMotion()) return;

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const pointer: Point = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const trails: Trail[] = Array.from(
      { length: TRAIL_COUNT },
      (_, i) => new Trail(0.4 + (i / TRAIL_COUNT) * 0.025, pointer),
    );

    let running = true;
    let ticking = false;
    let lastPointerAt = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const render = () => {
      if (!running) return;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = STROKE_COLOR;
      ctx.lineWidth = 1;

      let maxSpeed = 0;
      for (const trail of trails) {
        trail.update(pointer);
        trail.draw(ctx);
        const speed = trail.maxSpeed();
        if (speed > maxSpeed) maxSpeed = speed;
      }

      const idle =
        performance.now() - lastPointerAt > IDLE_MS && maxSpeed < SETTLE_SPEED;
      if (idle) {
        ticking = false;
        return;
      }

      requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!running || ticking) return;
      ticking = true;
      requestAnimationFrame(render);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastPointerAt = performance.now();
      startLoop();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        ticking = false;
      } else {
        running = true;
      }
    };

    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      ticking = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-100"
      aria-hidden="true"
    />
  );
}
