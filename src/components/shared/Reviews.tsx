"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Bounded from "@/components/layout/bounded/Bounded";
import { observeVisibility, prefersReducedMotion } from "@/lib/motion-budget";

type CmsAsset = {
  url: string;
  alt: string;
};

export type ReviewItem = {
  name: string;
  quote: string;
  position: string;
  star_icon: CmsAsset;
};

export type ReviewsContent = {
  title: string;
  description: string;
  quote_icon: CmsAsset;
  reviews: ReviewItem[];
};

const SHORT_REVIEW =
  "The courses were highly useful and provided a solid understanding of essential topics such as fire safety, equality, diversity and inclusion, harassment and sexual misconduct, and prevent and radicalization";

const LONG_REVIEW =
  "The courses were highly useful and provided a solid understanding of essential topics such as fire safety, equality, diversity and inclusion, harassment and sexual misconduct, and prevent and radicalization. These topics are essential for fostering a safe, inclusive, and respectful working environment. These topics are essential for fostering a safe, inclusive, and respectful working environment. These topics are essential for fostering a safe, inclusive, and respectful working environment.";

// Matches the project's `lg` breakpoint (see `--breakpoint-lg` in
// globals.css) — kept as a live `matchMedia` subscription rather than a
// one-off `window.innerWidth` read so the below/`lg` autoplay carousel and
// the `lg`+ marquee correctly hand off to each other when a tablet crosses
// this breakpoint by rotating, not just on initial load.
const DESKTOP_BREAKPOINT_QUERY = "(min-width: 1024px)";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_BREAKPOINT_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

const DEFAULT_STAR_ICON: CmsAsset = {
  url: "/hero/trustpilot-stars.svg",
  alt: "5 stars",
};

const DEFAULT_CONTENT: ReviewsContent = {
  title: "What Our Learners Say",
  description:
    "Don't just take our word for it. Hear from our learners who have transformed their skills and careers with educateU.",
  quote_icon: { url: "/reviews/icon-quote.svg", alt: "" },
  reviews: [
    {
      name: "ATANU B.",
      quote: SHORT_REVIEW,
      position: "HR Assistant",
      star_icon: DEFAULT_STAR_ICON,
    },
    {
      name: "ATANU B.",
      quote: LONG_REVIEW,
      position: "HR Assistant",
      star_icon: DEFAULT_STAR_ICON,
    },
    {
      name: "ATANU B.",
      quote: SHORT_REVIEW,
      position: "HR Assistant",
      star_icon: DEFAULT_STAR_ICON,
    },
    {
      name: "ATANU B.",
      quote: LONG_REVIEW,
      position: "HR Assistant",
      star_icon: DEFAULT_STAR_ICON,
    },
    {
      name: "ATANU B.",
      quote: SHORT_REVIEW,
      position: "HR Assistant",
      star_icon: DEFAULT_STAR_ICON,
    },
  ],
};

