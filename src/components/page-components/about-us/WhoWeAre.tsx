import Bounded from "@/components/layout/bounded/Bounded";
import GlassCard from "@/components/shared/glass-card/GlassCard";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type WhoWeArePillar = {
  icon: CmsAsset;
  title: string;
  description: string;
};

export type WhoWeAreContent = {
  title: string;
  sub_title: string;
  image: CmsAsset;
  pillars: WhoWeArePillar[];
  goal_icon: CmsAsset;
  goal_title: string;
};

const TARGET_ICON: CmsAsset = { url: "/about-us/icon-target.svg", alt: "" };

const DEFAULT_CONTENT: WhoWeAreContent = {
  title: "Who We Are",
  sub_title:
    "EducateU is an online learning platform designed to make education more accessible, flexible, and straightforward.",
  image: {
    url: "/about-us/photo-who-we-are.jpeg",
    alt: "Learners collaborating in a classroom",
  },
  pillars: [
    {
      icon: TARGET_ICON,
      title: "Our Mission",
      description:
        "To make quality education accessible, achievable, and aligned with today's professional landscape, with a mission to empower individuals to shape their own success through learning, while improving the overall learner experience and providing individual support to help every learner succeed with confidence and clarity.",
    },
    {
      icon: TARGET_ICON,
      title: "Vision",
      description:
        "To make high-quality, UK-accredited education globally accessible by connecting students, universities, and employers, delivering flexible online learning that empowers growth and removes barriers to recognized qualifications.",
    },
    {
      icon: TARGET_ICON,
      title: "Our Values",
      description:
        "To lead the way in accessible, globally recognised online learning, creating a world where every individual has the opportunity to learn, grow, and succeed, regardless of their background or location.",
    },
  ],
  goal_icon: { url: "/about-us/icon-target.svg", alt: "" },
  goal_title:
    "Our goal is to provide clear, affordable, self-serve learning that fits into real lives and real working schedules.",
};

function IconBadge({ icon }: { icon: CmsAsset }) {
  return (
    <span className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl border border-white/9 bg-[rgba(137,137,137,0.05)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
      <img alt={icon.alt} className="size-6" src={icon.url} />
    </span>
  );
}

export default function WhoWeAre({
  data,
}: {
  data?: Partial<WhoWeAreContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const [mission, ...rest] = content.pillars;

  return (
    <section className="relative overflow-hidden bg-surface-dark pb-16 lg:pb-[100px]">
      <Bounded className="flex flex-col items-start gap-8 md:items-center lg:gap-[42px]">
        {/* <div className="flex flex-col items-start gap-3 text-left md:items-center md:text-center">
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
            {content.sub_title}
          </SplitTextReveal>
        </div> */}

        <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-stretch">
          <SlideUpReveal className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-[20px] sm:h-[360px] md:h-[479px] lg:h-[525px] xl:h-auto xl:w-[49%]">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
            <img
              alt={content.image.alt || "Learners collaborating in a classroom"}
              src={content.image.url}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </SlideUpReveal>

          <div className="flex w-full flex-col gap-6 xl:w-[51%]">
            <SlideUpReveal delay={0.15} disableOnMobile>
              <GlassCard contentClassName="flex h-full flex-col justify-center gap-4 p-6 md:gap-[31px] xl:gap-4 xl:p-8">
                <IconBadge icon={mission.icon} />
                <div className="flex flex-col gap-3 md:gap-[14px]">
                  <h3 className="font-title type-h4 font-bold text-surface-white">
                    {mission.title}
                  </h3>
                  <p className="type-small font-light text-on-dark">
                    {mission.description}
                  </p>
                </div>
              </GlassCard>
            </SlideUpReveal>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
              {rest.map((pillar, index) => (
                <SlideUpReveal
                  key={pillar.title}
                  delay={0.3 + index * 0.15}
                  className="w-full"
                  disableOnMobile
                >
                  <GlassCard
                    className="w-full sm:h-full"
                    contentClassName="flex h-full flex-col justify-center gap-4 p-6 md:gap-[31px] md:px-[18px] md:py-[35px] xl:gap-4 xl:p-6"
                  >
                    <IconBadge icon={pillar.icon} />
                    <div className="flex flex-col gap-3 md:gap-[14px]">
                      <h3 className="font-title type-h4 font-bold text-surface-white">
                        {pillar.title}
                      </h3>
                      <p className="type-small font-light text-on-dark">
                        {pillar.description}
                      </p>
                    </div>
                  </GlassCard>
                </SlideUpReveal>
              ))}
            </div>
          </div>
        </div>

        <SlideUpReveal delay={0.2} disableOnMobile>
          <GlassCard contentClassName="flex flex-col items-start gap-6 p-8 text-left md:flex-row md:items-center md:px-[18px] md:py-14 lg:gap-6 lg:px-[83px] lg:py-[62px]">
            <span className="flex size-[82px] shrink-0 items-center justify-center rounded-2xl border border-white/9 bg-[rgba(137,137,137,0.05)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
              <img
                alt={content.goal_icon.alt}
                className="size-9"
                src={content.goal_icon.url}
              />
            </span>
            <div
              className="type-h3 text-on-dark"
              dangerouslySetInnerHTML={{ __html: content.goal_title }}
            />
          </GlassCard>
        </SlideUpReveal>
      </Bounded>
    </section>
  );
}
