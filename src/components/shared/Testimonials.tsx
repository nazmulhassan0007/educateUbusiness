"use client";

import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Bounded from "@/components/layout/bounded/Bounded";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

function MessageCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M33.2494 18.2083C33.2494 25.6412 27.2239 31.6667 19.7911 31.6667C18.0862 31.6667 16.4553 31.3496 14.9542 30.7713C14.6798 30.6656 14.5426 30.6128 14.4334 30.5876C14.3261 30.5629 14.2484 30.5525 14.1384 30.5483C14.0264 30.544 13.9037 30.5567 13.6581 30.5821L5.54985 31.4203C4.7768 31.5002 4.39027 31.5401 4.16227 31.401C3.96367 31.2799 3.82841 31.0775 3.7924 30.8477C3.75107 30.5839 3.93577 30.242 4.30518 29.5582L6.89497 24.7646C7.10825 24.3699 7.21489 24.1725 7.26319 23.9827C7.31089 23.7952 7.32242 23.6601 7.30717 23.4673C7.29172 23.272 7.20606 23.0179 7.03474 22.5096C6.5795 21.159 6.33274 19.7125 6.33274 18.2083C6.33274 10.7755 12.3582 4.75 19.7911 4.75C27.2239 4.75 33.2494 10.7755 33.2494 18.2083Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="70"
      height="53"
      viewBox="0 0 70 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1692 2.74851e-06C19.1037 3.1799e-06 23.1923 1.62533 26.435 4.876C29.5368 8.12666 31.0876 12.7907 31.0876 18.868C31.0876 25.3693 29.2548 31.8 25.5891 38.16C21.7825 44.52 16.4955 49.4667 9.72809 53L4.86404 45.58C12.1954 40.492 16.566 34.0613 17.9758 26.288C16.7069 26.8533 15.2266 27.136 13.5347 27.136C9.58711 27.136 6.34441 25.864 3.80664 23.32C1.26888 20.776 -4.5281e-06 17.5253 -4.18214e-06 13.568C-3.83618e-06 9.61067 1.33937 6.36 4.01812 3.816C6.69687 1.272 10.0806 2.39107e-06 14.1692 2.74851e-06ZM53.0816 6.15034e-06C58.0161 6.58173e-06 62.1047 1.62534 65.3474 4.876C68.4491 8.12667 70 12.7907 70 18.868C70 25.3693 68.1672 31.8 64.5015 38.16C60.6949 44.52 55.4079 49.4667 48.6405 53L43.7764 45.58C51.1078 40.492 55.4783 34.0613 56.8882 26.288C55.6193 26.8533 54.139 27.136 52.4471 27.136C48.4995 27.136 45.2568 25.864 42.719 23.32C40.1813 20.776 38.9124 17.5253 38.9124 13.568C38.9124 9.61067 40.2518 6.36 42.9305 3.816C45.6093 1.272 48.993 5.7929e-06 53.0816 6.15034e-06Z"
        fill="#1EE9B5"
      />
    </svg>
  );
}

function ArrowSquareRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 14L28 21L21 28M28 21H14M13.65 36.75H28.35C31.2903 36.75 32.7604 36.75 33.8834 36.1778C34.8713 35.6744 35.6744 34.8713 36.1778 33.8834C36.75 32.7604 36.75 31.2903 36.75 28.35V13.65C36.75 10.7097 36.75 9.23959 36.1778 8.11655C35.6744 7.1287 34.8713 6.32555 33.8834 5.82222C32.7604 5.25 31.2903 5.25 28.35 5.25H13.65C10.7097 5.25 9.23959 5.25 8.11655 5.82222C7.1287 6.32555 6.32555 7.1287 5.82222 8.11655C5.25 9.23959 5.25 10.7097 5.25 13.65V28.35C5.25 31.2903 5.25 32.7604 5.82222 33.8834C6.32555 34.8713 7.1287 35.6744 8.11655 36.1778C9.23959 36.75 10.7097 36.75 13.65 36.75Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Person = {
  src: string;
  name: string;
  role: string;
  quote: string;
};

