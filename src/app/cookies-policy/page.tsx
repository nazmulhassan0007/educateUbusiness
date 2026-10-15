import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CookiesHero from "@/components/page-components/cookies-policy/CookiesHero";
import CookieCategories, {
  type CookieCategoriesContent,
} from "@/components/page-components/cookies-policy/CookieCategories";
import ManagePreferences, {
  type ManagePreferencesContent,
} from "@/components/page-components/cookies-policy/ManagePreferences";
import CommonSection from "@/components/shared/CommonSection";
import NoSectionFound from "@/components/shared/NoSectionFound";
import { getCookiesPolicyPage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

const FALLBACK_METADATA = {
  title: "Cookies Policy | educateU",
  description:
    "Learn how educateU uses essential, functional, analytics, and marketing cookies, and how to manage your cookie preferences.",
};

type CookiesPolicySection = {
  title: string;
  content: unknown;
};

type BannerContent = {
  title: string;
  subtitle?: string;
  breadcrumb_label: string;
};

const DEFAULT_BANNER: BannerContent = {
  title: "Cookies Policy",
  breadcrumb_label: "Cookie Policy",
};

async function loader() {
  try {
    const data = await getCookiesPolicyPage();
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

export default async function CookiesPolicyPage() {
  const data = await loader();
  const sections: CookiesPolicySection[] = data?.sections ?? [];

  // Rendered explicitly (not via the switch below) so the banner always
  // renders in its fixed spot, regardless of where "Banner" falls in the
  // CMS's own section array.
  const bannerSection = sections.find((section) => section.title === "Banner");
  const banner = {
    ...DEFAULT_BANNER,
    ...(bannerSection?.content as Partial<BannerContent> | undefined),
  };
  const restSections = sections.filter((section) => section.title !== "Banner");
  // How many services the policy names, for the header (6 in the built-in copy).
  const categories = (sections.find((section) => section.title === "Cookie Categories")?.content as
    | Partial<CookieCategoriesContent>
    | undefined)?.categories;
  const services = categories ? categories.reduce((n, c) => n + (c.items?.length ?? 0), 0) : 6;

  return (
    <>
      <CookiesHero title={banner.breadcrumb_label} subtitle={banner.subtitle} services={services} />
      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "Cookie Categories":
              return (
                <CookieCategories
                  key={idx}
                  data={section.content as Partial<CookieCategoriesContent>}
                />
              );
            case "Manage Preferences":
              return (
                <ManagePreferences
                  key={idx}
                  data={section.content as Partial<ManagePreferencesContent>}
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
