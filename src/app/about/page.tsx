import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutHero, { type AboutStat } from "@/components/page-components/about-us/AboutHero";
import AboutMission from "@/components/page-components/about-us/AboutMission";
import AboutWhy, { type AboutWhyContent } from "@/components/page-components/about-us/AboutWhy";
import AboutAudience, { type AboutAudienceContent } from "@/components/page-components/about-us/AboutAudience";
import AboutCommitment, { type AboutCommitmentContent } from "@/components/page-components/about-us/AboutCommitment";
import AboutCta from "@/components/page-components/about-us/AboutCta";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { formatPrice } from "@/lib/utils";
import type { WhoWeAreContent } from "@/components/page-components/about-us/WhoWeAre";
import CommonSection from "@/components/shared/CommonSection";
import { getAboutPage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

const FALLBACK_METADATA = {
  title: "About Us | educateU",
  description:
    "Learn about educateU's mission, vision, and values, and discover why learners around the world choose our accredited online qualifications.",
};

type AboutSection = {
  title: string;
  content: unknown;
};

async function loader() {
  try {
    const data = await getAboutPage();
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

// The hero's four facts, from the live catalogue; a failed call falls back to the design's figures.
async function loadStats(): Promise<AboutStat[]> {
  const courses = ((await getCourses().catch(() => null))?.data ?? []) as ApiCourse[];
  const subjects = new Set(courses.map((c) => c.category?.slug).filter(Boolean)).size;
  const prices = courses.map((c) => Number(c.discountedPrice ?? c.price)).filter((n) => Number.isFinite(n) && n > 0);
  const from = prices.length ? Math.min(...prices) : 15;
  return [
    { title: `${courses.length || 18} courses`, body: "CPD-certified" },
    { title: `${subjects || 4} subjects`, body: "Built for real workplaces" },
    { title: formatPrice(from), body: "Per course, certificate included" },
    { title: "UK support", body: "Mon – Fri, 9:00 – 17:00" },
  ];
}

export default async function AboutPage() {
  const [data, stats] = await Promise.all([loader(), loadStats()]);
  const sections: AboutSection[] = data?.sections ?? [];

  // The hero replaces the CMS banner, the mission section replaces "Who We
  // Are" (its photo is reused) and AboutWhy restyles "Why EducateU" (its text
  // is reused); "Company Intro" was already left out.
  const whoWeAre = sections.find((section) => section.title === "Who We Are")?.content as Partial<WhoWeAreContent> | undefined;
  const why = sections.find((section) => section.title === "Why EducateU")?.content as AboutWhyContent | undefined;
  const audience = sections.find((section) => section.title === "Who It Is For")?.content as AboutAudienceContent | undefined;
  const commitment = sections.find((section) => section.title === "Our Commitment")?.content as AboutCommitmentContent | undefined;
  const restSections = sections.filter(
    (section) => !["Banner", "Company Intro", "Who We Are", "Why EducateU", "Who It Is For", "Our Commitment"].includes(section.title),
  );

  return (
    <>
      <AboutHero stats={stats} />
      <AboutMission photo={whoWeAre?.image?.url} price={stats[2].title} />
      <AboutWhy data={why} price={stats[2].title} />
      <AboutAudience data={audience} />
      <AboutCommitment data={commitment} />
      <AboutCta price={stats[2].title} />
      {/* Any section added in the CMS later still shows, in the shared style. */}
      {restSections.map((section, idx) => (
        <CommonSection key={idx} data={section as never} />
      ))}
    </>
  );
}
