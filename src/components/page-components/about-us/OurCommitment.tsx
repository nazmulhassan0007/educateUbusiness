import Bounded from "@/components/layout/bounded/Bounded";
import GlassCard from "@/components/shared/glass-card/GlassCard";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type Commitment = {
  icon: CmsAsset;
  label: string;
};

export type OurCommitmentContent = {
  title: string;
  description: string;
  sub_title: string;
  commitment: Commitment[];
};

const DEFAULT_CONTENT: OurCommitmentContent = {
  title: "Our Commitment",
  description: "Accessible. Professional. Built for Real-World Growth.",
  sub_title: "When you choose educateU, you can expect:",
  commitment: [
    {
      icon: { url: "/our-commitment/icon-trending-up.svg", alt: "" },
      label: "Career-Focused Progression",
    },
    {
      icon: { url: "/our-commitment/icon-newspaper.svg", alt: "" },
      label: "Industry Relevant Content",
    },
    {
      icon: { url: "/our-commitment/icon-book.svg", alt: "" },
      label: "Dedicated Learner Support",
    },
    {
      icon: { url: "/our-commitment/icon-cash.svg", alt: "" },
      label: "Transparent & Fair Pricing",
    },
    {
      icon: { url: "/our-commitment/icon-laptop.svg", alt: "" },
      label: "Flexible Online Access",
    },
    {
      icon: { url: "/our-commitment/icon-school.svg", alt: "" },
      label: "Seamless Digital Experience",
    },
  ],
};

export default function OurCommitment({
  data,
}: {
  data?: Partial<OurCommitmentContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-[100px]">
      <Bounded className="flex flex-col items-start gap-8 md:items-center lg:gap-[42px]">
        <div className="flex flex-col items-start gap-3 text-left md:items-center md:text-center">
          <SplitTextReveal
            as="h2"
            className="type-h2 font-title font-semibold text-primary-950"
          >
            {content.title}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-3xl text-[#42697c]"
          >
            {content.description}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.45}
            className="max-w-3xl font-title type-h3 font-semibold text-primary-700"
          >
            {content.sub_title}
          </SplitTextReveal>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.commitment.map((commitment, index) => (
            <SlideUpReveal
              key={commitment.label}
              delay={Math.min(index * 0.15, 0.6)}
              disableOnMobile
            >
              <GlassCard
                variant="light"
                className="h-[277px]"
                contentClassName="flex h-full flex-col items-center justify-center gap-8 p-6 text-center"
              >
                <span className="flex size-16 shrink-0 items-center justify-center">
                  {/* Recolored via CSS mask rather than an <img>: the icon's
                      own SVG fill/stroke colors don't matter, since the mask
                      only uses its shape — `background-color` (black at
                      rest, mint on hover) is what actually paints it. */}
                  <span
                    role="img"
                    aria-label={commitment.icon.alt}
                    className="size-10 shrink-0 mask-center mask-contain mask-no-repeat bg-[#040e07] transition-colors duration-300 group-hover:bg-primary-700"
                    style={{
                      maskImage: `url(${commitment.icon.url})`,
                      WebkitMaskImage: `url(${commitment.icon.url})`,
                    }}
                  />
                </span>
                <h3 className="font-title type-h4 font-bold text-[#040e07] transition-colors duration-300 group-hover:text-primary-700">
                  {commitment.label}
                </h3>
              </GlassCard>
            </SlideUpReveal>
          ))}
        </div>
      </Bounded>
    </section>
  );
}