// Index 0 is whoever starts at the center; 1-5 are the five ring slots,
// in the same order as SLOTS below.
const PEOPLE: Person[] = [
  {
    src: "/testimonials/photo-main.jpeg",
    name: "ATANU B.",
    role: "HR Assistant",
    quote:
      "The courses were highly useful and provided a solid understanding of essential topics such as fire safety, equality, diversity and inclusion, harassment and sexual misconduct, and prevent and radicalization. These topics are essential for fostering a safe, inclusive, and respectful working environment.",
  },
  {
    src: "/testimonials/photo-top.jpeg",
    name: "DAVID K.",
    role: "Compliance Officer",
    quote:
      "Juggling compliance training across a whole site used to eat my week. These self-paced courses let my team cover fire safety and risk procedures on their own schedule without pulling anyone off the floor.",
  },
  {
    src: "/testimonials/photo-left.jpeg",
    name: "MARK T.",
    role: "Operations Manager",
    quote:
      "I could study between meetings instead of blocking out a whole afternoon. The lessons were short and practical, so it actually fit around my real schedule.",
  },
  {
    src: "/testimonials/photo-right.jpeg",
    name: "RAHUL S.",
    role: "IT Support Lead",
    quote:
      "What stood out was how practical everything was. No filler, just clear examples I could apply the same day I finished a module.",
  },
  {
    src: "/testimonials/photo-bottom-left.jpeg",
    name: "JAMES O.",
    role: "Team Supervisor",
    quote:
      "The safeguarding modules gave my whole team a shared language for handling difficult situations. It's made our workplace noticeably safer and calmer.",
  },
  {
    src: "/testimonials/photo-bottom-right.jpeg",
    name: "DANIEL P.",
    role: "Training Coordinator",
    quote:
      "Having a recognised certificate at the end made the time investment worth it. It's already opened up a conversation about a promotion at work.",
  },
];

type Slot = {
  left: string;
  top: string;
  width: string;
  center?: boolean;
};

const SLOTS: Slot[] = [
  { left: "24.1%", top: "29.7%", width: "47.35%", center: true },
  { left: "37%", top: "0%", width: "16.85%" },
  { left: "0%", top: "31.3%", width: "11.15%" },
  { left: "84.5%", top: "42.1%", width: "15.45%" },
  { left: "7.65%", top: "76.5%", width: "17.4%" },
  { left: "71.6%", top: "80.4%", width: "13%" },
];

// The entire loop of all six slots — center plus the five ring slots, in
// the order they rotate through: the center slides out to "top" while
// the "left" slot's occupant slides into the center, and every slot in
// between shifts one step along, clockwise (top, right, bottom-right,
// bottom-left, left). Rotating this whole loop by one step is what makes
// every image in the circle move together, not just the pair swapping
// with the center.
const FULL_CYCLE = [0, 1, 3, 5, 4, 2];
const FORWARD_MAP: number[] = new Array(SLOTS.length);
FULL_CYCLE.forEach((slot, i) => {
  FORWARD_MAP[slot] = FULL_CYCLE[(i + 1) % FULL_CYCLE.length];
});
const BACKWARD_MAP: number[] = new Array(SLOTS.length);
FORWARD_MAP.forEach((to, from) => {
  BACKWARD_MAP[to] = from;
});

const AUTO_ADVANCE_MS = 6000;
const QUOTE_FADE_MS = 250;

const INITIAL_SLOT_OCCUPANT = [0, 1, 2, 3, 4, 5];

