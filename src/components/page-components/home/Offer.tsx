import Image from "next/image";
import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import { EdgeGradientAnimation } from "@/components/ui/edge-gradient-animation";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";
import ExpandReveal from "@/components/shared/animation/ExpandReveal";
import OfferCountdown from "./OfferCountdown";
import OfferAddToCartButton from "./OfferAddToCartButton";
import type { ApiBundle } from "@/lib/courses/loaders";
import { bundleToCartCourse } from "@/lib/courses/mappers";
import type { Course } from "@/components/shared/course-card/CourseCard";
import { formatPrice } from "@/lib/utils";

function MetaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex size-10 items-center justify-center rounded-[10px] border border-white/9 bg-primary-700/30 backdrop-blur-[75px]">
        <img alt="" className="size-6" src={icon} />
      </span>
      <p className="type-body text-on-dark">{label}</p>
    </div>
  );
}

export type OfferContent = {
  title: string;
  description: string;
};

const DEFAULT_OFFER: OfferContent = {
  title: "Exclusive Bundle Offer",
  description:
    "At educateU, we empower lifelong learners through our online courses. Our mission is to help you grow professionally without barriers.",
};

// Used only when the bundles API returns nothing — the original hand-built
// course card this section always showed.
const DEFAULT_BUNDLE = {
  imageUrl: "/offer/course-photo.png",
  certificationBadge: "BCS CERTIFIED",
  ratingText: "20+ Student Rated 5 Star",
  title: "Classroom Crisis Intervention Training",
  description:
    "This online CPD-certified course is designed to equip educators, school staff, and administrators with the practical skills and knowledge required to effectively respond",
  durationLabel: "60-90 minutes",
  deliveryMode: "Online (Self-study)",
  previewHref: "/courses/classroom-crisis-intervention/preview",
  cartCourse: {
    slug: "classroom-crisis-intervention",
    title: "Classroom Crisis Intervention Training",
    description:
      "This online CPD-certified course is designed to equip educators, school staff, and administrators with the practical skills and knowledge required to effectively respond",
    price: 120,
    originalPrice: 160,
  } satisfies Course,
};

export default function Offer({
  data,
  bundle,
}: {
  data?: Partial<OfferContent>;
  bundle?: ApiBundle;
}) {
  const offer = { ...DEFAULT_OFFER, ...data };

  const imageUrl = bundle?.image?.url || DEFAULT_BUNDLE.imageUrl;
  const certificationBadge =
    bundle?.certificationBadge || DEFAULT_BUNDLE.certificationBadge;
  const ratingText = bundle?.ratingText || DEFAULT_BUNDLE.ratingText;
  const title = bundle?.title || DEFAULT_BUNDLE.title;
  const description = bundle?.description || DEFAULT_BUNDLE.description;
  const durationLabel = bundle?.durationLabel || DEFAULT_BUNDLE.durationLabel;
  const deliveryMode = bundle?.deliveryMode || DEFAULT_BUNDLE.deliveryMode;
  // The original hardcoded demo link is kept only for the no-bundle-data
  // fallback case.
  const previewHref = bundle
    ? `/bundles/${bundle.slug}`
    : DEFAULT_BUNDLE.previewHref;

  const price = bundle?.price ? Number(bundle.price) : null;
  const originalPrice = bundle?.originalPrice
    ? Number(bundle.originalPrice)
    : null;

  // The bundle itself becomes a single cart line item — its own slug,
  // title, and (discounted) price, rather than each included course added
  // separately at its own individual price.
  const cartCourse: Course = bundle
    ? bundleToCartCourse(bundle)
    : DEFAULT_BUNDLE.cartCourse;

  return (
    <section className="relative overflow-hidden bg-surface-dark py-[90px]">
      <Bounded className="relative flex flex-col items-center gap-[43px]">
        <div className="flex flex-col items-start gap-2 text-left text-on-dark md:items-center md:text-center">
          <SplitTextReveal
            as="h2"
            className="type-h2 font-title max-w-4xl font-semibold"
          >
            {offer.title}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-3xl"
          >
            {offer.description}
          </SplitTextReveal>
        </div>

        <SlideUpReveal delay={0.4} className="w-full 2xl:w-[95%]">
          <div className="relative overflow-hidden rounded-[30px]">
            <EdgeGradientAnimation
              gradientBackgroundStart="rgb(6, 24, 11)"
              gradientBackgroundEnd="rgb(8, 33, 15)"
              blendingValue="screen"
              firstColor="34, 197, 94"
              secondColor="250, 204, 21"
              thirdColor="34, 211, 238"
              fourthColor="250, 204, 21"
              fifthColor="34, 197, 94"
              blurClassName="blur-2xl"
              fadeStart={40}
              interactive={false}
              containerClassName="absolute inset-0 h-full w-full"
            />

            <div className="relative z-10 overflow-hidden rounded-[30px] bg-[rgba(137,137,137,0.08)] px-5 py-6 backdrop-blur-[40px] md:px-8 2xl:p-8">
              {bundle?.offerEndsAt && <OfferCountdown endsAt={bundle.offerEndsAt} />}

              <div className="flex flex-col gap-[42px] pt-10 2xl:flex-row 2xl:items-center 2xl:pt-0">
                <div className="relative aspect-auto h-[503px] w-full shrink-0 overflow-hidden rounded-2xl 2xl:aspect-[517/503] 2xl:h-auto 2xl:w-[517px]">
                  <Image
                    alt={title}
                    src={imageUrl}
                    fill
                    sizes="(min-width: 1440px) 517px, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex w-full flex-col items-start gap-6">
                  <div className="flex w-full flex-col items-start gap-[18px] md:flex-row md:flex-wrap md:items-center">
                    <span className="shrink-0 rounded-[7px] bg-primary-500/15 px-4 py-2 type-caption text-primary-500">
                      {certificationBadge}
                    </span>
                    <div className="flex flex-col items-start gap-[9px] md:flex-row md:items-center">
                      <img
                        alt="5 stars"
                        className="h-[27px] w-[135px]"
                        src="/offer/stars-rating.svg"
                      />
                      <p className="type-small text-surface-white">{ratingText}</p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-9">
                    <div className="flex flex-col gap-3 text-on-dark">
                      <h3 className="font-title type-h3 font-semibold">
                        {title}
                      </h3>
                      <p className="type-body">{description}</p>
                    </div>

                    <hr className="border-t border-white/10" />

                    <div className="flex flex-col items-start gap-[42px] md:flex-row md:flex-wrap md:items-center">
                      <MetaItem
                        icon="/offer/icon-clock.svg"
                        label={durationLabel}
                      />
                      <MetaItem
                        icon="/offer/icon-book-closed.svg"
                        label={deliveryMode}
                      />
                    </div>

                    {price !== null && (
                      <div className="flex items-center gap-3">
                        <span className="type-h3 font-semibold text-on-dark">
                          {formatPrice(price)}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <span className="type-body font-light text-[#f08083] line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-[18px] md:w-auto md:flex-row md:flex-wrap md:items-center">
                    <ExpandReveal delay={0.6}>
                      <OfferAddToCartButton
                        course={cartCourse}
                        className="w-full justify-center md:w-auto"
                      />
                    </ExpandReveal>
                    <ExpandReveal delay={0.7}>
                      <PrimaryButton
                        label="Preview Course"
                        href={previewHref}
                        icon="/offer/icon-arrow-right-dark.svg"
                        variant="outlinePrimary"
                        className="w-full justify-center md:w-auto"
                      />
                    </ExpandReveal>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SlideUpReveal>
      </Bounded>
    </section>
  );
}
