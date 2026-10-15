import Bounded from "@/components/layout/bounded/Bounded";
import GlassCard from "@/components/shared/glass-card/GlassCard";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type Audience = {
  icon: CmsAsset;
  label: string;
};

export type WhoItsForContent = {
  title: string;
  description: string;
  audience: Audience[];
};

const DEFAULT_CONTENT: WhoItsForContent = {
  title: "Who educateU is for",
  description:
    "Courses are written in plain, professional language and are suitable for learners with varied backgrounds and experience levels.",
  audience: [
    {
      icon: { url: "/who-its-for/icon-briefcase.svg", alt: "" },
      label: "Working Professionals",
    },
    {
      icon: { url: "/who-its-for/icon-swap.svg", alt: "" },
      label: "Career Changer",
    },
    {
      icon: { url: "/who-its-for/icon-people.svg", alt: "" },
      label: "Early-Career Professional",
    },
    {
      icon: { url: "/who-its-for/icon-globe.svg", alt: "" },
      label: "International Learners",
    },
  ],
};

export default function WhoItsFor({
  data,
}: {
  data?: Partial<WhoItsForContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="relative overflow-hidden bg-surface-dark-2  py-16 lg:py-[100px]">
      <Bounded className="flex flex-col items-start gap-8 md:items-center lg:gap-[42px]">
        <div className="flex flex-col items-start gap-3 text-left md:items-center md:text-center">
          <SplitTextReveal
            as="h2"
            className="type-h2 font-title font-semibold text-surface-white"
          >
            {content.title}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-3xl text-on-dark"
          >
            {content.description}
          </SplitTextReveal>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.audience.map((audience, index) => (
            <SlideUpReveal
              key={audience.label}
              delay={Math.min(index * 0.15, 0.6)}
              disableOnMobile
            >
              <GlassCard
                className="h-[260px]"
                contentClassName="flex h-full flex-col items-center justify-start gap-8 px-6 pb-6 pt-12 text-center"
                gradientBackgroundStart="rgb(8, 63, 49)"
                gradientBackgroundEnd="rgb(21, 165, 128)"
              >
                <span className="flex size-[64px] shrink-0 items-center justify-center rounded-2xl border border-white/9 bg-[rgba(137,137,137,0.05)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
                  <img
                    alt={audience.icon.alt}
                    className="size-8"
                    src={audience.icon.url}
                  />
                </span>
                <h3 className="font-title type-h4 font-bold text-surface-white">
                  {audience.label}
                </h3>
              </GlassCard>
            </SlideUpReveal>
          ))}
        </div>
      </Bounded>
    </section>
  );
}
