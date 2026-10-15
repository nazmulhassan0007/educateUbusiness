import type { CSSProperties } from "react";
import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { cn } from "@/lib/utils";

type CmsAsset = {
  url: string;
  alt: string;
};

export type WhyChooseUsCard = {
  icon: CmsAsset;
  title: string;
  description: string;
};

export type WhyChooseUsContent = {
  title: string;
  description: string;
  cta: { url: string; text: string };
  cards: WhyChooseUsCard[];
};

const DEFAULT_CONTENT: WhyChooseUsContent = {
  title: "Why Choose EducateU",
  description:
    "At educateU, we empower lifelong learners through our online courses. Our mission is to help you grow professionally without barriers.",
  cta: { url: "#", text: "Learn more" },
  cards: [
    {
      icon: { url: "/why-choose/icon-shield.svg", alt: "" },
      title: "UK Recognised Qualifications",
      description:
        "Earn qualifications recognised by employers and institutions worldwide.",
    },
    {
      icon: { url: "/why-choose/icon-shield.svg", alt: "" },
      title: "Flexible Learning",
      description: "Study flexibly from anywhere.",
    },
    {
      icon: { url: "/why-choose/icon-shield.svg", alt: "" },
      title: "Learner Support",
      description: "Guidance and assistance throughout the learning journey.",
    },
  ],
};

function FeatureCard({
  card,
  index,
  className,
}: {
  card: WhyChooseUsCard;
  index: number;
  className?: string;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl border border-[#21ebbc] p-6 transition-colors duration-500 hover:border-[#1ee9b5] lg:gap-[clamp(1.5rem,3.5svh,2.5rem)] lg:p-[clamp(1.5rem,3svh,2rem)]",
        className,
      )}
    >
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(255, 255, 255)"
        gradientBackgroundEnd="rgb(241, 254, 250)"
        blendingValue="multiply"
        firstColor="30, 233, 181"
        secondColor="24, 186, 145"
        thirdColor="30, 233, 181"
        fourthColor="24, 186, 145"
        fifthColor="30, 233, 181"
        pointerColor="30, 233, 181"
        size="200px"
        spread={110}
        blurClassName="blur-2xl"
        interactive
        containerClassName="absolute inset-0 h-full w-full"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-[75px]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full items-start justify-between">
        <span className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-b from-[#083f31] to-[#15a580] lg:size-24">
          <span
            className="pointer-events-none absolute left-6 top-6 size-[34px] rounded-full bg-primary-500/40 blur-xl"
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
          <img
            alt={card.icon.alt}
            className="relative size-8 lg:size-9"
            src={card.icon.url}
          />
        </span>

        <p
          className="pointer-events-none bg-linear-to-b from-[#118366] to-[#1ee9b5] bg-clip-text font-title type-stat font-semibold text-transparent opacity-50"
          aria-hidden
        >
          {number}
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="font-title type-h4 font-semibold text-[#020a04]">
          {card.title}
        </h3>
        <p className="type-body font-light text-[#020a04]">
          {card.description}
        </p>
      </div>
    </div>
  );
}