export default function Testimonials() {
  const [slotOccupant, setSlotOccupant] = useState(INITIAL_SLOT_OCCUPANT);
  const activePerson = slotOccupant[0];

  const [displayedPerson, setDisplayedPerson] = useState(activePerson);

  const advance = (direction: 1 | -1) => {
    const map = direction === 1 ? FORWARD_MAP : BACKWARD_MAP;
    setSlotOccupant((prev) => {
      const next = new Array(prev.length);
      prev.forEach((person, fromSlot) => {
        next[map[fromSlot]] = person;
      });
      return next;
    });
  };

  const intervalRef = useRef<number | null>(null);
  const resetAutoAdvance = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => advance(1), AUTO_ADVANCE_MS);
  };

  useEffect(() => {
    resetAutoAdvance();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived, not stored: the moment `activePerson` changes, this is
  // already true on the very next render (no extra setState needed), so
  // the quote can start fading out immediately. Once the timeout below
  // catches up `displayedPerson`, it settles back to false.
  const quoteTransitioning = activePerson !== displayedPerson;

  useEffect(() => {
    if (!quoteTransitioning) return;
    const timeout = window.setTimeout(() => {
      setDisplayedPerson(activePerson);
    }, QUOTE_FADE_MS);
    return () => window.clearTimeout(timeout);
  }, [activePerson, quoteTransitioning]);

  const handleNav = (direction: 1 | -1) => {
    advance(direction);
    resetAutoAdvance();
  };

  const featured = PEOPLE[displayedPerson];

  return (
    <section className="relative overflow-hidden bg-surface-dark py-16 lg:py-[90px]">
      <Bounded className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-[67px]">
        <div className="relative aspect-[718/703] w-full max-w-[500px] shrink-0 lg:w-[718px] lg:max-w-none">
          <div className="absolute left-[2.5%] top-[7.5%] size-[90%] overflow-hidden rounded-full border border-primary-500/30">
            <BackgroundGradientAnimation
              gradientBackgroundStart="rgb(6, 24, 11)"
              gradientBackgroundEnd="rgb(8, 33, 15)"
              blendingValue="screen"
              firstColor="30, 233, 181"
              secondColor="245, 166, 35"
              thirdColor="245, 166, 35"
              fourthColor="30, 233, 181"
              fifthColor="30, 233, 181"
              size="360px"
              spread={160}
              blurClassName="blur-lg"
              interactive={false}
              containerClassName="absolute inset-0 h-full w-full"
            />
          </div>

          {SLOTS.map((slot, slotIndex) => {
            const personIndex = slotOccupant[slotIndex];
            const person = PEOPLE[personIndex];
            return (
              <div
                key={personIndex}
                className={`absolute aspect-square overflow-hidden rounded-full border-surface-dark transition-all duration-700 ease-in-out ${
                  slot.center ? "z-10 border-4" : "border-2"
                }`}
                style={{ left: slot.left, top: slot.top, width: slot.width }}
              >
                <Image
                  alt={person.name}
                  src={person.src}
                  fill
                  sizes={
                    slot.center ? "(min-width: 1024px) 340px, 50vw" : "260px"
                  }
                  className="object-cover"
                />
              </div>
            );
          })}

          <div className="absolute left-[59.3%] top-[33.6%] flex size-[10.6%] items-center justify-center rounded-full bg-primary-700 z-10">
            <MessageCircleIcon className="size-1/2 text-on-dark" />
          </div>
        </div>

        <div className="flex w-full max-w-[815px] flex-col items-center gap-10 lg:gap-[70px]">
          <div className="flex w-full max-w-2xl flex-col items-start gap-4 text-left text-on-dark md:items-center md:text-center">
            <h2 className="type-h2 font-title font-semibold">
              What Our Learners Say
            </h2>
            <p className="type-lead">
              {`Don't just take our word for it. Hear from our learners who have transformed their skills and careers with educateU.`}
            </p>
          </div>

          <div className="flex flex-col items-center gap-5 text-center text-on-dark">
            <QuoteIcon className="size-9 text-primary-500 lg:size-[42px]" />
            <div
              className={`flex flex-col items-center gap-5 transition-opacity duration-300 ${
                quoteTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              <p className="font-title type-lead">
                {featured.quote}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-title type-h4 font-semibold">
                  {featured.name}
                </span>
                <span className="type-small">{featured.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous testimonial"
                className="flex items-center justify-center text-on-dark transition-colors hover:text-primary-500"
                onClick={() => handleNav(-1)}
              >
                <ArrowSquareRightIcon className="size-9 rotate-180 lg:size-[42px]" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                className="flex items-center justify-center text-on-dark transition-colors hover:text-primary-500"
                onClick={() => handleNav(1)}
              >
                <ArrowSquareRightIcon className="size-9 lg:size-[42px]" />
              </button>
            </div>
          </div>
        </div>
      </Bounded>
    </section>
  );
}
