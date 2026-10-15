import Bounded from "@/components/layout/bounded/Bounded";
import GlassCard from "@/components/shared/glass-card/GlassCard";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type CompanyIntroCard = {
  text: string;
  image: CmsAsset;
};

export type CompanyIntroContent = {
  cards: CompanyIntroCard[];
};

const DEFAULT_CONTENT: CompanyIntroContent = {
  cards: [
    {
      image: {
        url: "/about-us/photo-card-1.jpeg",
        alt: "Learner studying online with a laptop",
      },
      text: "By leveraging innovative technologies and partnering with chartered membership organisations worldwide, we empower individuals to unlock and build upon their academic and professional pathways. Our mission is rooted in enabling learners to thrive as global citizens through meaningful educational experiences.",
    },
    {
      image: {
        url: "/about-us/photo-card-2.jpeg",
        alt: "Learners collaborating around a laptop",
      },
      text: "Formerly known as Online Qualifications, educateU has evolved into a dynamic global learning provider. We connect individuals with industry-recognised awarding bodies, expert tutors, and direct progression to degree programmes.",
    },
    {
      image: {
        url: "/about-us/photo-card-3.jpeg",
        alt: "Learners in a virtual meeting",
      },
      text: "From our state of the art virtual campus, we deliver high-quality learning that fits around life. Our learners, from diverse and vibrant backgrounds, are at the heart of our mission and the reason we are committed to educational excellence.",
    },
  ],
};

export default function CompanyIntro({
  data,
}: {
  data?: Partial<CompanyIntroContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="relative overflow-hidden bg-surface-dark py-12 lg:py-[70px]">
      <Bounded className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {content.cards.map((card, index) => (
          <SlideUpReveal
            key={card.image.url}
            delay={index * 0.15}
            className="h-full"
            disableOnMobile
          >
            <GlassCard
              className="flex h-full flex-col"
              contentClassName="flex h-full flex-col"
            >
              <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-t-[20px] sm:h-[415px] xl:h-[293px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided image (remote asset or local fallback) */}
                <img
                  alt={card.image.alt}
                  src={card.image.url}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="p-6 type-body text-on-dark xl:p-8">
                {card.text}
              </p>
            </GlassCard>
          </SlideUpReveal>
        ))}
      </Bounded>
    </section>
  );
}
