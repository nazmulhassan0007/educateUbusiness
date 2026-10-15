import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RefundHero from "@/components/page-components/refund-policy/RefundHero";
import RefundPolicyContent, {
  resolveRefundContent,
  type RefundPolicyContentData,
} from "@/components/page-components/refund-policy/RefundPolicyContent";
import CommonSection from "@/components/shared/CommonSection";
import NoSectionFound from "@/components/shared/NoSectionFound";
import { getRefundPolicyPage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

const FALLBACK_METADATA = {
  title: "Refund Policy | educateU",
  description:
    "educateU's refund policy — eligibility, refund amounts, process, exceptions, learner obligations, cancellations, and monitoring arrangements.",
};

type RefundPolicySection = {
  title: string;
  content: unknown;
};

type BannerContent = {
  title: string;
  subtitle?: string;
  breadcrumb_label: string;
};

const DEFAULT_BANNER: BannerContent = {
  title: "Refund Policy",
  breadcrumb_label: "Refund Policy",
};

async function loader() {
  try {
    const data = await getRefundPolicyPage();
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

export default async function RefundPolicyPage() {
  const data = await loader();
  const sections: RefundPolicySection[] = data?.sections ?? [];

  // Rendered explicitly (not via the switch below) so the banner always
  // renders in its fixed spot, regardless of where "Banner" falls in the
  // CMS's own section array.
  const bannerSection = sections.find((section) => section.title === "Banner");
  const banner = {
    ...DEFAULT_BANNER,
    ...(bannerSection?.content as Partial<BannerContent> | undefined),
  };
  const restSections = sections.filter((section) => section.title !== "Banner");
  // The header shows the document's details from the "Document Data" section.
  const doc = resolveRefundContent(
    sections.find((section) => section.title === "Document Data")?.content as Partial<RefundPolicyContentData> | undefined,
  );

  return (
    <>
      <RefundHero
        title={banner.breadcrumb_label}
        subtitle={banner.subtitle}
        meta={doc.meta}
        sections={doc.sections.length}
        minutes={doc.minutes}
      />
      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "Document Data":
              return (
                <RefundPolicyContent
                  key={idx}
                  data={section.content as Partial<RefundPolicyContentData>}
                />
              );
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