export default function WhyChooseUs({
  data,
}: {
  data?: Partial<WhyChooseUsContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section
      // Sticky (not just `relative`) from `lg` up, so this section stays
      // pinned below the navbar as the page keeps scrolling — the next
      // section (EverythingYouNeed), sitting right after this one in normal
      // flow with a higher z-index and an opaque background, slides up over
      // it. Offset by `--navbar-height` (see Navbar.tsx) rather than `top-0`
      // so it sticks just under the sticky navbar instead of behind it.
      //
      // The two lengths below are what give the section its own moment
      // before that hand-off. The next section's top edge sits at this
      // section's bottom edge, so without them the cover starts the instant
      // the cards finish arriving — on a laptop it had already started
      // before the section parked, which left the three cards cut off at
      // the fold, frozen, and covered from below without ever getting a
      // frame on their own.
      //
      //   --wcu-dwell  extra bottom padding, and nothing else: scroll
      //                distance between the cards being fully visible and
      //                the next section's top edge reaching the fold. It is
      //                below the fold the whole time it is being consumed,
      //                so the reader just sees the complete section hold
      //                still for that long before the cover starts.
      //   --wcu-pad    keeps the design's 90px band on any viewport tall
      //                enough to hold it and trims it on short laptops,
      //                where those 180px are the difference between the
      //                cards clearing the fold and not. The stack gap and
      //                the cards' own padding scale the same way, for the
      //                same reason: parked under the navbar this section
      //                gets only what the viewport has left (~720px on a
      //                13" MacBook), and the three cards are the part that
      //                falls off the bottom when it doesn't fit.
      //
      // Both are padding rather than a `min-height`: forcing the box to
      // fill the screen does buy a gapless park, but on a tall monitor the
      // slack has to go somewhere, and centering it opened a few hundred
      // pixels of empty gradient above the title. A tall viewport doesn't
      // need the help anyway — the section clears the navbar with room to
      // spare there, so all it needs is the dwell.
      //
      // Sticky is dropped below `lg` (where EverythingYouNeed doesn't run
      // its pinned reveal either): a phone viewport can't hold this section
      // at any padding, so freezing it there could only hide the half the
      // reader hasn't reached yet.
      //
      // `will-change-transform` promotes the parked section to its own
      // compositor layer. Smooth scrolling (Lenis, see SmoothScroll.tsx)
      // puts the page at fractional scroll offsets, and a `sticky` element
      // that the compositor is *not* holding gets its position recomputed
      // and snapped to whole pixels every frame — which is visible as the
      // parked text vibrating against the next section sliding smoothly
      // over it. On its own layer it is moved, not re-snapped.
      className="relative z-0 overflow-hidden bg-linear-to-b from-white to-[#f1fefa] py-16 lg:sticky lg:top-[var(--navbar-height,120px)] lg:pt-[var(--wcu-pad)] lg:pb-[calc(var(--wcu-pad)+var(--wcu-dwell))] lg:will-change-transform"
      style={
        {
          "--wcu-pad": "clamp(2.25rem, 8svh, 5.625rem)",
          "--wcu-dwell": "25svh",
        } as CSSProperties
      }
    >
      <Bounded className="flex flex-col items-center gap-8 lg:gap-[clamp(1.25rem,3.4svh,2.0625rem)]">
        <div className="flex max-w-[605px] flex-col items-center gap-4 text-center text-primary-950">
          <h2 className="type-h2 font-title font-semibold">
            {content.title}
          </h2>
          <p className="type-lead text-[#42697c]">
            {content.description}
          </p>
        </div>

        <PrimaryButton label={content.cta.text} href={content.cta.url} />

        {/* Each card rises into place on its own clock rather than being
            carried up by the raw scroll position.

            Left to plain scrolling the cards travelled 1:1 with the wheel
            and then stopped dead the instant the section parked (see the
            `sticky` note above) — velocity going from "whatever you were
            scrolling at" to zero in a single frame, with nothing easing it
            out. That hard cut is what read as the cards jumping up from the
            bottom and then the page hanging.

            A timed reveal (`SlideUpReveal` is `once: true`, `power3.out`)
            decouples them from scroll speed, so they always decelerate into
            their resting position, and — because it is still playing as the
            section parks — it also carries the eye through the first part of
            the dwell instead of handing the reader a frozen screen.
            Deliberately NOT a scrubbed ScrollTrigger: this section is
            `position: sticky`, and ScrollTrigger measures a trigger's
            document offset at refresh time with no awareness of that, so a
            refresh landing while the section is parked would compute the
            scrub window against the stuck position.

            Staggered by index so the three read as one sweep left to right
            rather than three cards moving in lockstep. */}
        <div className="grid w-full gap-6 lg:grid-cols-3 lg:items-stretch">
          {content.cards.map((card, index) => (
            <SlideUpReveal
              key={card.title}
              className="h-full"
              distance={80}
              duration={0.9}
              delay={index * 0.12}
              disableOnMobile
            >
              <FeatureCard card={card} index={index} className="h-full" />
            </SlideUpReveal>
          ))}
        </div>
      </Bounded>
    </section>
  );
}
