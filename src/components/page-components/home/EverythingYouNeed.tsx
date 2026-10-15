"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Bounded from "@/components/layout/bounded/Bounded";
import { prefersReducedMotion } from "@/lib/motion-budget";

gsap.registerPlugin(ScrollTrigger);

type CmsAsset = {
  url: string;
  alt: string;
};

type CmsCta = {
  url: string;
  text: string;
};

export type EverythingYouNeedContent = {
  main_quote: string;
  img_1: CmsAsset;
  img_2: CmsAsset;
  img_3: CmsAsset;
  card_1_title: string;
  card_1_description: string;
  card_1_cta: CmsCta;
  card_2_eyebrow: string;
  card_2_title: string;
  card_2_subtitle: string;
};

const DEFAULT_CONTENT: EverythingYouNeedContent = {
  main_quote:
    "<p>Everything you need to learn, <strong>gain recognised qualifications,</strong> and grow your career—all in one flexible learning platform.</p>",
  img_1: {
    url: "/everything-you-need/photo-library.jpeg",
    alt: "Learner studying in a library",
  },
  img_2: {
    url: "/everything-you-need/photo-video-call.jpeg",
    alt: "Learner on a video call",
  },
  img_3: {
    url: "/everything-you-need/photo-bookshelf.jpeg",
    alt: "Learner writing notes",
  },
  card_1_title: "15+ Live Courses",
  card_1_description: "We've more than 15+ Live courses for all professional",
  card_1_cta: { url: "/courses", text: "Explore All Courses" },
  card_2_eyebrow: "20+ Active",
  card_2_title: "CPD Course",
  card_2_subtitle: "Professional Certificate",
};

