import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SupportBanner, { type SupportBannerContent, type SupportTopic } from "@/components/page-components/support-hub/SupportBanner";
import HowItWorks, { type HowItWorksContent } from "@/components/page-components/support-hub/HowItWorks";
import HubFaq, { type HubFaqContent } from "@/components/page-components/support-hub/HubFaq";
import RefundPolicy, { type RefundPolicyContent } from "@/components/page-components/support-hub/RefundPolicy";
import GetInTouch, { type GetInTouchContent } from "@/components/page-components/support-hub/GetInTouch";
import CommonSection from "@/components/shared/CommonSection";
import NoSectionFound from "@/components/shared/NoSectionFound";
import { getSupportHubPage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

const FALLBACK_METADATA = {
  title: "Support Hub | educateU",
  description:
    "Find answers about enrolment, course access, certificates, refunds, and how to get in touch with the educateU support team.",
};

type SupportHubSection = {
  title: string;
  content: unknown;
};

const DEFAULT_BANNER: SupportBannerContent = {
  title: "Support Hub",
  subtitle:
    "We aim to make EducateU simple to use. If you need help, this page explains how everything works and how to contact us.",
  breadcrumb_label: "Support Hub",
};

// The header board's entry for each section the CMS includes, keyed by section title.
const TOPICS: Record<string, SupportTopic> = {
  "How It Works": { label: "How it works", id: "how-it-works", hint: "From enrolling to your certificate" },
  FAQ: { label: "Common questions", id: "faq", hint: "Quick answers, all in one place" },
  "Refund Policy": { label: "Refund policy", id: "refund-policy", hint: "When and how refunds apply" },
  "Get in Touch": { label: "Get in touch", id: "get-in-touch", hint: "Email, phone and opening hours" },
};

async function loader() {
  try {
    const data = await getSupportHubPage();
    if (!data?.data?.is_published) notFound();
    return { ...data.data };
  } catch {
    notFound();
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loader();
  return buildMetadata(data, FALLBACK_METADATA);
}

export default async function SupportHubPage() {
  const data = await loader();
  const sections: SupportHubSection[] = data?.sections ?? [];

  // The banner always leads, wherever "Banner" falls in the CMS's own order;
  // empty CMS fields fall back to the defaults rather than rendering blank.
  const bannerContent = sections.find((section) => section.title === "Banner")?.content as
    | Partial<SupportBannerContent>
    | undefined;
  const banner: SupportBannerContent = {
    title: bannerContent?.title || DEFAULT_BANNER.title,
    subtitle: bannerContent?.subtitle || DEFAULT_BANNER.subtitle,
    breadcrumb_label: bannerContent?.breadcrumb_label || DEFAULT_BANNER.breadcrumb_label,
  };
  const restSections = sections.filter((section) => section.title !== "Banner");
  const topics = restSections.map((section) => TOPICS[section.title]).filter((t): t is SupportTopic => !!t);

  return (
    <>
      <SupportBanner {...banner} topics={topics} />

      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "How It Works":
              return <HowItWorks key={idx} data={section.content as Partial<HowItWorksContent>} />;
            case "FAQ":
              return <HubFaq key={idx} data={section.content as Partial<HubFaqContent>} />;
            case "Refund Policy":
              return <RefundPolicy key={idx} data={section.content as Partial<RefundPolicyContent>} />;
            case "Get in Touch":
              return <GetInTouch key={idx} data={section.content as Partial<GetInTouchContent>} />;
            default:
              return <CommonSection key={idx} data={section as never} />;
          }
        })
      ) : (
        <NoSectionFound />
      )}
    </>
  );
}