function ReviewCard({
  review,
  quoteIconUrl,
  ref,
}: {
  review: ReviewItem;
  quoteIconUrl: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLongReview = review.quote.length > 200;
  const displayQuote =
    isLongReview && !expanded
      ? `${review.quote.slice(0, 200).trim()}...`
      : review.quote;

  return (
    <div
      ref={ref}
      className="flex w-[85vw] max-w-[440px] shrink-0 snap-center flex-col justify-between rounded-[20px] border border-[#1ee9b5] bg-white px-6 py-8 sm:w-[440px] lg:w-[517px] lg:px-[39px] lg:py-6"
    >
      <div className="flex flex-col items-start gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
        <img
          alt=""
          className="pointer-events-none h-[30px] w-[39px]"
          draggable={false}
          src={quoteIconUrl}
        />
        <div className="flex w-full flex-col items-start gap-8 lg:gap-10">
          <div className="flex w-full flex-col items-start gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
            <img
              alt={review.star_icon.alt || "5 stars"}
              className="pointer-events-none h-5 w-[107px] lg:h-[25px] lg:w-[133px]"
              draggable={false}
              src={review.star_icon.url}
            />
            <div className="w-full">
              <p
                className={`type-body text-[#042018]/80 ${
                  isLongReview && !expanded
                    ? "max-h-[118px] overflow-hidden"
                    : ""
                }`}
              >
                {displayQuote}
              </p>
              {isLongReview && (
                <button
                  type="button"
                  onClick={() => setExpanded((current) => !current)}
                  className="mt-2 type-small font-medium text-[#219653] underline-offset-4 hover:underline"
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 whitespace-nowrap text-[#042018]">
            <span className="font-title type-h4 font-semibold">
              {review.name}
            </span>
            <span className="type-small">{review.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews({ data }: { data?: Partial<ReviewsContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const reviews = content.reviews;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // Tracks which card sits nearest the viewport's own center below `lg`
  // (where cards snap-center along a native-scroll peek-carousel), so the
  // dot indicators — and the autoplay effect below, which reads this via
  // `activeIndexRef` — stay in sync with wherever the row last landed,
  // whether that was a manual swipe or an autoplay step.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || isDesktop) return;

    const updateActiveIndex = () => {
      const viewportCenter =
        viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(
          cardRect.left + cardRect.width / 2 - viewportCenter,
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

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [isDesktop]);

  // Auto-advances through the cards below `lg`, since that range has no
  // scroll-jack animation of its own (the ScrollTrigger effect below only
  // runs from `lg` up, where the pin/slide takes over). Paused while the
  // user is actively touching the row so autoplay never fights a manual
  // swipe, and resumed a few seconds after they let go. Also paused
  // whenever the row scrolls out of view — `scrollIntoView` walks up every
  // scrollable ancestor including the page itself, so firing it while the
  // section is off-screen would yank the whole page back down to it.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || isDesktop) return;

    const AUTO_ADVANCE_MS = 4000;
    const RESUME_DELAY_MS = 4000;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let resumeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let isVisible = false;

    const stopInterval = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = undefined;
    };

    const startInterval = () => {
      stopInterval();
      if (!isVisible) return;
      intervalId = setInterval(() => {
        scrollToIndex((activeIndexRef.current + 1) % reviews.length);
      }, AUTO_ADVANCE_MS);
    };

    const handleInteractionStart = () => {
      stopInterval();
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
    };

    const handleInteractionEnd = () => {
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
      resumeTimeoutId = setTimeout(startInterval, RESUME_DELAY_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startInterval();
        } else {
          stopInterval();
          if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(viewport);
    viewport.addEventListener("pointerdown", handleInteractionStart);
    viewport.addEventListener("pointerup", handleInteractionEnd);
    viewport.addEventListener("pointercancel", handleInteractionEnd);

    return () => {
      observer.disconnect();
      stopInterval();
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
      viewport.removeEventListener("pointerdown", handleInteractionStart);
      viewport.removeEventListener("pointerup", handleInteractionEnd);
      viewport.removeEventListener("pointercancel", handleInteractionEnd);
    };
  }, [reviews.length, isDesktop]);

  // `lg` and up: a continuous, self-driving marquee — not tied to scroll
  // position at all. The track renders two back-to-back copies of the
  // reviews (see the JSX below) and slides left by exactly one copy's
  // width, then jumps back to the start on `repeat`; since copy two lines
  // up pixel-for-pixel with copy one, that reset is invisible and the loop
  // reads as endless.
  useEffect(() => {
    const track = marqueeTrackRef.current;
    if (!track || !isDesktop) return;
    if (prefersReducedMotion()) return;

    const PIXELS_PER_SECOND = 60;
    const setWidth = track.scrollWidth / 2;

    const tween = gsap.to(track, {
      x: -setWidth,
      duration: setWidth / PIXELS_PER_SECOND,
      ease: "none",
      repeat: -1,
    });

    const stopVisibility = observeVisibility(track, (visible) => {
      if (visible) tween.play();
      else tween.pause();
    });

    return () => {
      stopVisibility();
      tween.kill();
    };
  }, [isDesktop]);

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f1fefa] to-[#f8f8f8] pb-16 pt-10 lg:pb-[90px] lg:pt-[120px] ">
      <Bounded className="flex flex-col items-start gap-8 text-left sm:items-center sm:text-center lg:gap-6">
        <div className="flex max-w-3xl flex-col items-start gap-4 text-primary-950 sm:items-center">
          <h2 className="type-h2 font-title font-semibold">
            {content.title}
          </h2>
          <p className="type-lead pb-4 text-[#42697c]">
            {content.description}
          </p>
        </div>
      </Bounded>

      {/* Below `lg`: native-scroll, snap, autoplay carousel. */}
      <div
        ref={viewportRef}
        className="scrollbar-none mt-6 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden lg:hidden"
      >
        <div
          ref={trackRef}
          className="flex w-max items-start snap-x snap-mandatory gap-6 px-4 pb-2 sm:px-6 md:px-8"
        >
          {reviews.map((review, index) => (
            <ReviewCard
              key={index}
              review={review}
              quoteIconUrl={content.quote_icon.url}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            />
          ))}
          <div className="shrink-0 basis-4 sm:basis-6 md:basis-8" aria-hidden />
        </div>
      </div>

      {/* `lg` and up: continuous self-moving marquee, not tied to scroll.
          Renders the review list twice back-to-back so the track can loop
          seamlessly (see the effect above). */}
      <div className="mt-6 hidden overflow-hidden lg:block">
        <div
          ref={marqueeTrackRef}
          className="flex w-max items-start gap-6 px-10 xl:px-12 4xl:px-0"
        >
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard
              key={index}
              review={review}
              quoteIconUrl={content.quote_icon.url}
            />
          ))}
        </div>
      </div>

      {/* Dot indicators: only meaningful below `lg`, where the row is a
          native-scroll/autoplay carousel rather than the continuous
          marquee used from `lg` up. */}
      <div className="mt-6 flex w-full items-center justify-center gap-2 lg:hidden">
        {reviews.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to review ${index + 1}`}
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
