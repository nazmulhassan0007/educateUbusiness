import Bounded from "@/components/layout/bounded/Bounded";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import ExpandReveal from "@/components/shared/animation/ExpandReveal";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type BenefitItem = {
  icon: CmsAsset;
  title: string;
  description: string;
};

export type BenefitsContent = {
  title: string;
  sub_title: string;
  image: CmsAsset;
  benefits: BenefitItem[];
};

// Fixed grid slot per array position — a structural/layout decision, not
// content, so it stays in code rather than coming from the CMS.
const GRID_POSITIONS = [
  "xl:col-start-1 xl:row-start-1",
  "xl:col-start-1 xl:row-start-2",
  "xl:col-start-3 xl:row-start-1",
  "xl:col-start-3 xl:row-start-2",
];

const DEFAULT_CONTENT: BenefitsContent = {
  title: "Why choose our Courses",
  sub_title:
    "At educateU, we empower lifelong learners through affordable, accessible courses. Our mission is to help you grow professionally without barriers.",
  image: {
    url: "/all-courses/graphic-benefits-center.png",
    alt: "Decorative 3D graphic",
  },
  benefits: [
    {
      icon: { url: "/why-choose/icon-shield.svg", alt: "" },
      title: "Expert-Led Learning",
      description:
        "Learn from industry professionals with extensive experience and knowledge in their fields. Our course instructors provide real-world insights to enhance your understanding.",
    },
    {
      icon: { url: "/all-courses/icon-supportive-community.svg", alt: "" },
      title: "Supportive Community",
      description:
        "Join a vibrant community of learners. Engage with peers, share insights, and collaborate on projects to further enrich your learning experience.",
    },
    {
      icon: { url: "/all-courses/icon-immediate-access.png", alt: "" },
      title: "Immediate Access",
      description:
        "Enroll today and gain instant access to all course materials. Start learning right away without waiting for course commencement.",
    },
    {
      icon: { url: "/all-courses/icon-affordable-pricing.svg", alt: "" },
      title: "Affordable Pricing",
      description:
        "We provide high-quality education that won't break the bank, making professional development accessible for everyone.",
    },
  ],
};

function BenefitCard({
  icon,
  title,
  description,
  className = "",
}: BenefitItem & { className?: string }) {
  return (
    <div
      className={`relative h-[364px] w-full overflow-hidden rounded-[30px] border border-white/9 lg:h-[306px] xl:h-[364px] ${className}`}
    >
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(6, 24, 11)"
        gradientBackgroundEnd="rgb(8, 33, 15)"
        blendingValue="screen"
        firstColor="30, 233, 181"
        secondColor="245, 166, 35"
        thirdColor="235, 245, 35"
        fourthColor="235, 245, 35"
        fifthColor="30, 233, 181"
        size="220px"
        spread={220}
        blurClassName="blur-lg"
        interactive={false}
        containerClassName="absolute inset-0 h-full w-full"
      />
      <div
        className="absolute inset-0 bg-[rgba(137,137,137,0.05)] backdrop-blur-[75px]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8 lg:p-[27px] xl:p-8">
        <span className="relative flex size-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/9 bg-[rgba(137,137,137,0.05)] p-[18px] lg:size-[60px] lg:p-[15px] xl:size-[72px] xl:p-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
          <img
            alt={icon.alt}
            className="relative size-9 lg:size-[30px] xl:size-9"
            src={icon.url}
          />
        </span>
        <div className="flex flex-col gap-[22px] text-surface-white lg:gap-[18px] xl:gap-[22px]">
          <h3 className="font-title type-h4 font-bold">
            {title}
          </h3>
          <p className="type-body font-light text-accent-50">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Benefits({
  data,
}: {
  data?: Partial<BenefitsContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="relative overflow-hidden bg-surface-dark py-16 lg:py-[100px]">
      <Bounded className="flex flex-col items-start gap-12 md:items-center lg:gap-[42px] xl:gap-12">
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
            className="type-lead max-w-5xl text-accent-50"
          >
            {content.sub_title}
          </SplitTextReveal>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
          <div className="relative order-first h-[280px] w-full overflow-hidden rounded-2xl bg-[#062f24] sm:h-[400px] lg:col-span-2 lg:h-[420px] xl:order-none xl:col-span-1 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:h-auto">
            <div className="animate-float absolute inset-0">
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
                <img
                  alt={content.image.alt || "Decorative 3D graphic"}
                  src={content.image.url}
                  className="absolute inset-0 h-full w-full object-contain xl:object-cover"
                />
              </div>
            </div>
          </div>

          {content.benefits.map((benefit, index) => (
            <ExpandReveal
              key={benefit.title}
              duration={1.2}
              ease="power3.out"
              className={GRID_POSITIONS[index]}
              disableOnMobile
            >
              <BenefitCard {...benefit} />
            </ExpandReveal>
          ))}
        </div>
      </Bounded>
    </section>
  );
}
