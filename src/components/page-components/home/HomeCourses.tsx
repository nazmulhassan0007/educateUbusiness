"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import CourseCard, {
  type Course,
} from "@/components/shared/course-card/CourseCard";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import ExpandReveal from "@/components/shared/animation/ExpandReveal";
import { prefersReducedMotion } from "@/lib/motion-budget";

gsap.registerPlugin(ScrollTrigger);

// Used only if the courses API returns nothing (fetch failure, etc.).
const DEFAULT_COURSES: Course[] = [
  {
    slug: "business-analyst-mindset",
    title: "The Business Analyst: Innovation, Adaptability & Mindset",
    description:
      "Discover the essentials of UX design in this course tailored for beginners. Dive into the foundational principles that",
    rating: "20+ Student Rated 5 Star",
    price: 120,
    originalPrice: 160,
  },
  {
    slug: "business-analyst-mindset",
    title: "The Business Analyst: Innovation, Adaptability & Mindset",
    description:
      "Discover the essentials of UX design in this course tailored for beginners. Dive into the foundational principles that",
    rating: "20+ Student Rated 5 Star",
    price: 120,
    originalPrice: 160,
  },
  {
    slug: "business-analyst-mindset",
    title: "The Business Analyst: Innovation, Adaptability & Mindset",
    description:
      "Discover the essentials of UX design in this course tailored for beginners. Dive into the foundational principles that",
    rating: "20+ Student Rated 5 Star",
    price: 120,
    originalPrice: 160,
  },
];

export type HomeCoursesContent = {
  title: string;
  description: string;
  cta: {
    url: string;
    text: string;
  };
};

const DEFAULT_CONTENT: HomeCoursesContent = {
  title: "Recommended Courses For You",
  description:
    "At educateU, we empower lifelong learners through affordable, accessible courses. Our mission is to help you grow professionally without barriers.",
  cta: { url: "/courses", text: "View all Course" },
};

