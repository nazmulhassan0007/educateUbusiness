import Bounded from "@/components/layout/bounded/Bounded";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type WhyEducateUFeature = {
  icon: CmsAsset;
  title: string;
  description: string;
};

export type WhyEducateUContent = {
  title: string;
  sub_title: string;
  image_1: CmsAsset;
  image_2: CmsAsset;
  image_3: CmsAsset;
  features: WhyEducateUFeature[];
};

const DEFAULT_CONTENT: WhyEducateUContent = {
  title: "Why EducateU",
  sub_title:
    "Many online learning platforms make simple learning harder than it needs to be.",
  image_1: {
    url: "/about-us/photo-why-top.jpeg",
    alt: "Learner on a video call",
  },
  image_2: {
    url: "/about-us/photo-why-bottom-left.jpeg",
    alt: "Learner studying with headphones",
  },
  image_3: {
    url: "/about-us/photo-why-bottom-right.jpeg",
    alt: "Learner reading with headphones",
  },
  features: [
    {
      icon: { url: "/hero/icon-rocket.svg", alt: "" },
      title: "Clear enrolment with instant access",
      description: "Get started in minutes and begin learning without delays",
    },
    {
      icon: { url: "/hero/icon-calendar.svg", alt: "" },
      title: "Flexible learning that fits around work and life",
      description: "Learn on your schedule, from anywhere, anytime",
    },
    {
      icon: { url: "/hero/icon-award.svg", alt: "" },
      title: "Transparent outcomes and certification",
      description:
        "Know what you'll achieve and earn certifications you can trust",
    },
  ],
};

export default function WhyEducateU({
  data,
}: {
  data?: Partial<WhyEducateUContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f1fefa] to-white py-16 md:py-[100px]">
      <Bounded className="flex flex-col gap-8 md:gap-6">
        <div className="flex flex-col gap-8 md:gap-[42px] lg:flex-row lg:items-center lg:gap-[119px]">
          <div className="flex w-full flex-col gap-8 md:gap-14 lg:w-[43%]">
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-4">
              <SplitTextReveal
                as="h2"
                className="type-h2 font-title font-semibold text-primary-950"
              >
                {content.title}
              </SplitTextReveal>
              <SplitTextReveal
                as="p"
                delay={0.3}
                className="type-lead text-[#42697c]"
              >
                {content.sub_title}
              </SplitTextReveal>
            </div>

            <div className="flex flex-col gap-8 md:gap-[42px] lg:gap-8">
              {content.features.map((feature, index) => (
                <SlideUpReveal
                  key={feature.title}
                  delay={0.4 + index * 0.15}
                  className="flex items-center gap-6"
                  disableOnMobile
                >
                  <span className="flex size-[61px] shrink-0 items-center justify-center rounded-2xl bg-primary-500/15">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
                    <img
                      alt={feature.icon.alt}
                      className="size-6"
                      src={feature.icon.url}
                    />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-title type-h4 font-semibold text-primary-950">
                      {feature.title}
                    </h3>
                    <p className="type-body text-[#42697c]">
                      {feature.description}
                    </p>
                  </div>
                </SlideUpReveal>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 lg:w-[57%]">
            <SlideUpReveal
              delay={0.2}
              className="relative h-[220px] w-full overflow-hidden rounded-[24px] sm:h-[280px] md:h-[305px]"
              disableOnMobile
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
              <img
                alt={content.image_1.alt || "Learner on a video call"}
                src={content.image_1.url}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </SlideUpReveal>
            <div className="flex gap-6">
              <SlideUpReveal
                delay={0.35}
                className="relative h-[180px] w-1/2 overflow-hidden rounded-[24px] sm:h-[230px] md:h-[296px]"
                disableOnMobile
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
                <img
                  alt={
                    content.image_2.alt || "Learner studying with headphones"
                  }
                  src={content.image_2.url}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </SlideUpReveal>
              <SlideUpReveal
                delay={0.5}
                className="relative h-[180px] w-1/2 overflow-hidden rounded-[24px] sm:h-[230px] md:h-[296px]"
                disableOnMobile
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
                <img
                  alt={
                    content.image_3.alt || "Learner reading with headphones"
                  }
                  src={content.image_3.url}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </SlideUpReveal>
            </div>
          </div>
        </div>
      </Bounded>
    </section>
  );
}
