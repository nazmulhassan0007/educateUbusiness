import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import ExpandReveal from "@/components/shared/animation/ExpandReveal";
import { HeroGlowLines } from "@/components/ui/hero-glow-lines";
import { cn } from "@/lib/utils";
import type { Course } from "@/components/shared/course-card/CourseCard";
import HeroBackgroundVideo from "./HeroBackgroundVideo";
import HeroCourseSearch from "./HeroCourseSearch";

export type HeroCta = {
  url: string;
  text: string;
};

export type HeroContent = {
  title: string;
  sub_title: string;
  cta_1: HeroCta;
  cta_2: HeroCta;
  name: string;
  position: string;
  hero_quote: string;
  hero_video: string;
};

// Mirrors the previously hardcoded copy — used whenever the CMS "Hero"
// section is missing/unpublished, and as the base for any fields a CMS
// response doesn't include.
const DEFAULT_HERO: HeroContent = {
  title: "Skills without borders, Careers Without Limits!",
  sub_title:
    "At educateU, we empower lifelong learners through our online courses. Our mission is to help you grow professionally without barriers.",
  cta_1: { url: "/courses", text: "Explore Our Course" },
  cta_2: { url: "#watch-demo", text: "Watch Demo" },
  name: "Sophia L.",
  position: "CEO of Sophia Group LLC",
  hero_quote:
    "Cyber threats are increasing daily, and this course gave me the foundational knowledge I needed to protect sensitive data. It was well-structured and easy to follow, even for a beginner like me.",
  hero_video: "",
};

export default function Hero({
  data,
  hasAnnouncement = false,
  courses,
}: {
  data?: Partial<HeroContent>;
  hasAnnouncement?: boolean;
  courses?: Course[];
}) {
  const hero = { ...DEFAULT_HERO, ...data };

  return (
    <section
      className={cn(
        // No `overflow-hidden` here — the course search dropdown below is
        // an absolutely-positioned descendant that needs to be able to
        // extend past this section's bottom edge, over the next section,
        // instead of getting clipped at the boundary.
        "relative flex flex-col justify-end bg-surface-dark pb-30",
        // Negative margin tucks Hero behind the sticky navbar — only valid
        // when Hero is the first element after it. With an announcement bar
        // in between, that bar (not Hero) sits under the navbar, so pulling
        // Hero up the same amount would overlap and hide it instead.
        hasAnnouncement
          ? "min-h-[calc(100dvh-var(--navbar-height,4.5rem))] pt-10 sm:pt-10 md:pt-[100px] lg:pt-24"
          : "-mt-[var(--navbar-height,4.5rem)] min-h-dvh pt-[calc(var(--navbar-height,4.5rem)+4rem)] sm:pt-[calc(var(--navbar-height,4.5rem)+2.5rem)] md:pt-[calc(var(--navbar-height,4.5rem)+100px)] lg:pt-[calc(var(--navbar-height,4.5rem)+6rem)]",
      )}
    >
      {/* <HeroGlowLines /> */}
      <HeroBackgroundVideo src={hero.hero_video || "/hero/hero-video.mp4"} />

      {/* Tints the video for text legibility and fades it into the solid
          surface-dark bg at the top/bottom edges so it reads as one
          continuous surface with the navbar above and the next section
          below, instead of a hard-edged video box. */}
      <div
        aria-hidden
        className="absolute inset-0 z-1 bg-linear-to-b from-surface-dark via-surface-dark/55 to-surface-dark"
      />

      <Bounded className="relative z-10 flex w-full flex-col items-start gap-10 sm:gap-12 md:gap-16 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        {/* Left: title + primary CTA */}
        <div className="flex w-full flex-col items-start gap-6 sm:gap-7 md:gap-8 lg:w-1/2 lg:max-w-xl lg:gap-8 4xl:max-w-204.75">
          <SplitTextReveal
            as="h1"
            className="font-title type-display max-w-5xl text-left font-semibold text-on-dark"
          >
            {hero.title}
          </SplitTextReveal>

          {/* Sized by its label at every width. It used to stretch edge to
              edge below `sm`, which on a phone read as a banner rather than
              as the pill it is everywhere else on the site. */}
          <ExpandReveal delay={0.4}>
            <PrimaryButton
              label={hero.cta_1.text}
              href={hero.cta_1.url}
              icon="/hero/icon-arrow-right-mint.svg"
            />
          </ExpandReveal>
        </div>

        {/* Right: supporting copy + course search */}
        <div className="flex w-full flex-col items-start gap-8 sm:gap-10 lg:w-1/2 lg:max-w-xl lg:gap-21.25 4xl:max-w-155.25">
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-4xl text-left text-accent-50"
          >
            {hero.sub_title}
          </SplitTextReveal>

          <ExpandReveal delay={0.5} className="w-full">
            <HeroCourseSearch courses={courses} className="4xl:w-161.25" />
          </ExpandReveal>
        </div>
      </Bounded>
    </section>
  );
}
