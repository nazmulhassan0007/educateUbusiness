import Bounded from "@/components/layout/bounded/Bounded";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type CmsAsset = {
  url: string;
  alt: string;
};

export type ContactInfoCard = {
  icon: CmsAsset;
  email: string;
  title: string;
  description: string;
};

export type ContactInfoContent = {
  cards: ContactInfoCard[];
};

const MAIL_ICON: CmsAsset = { url: "/contact-us/icon-mail.svg", alt: "" };

const DEFAULT_CONTENT: ContactInfoContent = {
  cards: [
    {
      icon: MAIL_ICON,
      title: "General Enquiries",
      description:
        "For non-learner enquiries or organisational information, you can contact educateU using the details below.",
      email: "hello@educateU.com",
    },
    {
      icon: MAIL_ICON,
      title: "Partnerships",
      description:
        "<p>If you are interested in collaborating with educateU, including content partnerships or organisational learning opportunities, please use the below email:</p><p>Please include a brief outline of your enquiry so it can be directed to the right team.</p>",
      email: "partnerships@educateU.com",
    },
  ],
};

function EmailRow({ email, icon }: { email: string; icon: CmsAsset }) {
  return (
    <div className="mt-auto flex items-center gap-[18px] pt-10">
      <span className="flex size-[46px] shrink-0 items-center justify-center rounded-full border-2 border-[#d9d9d9]">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-provided icon (remote asset or local fallback) */}
        <img alt={icon.alt} src={icon.url} className="h-[18px] w-[22px]" />
      </span>
      <a
        href={`mailto:${email}`}
        className="font-title type-h4 font-semibold text-on-dark underline decoration-solid underline-offset-4 transition-colors hover:text-primary-500"
      >
        {email}
      </a>
    </div>
  );
}

export default function ContactInfo({
  data,
}: {
  data?: Partial<ContactInfoContent>;
}) {
  const content = { ...DEFAULT_CONTENT, ...data };

  return (
    <section className="bg-surface-dark py-16 lg:py-20">
      <Bounded className="grid grid-cols-1 gap-6 2xl:auto-rows-fr 2xl:grid-cols-2">
        {content.cards.map((card, index) => (
          <SlideUpReveal
            key={card.title}
            delay={index * 0.15}
            className="flex flex-col rounded-[20px] bg-primary-900 px-4 py-8 md:pl-8 md:pr-[46px]"
            disableOnMobile
          >
            <div className="flex flex-col gap-4">
              <h2 className="font-title type-h3 font-semibold text-on-dark">
                {card.title}
              </h2>
              <div
                className="type-body text-[#a8c8d8] [&>p+p]:mt-4"
                dangerouslySetInnerHTML={{ __html: card.description }}
              />
            </div>
            <EmailRow email={card.email.trim()} icon={card.icon} />
          </SlideUpReveal>
        ))}
      </Bounded>
    </section>
  );
}