export default function HomeCourses({
  data,
  courses,
}: {
  data?: Partial<HomeCoursesContent>;
  courses?: Course[];
}) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const displayedCourses =
    courses && courses.length > 0 ? courses : DEFAULT_COURSES;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Tracks which card is nearest the track's own center as the user scrolls
  // (below `lg`, where the row is a peek-carousel), so the dot indicators
  // stay in sync — same "measure real positions" approach used elsewhere in
  // this codebase rather than assuming a fixed card width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateActiveIndex = () => {
      // At either scroll boundary, the edge card can't actually reach true
      // center (there's no more track past it to scroll into place), so the
      // distance-based check below can find a neighboring card "closer" and
      // get stuck there — most noticeably the last card's dot never
      // lighting up. Snap straight to the boundary index instead of relying
      // on distance once the track is maxed out either way.
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const epsilon = 2;

      if (track.scrollLeft <= epsilon) {
        setActiveIndex(0);
        return;
      }
      if (track.scrollLeft >= maxScrollLeft - epsilon) {
        setActiveIndex(cardRefs.current.length - 1);
        return;
      }

      const trackCenter =
        track.getBoundingClientRect().left + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(
          cardRect.left + cardRect.width / 2 - trackCenter,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    updateActiveIndex();

    let frame: number;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveIndex);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // The cards' *first* position is the staggered staircase (matching
  // Figma, via the 2xl:translate-y-32 / 2xl:translate-y-64 classes on the
  // row below). Those are a pure `transform` offset rather than padding, so
  // the row's actual layout height always matches the *aligned* state —
  // nothing is reserved for the staggered look, which otherwise left a
  // block of dead space below the cards once they'd animated into place.
  // While the section is pinned, the 2nd card rises to line up level with
  // the 1st, then the 3rd does the same right after — ending with all 3
  // cards aligned on the same line. Only applies once the row is an actual
  // 3-across staircase (`2xl`+).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const card2 = cardRefs.current[1];
    const card3 = cardRefs.current[2];
    if (!card2 || !card3) return;

    // The staircase is a *starting* position that this animation exists to
    // resolve, so it can't be left standing when the animation doesn't run:
    // the section clips at its own bottom edge, and the 3rd card hangs
    // ~270px past it, so an unresolved staircase is a permanently cut-off
    // card. (Tailwind v4 writes these as the independent `translate`
    // property, which is why clearing that — rather than `transform` — is
    // what undoes the classes on the row. GSAP folds it into `transform`
    // itself when it takes over below.)
    if (prefersReducedMotion()) {
      card2.style.translate = "none";
      card3.style.translate = "none";
      return;
    }
    // Below `2xl` the cards are never a staircase in the first place.
    if (window.innerWidth < 1440) return;

    const track = trackRef.current;
    if (!track) return;

    // Stale ScrollTrigger cleanup: Fast Refresh can re-run this effect
    // without the DOM node remounting, leaving a leftover trigger from a
    // previous save.
    ScrollTrigger.getAll()
      .filter(
        (trigger) => trigger.trigger === section || trigger.trigger === track,
      )
      .forEach((trigger) => trigger.kill());

    const ctx = gsap.context(() => {
      // No explicit starting `y` here: GSAP reads each card's current
      // rendered transform (the translate-y-24/48 classes) as the tween's
      // "from" value, so it animates from whatever that resolves to at
      // this viewport down to 0 — no separate value to keep in sync with
      // the Tailwind classes above.
      //
      // `force3D` pins each card to its own GPU layer up front, so the
      // `backdrop-blur` on CourseCard doesn't get re-sampled against a
      // shifting layer boundary on every scrub tick (that resample is
      // expensive enough on its own to read as stutter/lag).
      // Overlapping (not sequential) tweens: card3 starts before card2
      // finishes, so the two rises blend into one continuous motion
      // instead of reading as two separate steps.
      const tl = gsap.timeline();
      tl.to(card2, { y: 0, ease: "power1.out", duration: 1, force3D: true });
      tl.to(
        card3,
        { y: 0, ease: "power1.out", duration: 1, force3D: true },
        "<0.35",
      );

      // The staircase resolves as the CARD ROW crosses the viewport, not as
      // the section does.
      //
      // The trigger used to be the section itself (`top bottom` → `bottom
      // bottom`), which spent the rise on scrolling that happens before
      // there is anything to look at: the row sits in the bottom half of a
      // section that is a full viewport tall, so with the section's top
      // edge as the start, the cards were still below the fold for the
      // first ~44% of the window — and the 2nd card's rise was already
      // ~2/3 done by the time it came into view. The motion was there, it
      // just played to an empty screen. (Before that it was a pinned scrub,
      // which had the opposite problem — see git history.)
      //
      // Anchoring both ends to the row puts every pixel of the rise in the
      // window where the cards are actually on screen: they come in low
      // and clipped by the section's bottom edge (`overflow-hidden`, which
      // is what makes them read as rising out of the floor rather than
      // sliding over it), and they finish level once the row has settled
      // into the upper part of the viewport.
      ScrollTrigger.create({
        trigger: track,
        // Row's top edge reaches the bottom of the viewport: the first card
        // starts to appear, and the rise begins.
        start: "top bottom",
        // Row's bottom edge reaches 80% down the viewport: the whole row is
        // on screen with room to spare, and the cards are level. Ending on
        // the row's own bottom rather than a viewport fraction keeps the
        // window proportional to the cards — it is ~(row height + 20vh) of
        // scrolling at any size, instead of a distance that a taller card
        // would spend mostly off screen.
        end: "bottom 80%",
        // Lenis already eases the raw scroll input (see SmoothScroll.tsx);
        // any numeric `scrub` duration stacks a second, independent
        // catch-up delay on top of that, which is what read as lag — the
        // cards were always trailing behind an already-smoothed value.
        // `scrub: true` removes GSAP's own delay so the timeline tracks
        // Lenis's position 1:1, on every tick, with no extra lag of its own.
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
      });
    }, section);

    return () => ctx.revert();
  }, [displayedCourses.length]);

  return (
    <section
      ref={sectionRef}
      // Plain content height — no viewport floor. This used to carry
      // `2xl:min-h-screen`, for two reasons that are both gone now: the
      // stair effect above was a *pinned* scrub, and a pinned section
      // shorter than the screen leaves the rest of the screen showing the
      // page's dark base background through the pin spacer; and the effect
      // ended on the section's own arrival, which the floor made exactly
      // one viewport of scrolling. The trigger is the card row now and
      // nothing is pinned, so all the floor did was leave a few hundred
      // pixels of empty gradient under the cards on a large monitor, where
      // this section's content is well short of the viewport.
      className="relative overflow-hidden bg-linear-to-b from-[#f1fefa] to-white pb-8 pt-15 lg:pb-12 lg:pt-[90px]"
    >
      <Bounded className="relative mb-8 flex flex-col items-start lg:mb-[59px]">
        <div className="flex w-full flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col items-start gap-3 text-primary-950">
            <SplitTextReveal
              as="h2"
              className="type-h2 font-title xl:max-w-4xl font-semibold"
            >
              {content.title}
            </SplitTextReveal>
            <SplitTextReveal
              as="p"
              delay={0.3}
              className="type-lead max-w-3xl font-light text-[#42697c]"
            >
              {content.description}
            </SplitTextReveal>
          </div>

          <ExpandReveal delay={0.5}>
            <PrimaryButton label={content.cta.text} href={content.cta.url} />
          </ExpandReveal>
        </div>
      </Bounded>

      {/* Full-bleed below `md` so the row can peek past the viewport edge.
          Below `md` (mobile): each card is full-width with no visible
          neighbor peek — still swipeable, just one card fills the viewport
          at a time. Becomes a plain contained grid at `md`+ (tablet) — only
          2 columns through laptop widths, stepping up to the full 3-up grid
          only at `2xl`+ (matching the desktop Figma treatment). */}
      <div
        ref={trackRef}
        className="scrollbar-none flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden sm:px-6 md:mx-auto md:max-w-[1600px] md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-10 md:pb-0 md:snap-none xl:px-12 2xl:grid-cols-3 2xl:items-start 4xl:px-0"
      >
        {displayedCourses.map((course, index) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={`h-full w-full shrink-0 snap-center md:w-auto md:shrink ${
              index === displayedCourses.length - 1 ? "md:hidden 2xl:block" : ""
            } ${
              // Staggered "staircase" placement (matching the Figma layout):
              // each card sits progressively lower than the one before it.
              // A `translate-y`, not padding, so it's purely visual and adds
              // nothing to the row's actual layout height — once the cards
              // scroll into alignment there's no reserved space left behind.
              // Only applied once all 3 sit in a single row at `2xl`+.
              index === 1
                ? "2xl:translate-y-40 2xl:will-change-transform"
                : index === 2
                  ? "2xl:translate-y-80 2xl:will-change-transform"
                  : ""
            }`}
          >
            <CourseCard course={course} variant="light" />
          </div>
        ))}
      </div>

      {/* Dot indicators: only meaningful in peek-carousel mode (below `md`),
          hidden once the row becomes a static grid. */}
      <div className="mt-6 flex w-full items-center justify-center gap-2 md:hidden">
        {displayedCourses.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to course ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-6 bg-primary-500"
                : "w-2 bg-primary-500/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