function PhotoCard({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`reveal-card relative h-40 w-full overflow-hidden rounded-2xl ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
      <img
        alt={alt}
        src={src}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function LiveCoursesCard({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: CmsCta;
}) {
  return (
    <div className="reveal-card relative w-full md:w-[422px] md:shrink-0">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        aria-hidden
      >
        <div className="absolute -right-10 top-1/2 h-16 w-40 -translate-y-1/2 rotate-[13.26deg] rounded-full bg-[#1EE9B5]/30 blur-2xl" />
        <div className="absolute -left-10 top-2 h-14 w-40 rotate-[-20.54deg] rounded-full bg-[#1EE9B5]/25 blur-2xl" />
      </div>

      <div className="relative flex w-full flex-col items-start gap-3 rounded-3xl border border-white/9 bg-[rgba(137,137,137,0.05)] px-4 py-8 backdrop-blur-[75px] md:p-6">
        <div className="flex flex-col items-start gap-3 text-primary-50">
          <p className="font-title type-h4 font-medium">
            {title}
          </p>
          <p className="type-body">{description}</p>
        </div>
        <a
          href={cta.url}
          className="rounded-full bg-primary-700 px-[14px] py-[10px] type-button text-primary-50"
        >
          {cta.text}
        </a>
      </div>
    </div>
  );
}

function CpdCourseCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="reveal-card relative w-full md:w-[400px] md:shrink-0">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        aria-hidden
      >
        <div className="absolute left-1/2 top-[47%] h-9 w-44 -translate-x-1/2 -translate-y-1/2 rotate-[-20.54deg] rounded-full bg-[#1EE9B5] blur-2xl" />
        <div className="absolute -left-6 -top-4 h-11 w-48 rotate-[-20.54deg] rounded-full bg-[#1EE9B5]/25 blur-3xl" />
      </div>

      <div className="relative flex w-full flex-col items-center gap-[7px] rounded-3xl border border-white/9 bg-[rgba(137,137,137,0.05)] px-6 py-6 text-center">
        <span className="font-title type-caption font-medium text-primary-500">
          {eyebrow}
        </span>
        <div className="flex flex-col gap-0.5 text-primary-50 ">
          <p className="font-title type-h4 font-medium">
            {title}
          </p>
          <p className="font-title type-small font-light">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EverythingYouNeed({
  data,
}: {
  data?: Partial<EverythingYouNeedContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    // The animated pin/reveal only runs on laptop and larger screens. On
    // mobile and tablet the section stays static so the page can scroll
    // normally without being held in a pinned GSAP sequence. Reduced-motion
    // users also get the resting layout; this sequence is the section's
    // content, so it still runs on otherwise "lite" devices.
    if (!section || window.innerWidth < 1024 || prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // Unlike every other pinned section here, this one's actual animation
    // math (the arc offsets each card enters along) is baked from a ONE-TIME
    // `getBoundingClientRect()` read into plain closures — not GSAP tween
    // "from" values, so `ScrollTrigger.refresh()` elsewhere (on fonts.ready,
    // on route change) can correct the *trigger's* start/end but never
    // re-measures this. If that one-time read happens before custom fonts
    // finish swapping in, the whole reveal plays against stale geometry for
    // the rest of the session. Deferring setup until fonts have actually
    // settled means the one measurement we do take is correct from the
    // start.
    document.fonts.ready.then(() => {
      if (cancelled || !section) return;

      ctx = gsap.context(() => {
        const heading = section.querySelector<HTMLElement>(".reveal-heading");
        const cards = gsap.utils.toArray<HTMLElement>(".reveal-card", section);

        // Each card enters along a short tangential arc around the heading's
        // center, in the clockwise direction, rather than a straight fade.
        // Read the natural (pre-transform) position of everything first, so
        // the angle math reflects real layout instead of an already-offset
        // element.
        const pivotRect = (heading ?? section).getBoundingClientRect();
        const pivotX = pivotRect.left + pivotRect.width / 2;
        const pivotY = pivotRect.top + pivotRect.height / 2;
        const ARC_RADIUS = 70;

        const restRects = cards.map((card) => card.getBoundingClientRect());
        const centerOf = (rect: DOMRect) => ({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        const tangentOffsetAt = (rect: DOMRect) => {
          const c = centerOf(rect);
          const angle = Math.atan2(c.y - pivotY, c.x - pivotX);
          // Tangent of a clockwise orbit at this angle, reversed: this is
          // where a card would have been an instant before arriving here
          // while sweeping clockwise around the pivot.
          return {
            x: ARC_RADIUS * Math.sin(angle),
            y: -ARC_RADIUS * Math.cos(angle),
          };
        };

        const entryOffsets = restRects.map((rect) => tangentOffsetAt(rect));

        cards.forEach((card, i) =>
          gsap.set(card, {
            opacity: 0,
            x: entryOffsets[i].x,
            y: entryOffsets[i].y,
          }),
        );

        const tl = gsap.timeline();

        // Converts tl "time" units into physical scroll distance below:
        // each unit of tl duration consumes this many viewport heights of
        // scrolling while pinned.
        const DESKTOP_SCROLL_SECONDS = 1.2;

        // Phase 1: no cards are visible yet — the heading itself has no
        // entrance animation (deliberately: fading/sliding it in left a
        // split second right at the top of the pin with no text on screen
        // at all, which read as a blank/black flash). It's just already
        // there, resting in the center, for a beat before the cards start
        // revealing.
        //
        // These three add up to the timeline duration, which is what sets
        // the pin's scroll distance (see `end` below) — so their *ratio*
        // decides how much of the pinned scroll actually animates. The
        // original 0.45/0.35/0.4 spent only 29% of the timeline moving:
        // measured on the running site, 893px of the 1414px pin held the
        // page completely still — ~500px of frozen scrolling before the
        // cards started and ~500px after they finished, which reads as the
        // page having got stuck rather than as a deliberate beat. The lead-in
        // is now a real beat rather than half the section, the reveal itself
        // stretches across most of the pin (which is the point of scrubbing
        // it), and the hold is just enough to land on before releasing.
        const cardsStart = 0.12;
        const APPEAR_DURATION = 0.6;
        const VIEW_HOLD = 0.15;

        // All cards fade in together, each swinging into place along its
        // own clockwise entry arc, then hold in that resting layout for the
        // rest of the pin's scroll distance before releasing.
        cards.forEach((card) => {
          tl.to(
            card,
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: APPEAR_DURATION,
              ease: "power1.inOut",
            },
            cardsStart,
          );
        });
        tl.to({}, { duration: VIEW_HOLD });

        // Read the same `--navbar-height` CSS var (set by Navbar.tsx) that
        // WhyChooseUs's sticky offset uses, rather than re-measuring the
        // header independently — any drift between the two (rounding,
        // timing) showed up as a visible gap/overlap right where WhyChooseUs
        // hands off to this section.
        const navbarHeight =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--navbar-height",
            ),
          ) || 0;

        // Dev-mode Fast Refresh can re-run this effect without the DOM node
        // itself remounting, which sometimes leaves a stale ScrollTrigger
        // (from a previous save) still pinned to this same section. Clear
        // any leftover instance before creating the current one.
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === section)
          .forEach((trigger) => trigger.kill());

        // Pin the section in place while the timeline above scrubs through:
        // heading holds center, cards sweep into place, then hold. Once the
        // scroll distance is exhausted the section unpins and normal
        // scrolling continues into the next section.
        ScrollTrigger.create({
          trigger: section,
          start: `top ${navbarHeight}`,
          end: () => {
            const multiplier =
              window.innerWidth >= 1024
                ? tl.duration() * DESKTOP_SCROLL_SECONDS
                : 1.3;
            return `+=${Math.round(window.innerHeight * multiplier)}`;
          },
          pin: true,
          anticipatePin: 1,
          // Lenis already eases the raw scroll input (see SmoothScroll.tsx);
          // any numeric `scrub` duration stacks a second, independent
          // catch-up delay on top of that. Measured on the running site,
          // `scrub: 1` left the reveal ~183px of scroll behind the actual
          // position — the cards were always trailing an already-smoothed
          // value. `scrub: true` removes GSAP's own delay so the timeline
          // tracks Lenis 1:1 (re-measured: 0px lag). Matches HomeCourses.tsx.
          scrub: true,
          animation: tl,
          invalidateOnRefresh: true,
        });
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      // `z-10` (above WhyChooseUs's sticky `z-0`) plus an opaque background
      // so this section visually slides up and covers WhyChooseUs, which
      // stays pinned underneath as this one scrolls into view. No
      // `overflow-hidden` here (moved onto the inner wrapper below) — GSAP's
      // pin locks to whatever screen offset the scroll happens to be at the
      // exact frame it crosses `start`, which lands a fraction of a pixel
      // off from WhyChooseUs's CSS `sticky` offset (a separate positioning
      // system). The `-top` backdrop just below bleeds this section's own
      // background past its top edge to swallow that seam; `overflow-hidden`
      // on the section itself would clip that bleed away.
      // `lg:min-h` + centering: this section is pinned under the navbar
      // while its reveal scrubs, and its own content is shorter than the
      // screen on a large monitor — so without a height floor the pinned
      // section stopped short of the fold and WhyChooseUs, parked behind
      // it, showed through underneath. Filling the space under the navbar
      // is also what makes it cover cleanly on the way in.
      //
      // The other half of that deal is the reverse case: a section that is
      // pinned under the navbar can only be read in the height it is given,
      // and on a laptop (a 13" MacBook leaves ~720px under the bar) this
      // section's fixed sizes added up to more than that, so the bottom
      // photo sat below the fold for the whole pin. Every large vertical
      // measurement here — this padding, the stack gap, the photo heights
      // and the quote's own type size — is therefore a `clamp()` in `svh`:
      // the design's number is the cap, reached on a tall screen, and
      // shorter screens get a proportional share instead of an overflow.
      // `svh` rather than `vh` so a mobile browser's collapsing toolbar
      // can't resize the layout mid-scroll.
      className="relative z-10 bg-surface-dark py-[90px] md:py-[90px] lg:flex lg:min-h-[calc(100svh-var(--navbar-height,120px))] lg:flex-col lg:justify-center lg:pb-[clamp(1.5rem,4svh,3rem)] lg:pt-3"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-4 h-4 bg-surface-dark"
        aria-hidden
      />
      <Bounded className="flex flex-col items-center gap-[43px] overflow-hidden md:gap-4 lg:gap-[clamp(0.5rem,1.8svh,1.25rem)]">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <PhotoCard
            src={content.img_1.url}
            alt={content.img_1.alt || "Learner studying in a library"}
            className="md:h-[203px] md:w-[256px] md:shrink-0 lg:h-[clamp(8rem,21svh,203px)] lg:w-[295px]"
          />
          <LiveCoursesCard
            title={content.card_1_title}
            description={content.card_1_description}
            cta={content.card_1_cta}
          />
        </div>

        <div
          className="reveal-heading max-w-8xl text-left font-title type-h2 font-medium text-on-dark lg:text-center [&_strong]:font-medium [&_strong]:text-primary-500"
          dangerouslySetInnerHTML={{ __html: content.main_quote }}
        />

        <div className="flex w-full flex-col items-center gap-[25px] md:gap-6 lg:gap-3">
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
            <CpdCourseCard
              eyebrow={content.card_2_eyebrow}
              title={content.card_2_title}
              subtitle={content.card_2_subtitle}
            />
            <PhotoCard
              src={content.img_2.url}
              alt={content.img_2.alt || "Learner on a video call"}
              className="md:h-[203px] md:w-[357px] md:shrink-0 lg:h-[clamp(8rem,21svh,203px)] lg:w-[400px]"
            />
          </div>
          <PhotoCard
            src={content.img_3.url}
            alt={content.img_3.alt || "Learner writing notes"}
            className="lg:-ml-8 lg:h-[clamp(6rem,15svh,150px)] lg:w-[300px] md:h-[203px] md:w-[422px] md:shrink-0 xl:ml-0 xl:-mt-16 "
          />
        </div>
      </Bounded>
    </section>
  );
}
