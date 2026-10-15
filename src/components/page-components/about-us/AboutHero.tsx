"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/page-components/concepts/shared";

const EASE = [0.22, 1, 0.36, 1] as const;
const FILM = { src: "/aw/hero.mp4", poster: "/aw/hero-poster.jpg" };
const TITLE = "Who we are.";

export type AboutStat = { title: string; body: string };

/**
 * About page hero, from the design: the full educateU film behind a green
 * tint, "Who we are." with a line and a button, and four facts along the
 * bottom.
 *
 * Motion: the film opens out of a rounded frame and drifts against the
 * pointer; the title rises letter by letter; the facts' rules sweep in and
 * their numbers count up. Scrolling away pushes into the film while the
 * type lifts and fades. Reduced motion shows the finished layout, still.
 */
export default function AboutHero({ stats }: { stats: AboutStat[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const still = !!reduce;

  // Scroll: 0 at rest, 1 when the hero has scrolled off.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const filmScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyFade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  // Pointer: the film leans away from the cursor, a few pixels at most.
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const filmX = useTransform(px, [-0.5, 0.5], [18, -18]);
  const filmY = useTransform(py, [-0.5, 0.5], [12, -12]);
  const onMove = (e: React.PointerEvent) => {
    if (still || e.pointerType !== "mouse") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  const rise = (d: number) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay: d, ease: EASE },
        };

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      aria-labelledby="about-title"
      className="ragged relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#06180b] text-[#f2efe6]"
    >
      {/* The film opens out of a rounded frame, then follows scroll and pointer. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        initial={still ? false : { clipPath: "inset(14% 10% 14% 10% round 40px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <motion.div className="absolute -inset-6" style={still ? undefined : { scale: filmScale, x: filmX, y: filmY }}>
          <Film still={still} />
        </motion.div>
      </motion.div>

      {/* The green grade over the film, then ink rising from the bottom for the type. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0b3a28]/45 mix-blend-multiply" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_24_11/0.55)_0%,rgb(6_24_11/0.1)_22%,rgb(6_24_11/0.15)_50%,rgb(6_24_11/0.85)_100%),linear-gradient(90deg,rgb(6_24_11/0.45),transparent_60%)]"
      />
      <motion.div aria-hidden="true" style={{ opacity: shade }} className="absolute inset-0 -z-10 bg-[#06180b]" />

      <motion.div
        style={still ? undefined : { y: copyY, opacity: copyFade }}
        className="site-container pb-10 pt-40 lg:pb-[46px]"
      >
        <h1 id="about-title" className="m-0 font-title type-display font-medium tracking-[-0.045em]">
          <span className="sr-only">{TITLE}</span>
          <span aria-hidden="true" className="inline-flex flex-wrap">
            {TITLE.split(" ").map((word, w, words) => {
              const before = words.slice(0, w).join("").length;
              return (
                // Each word masks its letters as they rise into place.
                <span key={word} className="inline-flex overflow-hidden pb-[0.06em]">
                  {[...word].map((ch, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={still ? false : { y: "110%", rotate: 8 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 0.9, delay: 0.35 + (before + i) * 0.045, ease: EASE }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                  {w < words.length - 1 && <span className="inline-block w-[0.24em]" />}
                </span>
              );
            })}
          </span>
        </h1>
        <motion.p {...rise(0.75)} className="m-0 mt-6 max-w-[720px] type-lead text-[#f2efe6]/90">
          UK-accredited online learning, made accessible, flexible and straightforward.
        </motion.p>
        <motion.div {...rise(0.85)} className="mt-6">
          <Link
            href="/courses"
            className="group relative inline-flex h-[50px] items-center gap-4 overflow-hidden rounded-full bg-[#f2efe6] py-1 pl-6 pr-1 type-button font-medium text-[#06180b]"
          >
            {/* Mint wipes across from the arrow on hover. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#1ee9b5] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
            />
            <span className="relative">Explore Courses</span>
            <span className="relative grid size-[42px] place-items-center rounded-full bg-[#0c7a5e] text-white transition-[transform,background-color] duration-500 group-hover:-rotate-45 group-hover:bg-[#06180b]">
              <Arrow size={14} />
            </span>
          </Link>
        </motion.div>

        <ul className="m-0 mt-12 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 lg:mt-[44px] lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.li key={s.title} {...rise(1 + i * 0.1)} className="group/stat relative pt-[22px]">
              {/* The rule sweeps in; the first stays mint, the others glow mint on hover. */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-white/25" />
              <motion.span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-0.5 origin-left transition-colors duration-500 ${i === 0 ? "bg-[#1ee9b5]" : "bg-transparent group-hover/stat:bg-[#1ee9b5]/70"}`}
                initial={still ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 1.1 + i * 0.15, ease: EASE }}
              />
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border font-[family-name:var(--font-geist-mono)] type-caption transition-colors duration-500 sm:size-[34px] ${
                    i === 0 ? "border-[#1ee9b5] text-[#1ee9b5]" : "border-white/40 text-white/80 group-hover/stat:border-[#1ee9b5] group-hover/stat:text-[#1ee9b5]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="m-0 whitespace-nowrap font-title type-h3 tracking-[-0.03em]">
                  <CountUp text={s.title} delay={1.2 + i * 0.15} still={still} />
                </p>
              </div>
              <p className="m-0 mt-3 type-small text-white/75 sm:mt-4 sm:pl-[48px]">{s.body}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

/** The full film, looping. It fades in once it is actually playing (its first second is blank). */
function Film({ still }: { still: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (still) v.pause();
    else v.play().catch(() => {});
  }, [still]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FILM.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={ref}
        src={FILM.src}
        muted
        loop
        playsInline
        autoPlay={!still}
        preload="auto"
        onTimeUpdate={(e) => {
          if (!playing && e.currentTarget.currentTime > 0.9) setPlaying(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

/** Counts the number in a label up from zero ("18 courses", "£15"); labels without one show as they are. */
function CountUp({ text, delay, still }: { text: string; delay: number; still: boolean }) {
  const match = text.match(/^(\D*)(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState<number | null>(match && !still ? 0 : null);
  const to = match ? Number(match[2]) : null;

  useEffect(() => {
    if (to === null || still || !inView) return;
    const a = animate(0, to, { duration: 1.4, delay, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => a.stop();
  }, [to, still, inView, delay]);

  if (!match || n === null) return <span ref={ref}>{text}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {match[1]}
      {n}
      {match[3]}
    </span>
  );
}
