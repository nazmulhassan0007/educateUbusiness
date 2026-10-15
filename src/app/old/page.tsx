import Announcement, {
  type AnnouncementContent,
} from "@/components/page-components/home/Announcement";
import EverythingYouNeed, {
  type EverythingYouNeedContent,
} from "@/components/page-components/home/EverythingYouNeed";
import FAQ, { type FaqContent } from "@/components/page-components/home/FAQ";
import Hero, { type HeroContent } from "@/components/page-components/home/Hero";
import HomeCourses, {
  type HomeCoursesContent,
} from "@/components/page-components/home/HomeCourses";
// import Offer, { type OfferContent } from "@/components/page-components/home/Offer";
import Testimonials from "@/components/shared/Testimonials";
// import TrustedBy, {
//   type TrustedByContent,
// } from "@/components/page-components/home/TrustedBy";
import WhyChooseUs, {
  type WhyChooseUsContent,
} from "@/components/page-components/home/WhyChooseUs";
import Reviews, { type ReviewsContent } from "@/components/shared/Reviews";
import CommonSection from "@/components/shared/CommonSection";
import NoSectionFound from "@/components/shared/NoSectionFound";
import type { Course } from "@/components/shared/course-card/CourseCard";
import { getHomePage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { toKeywordList } from "@/lib/courses/search";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const FALLBACK_METADATA = {
  title: "educateU - Empowering Lifelong Learning",
  description:
    "educateU Business delivers accredited online courses and certification for businesses, teams, and individuals across the UK and beyond.",
};

type HomeSection = {
  title: string;
  content: unknown;
};

function toCourse(item: ApiCourse): Course {
  const price = Number(item.price);
  const discountedPrice = item.discountedPrice
    ? Number(item.discountedPrice)
    : null;

  return {
    slug: item.slug,
    title: item.title,
    description: item.shortDescription,
    rating:
      item.rating && item.reviewCount > 0
        ? `${item.reviewCount}+ Student Rated ${item.rating} Star`
        : undefined,
    price: discountedPrice ?? price,
    originalPrice: discountedPrice ? price : undefined,
    thumbnailImage: item.thumbnailImage?.url ?? null,
    // Both feed the hero's search (HeroCourseSearch): without the category
    // here, "health & safety" or "leadership" matched nothing at all from
    // the hero, because a course's subject appears nowhere in its own title
    // or summary.
    categoryName: item.category?.name,
    categorySlug: item.category?.slug,
    keywords: toKeywordList(item.tags),
  };
}

async function loader() {
  try {
    const data = await getHomePage();
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

// The list endpoint has no `createdAt` to sort by, but it's confirmed to
// already return courses newest-first — so the first 3 are the 3 latest.
// Fetched once and reused for both the homepage carousel (first 3) and the
// Hero search dropdown (the full list), rather than fetching twice.
async function loadCourses(): Promise<Course[]> {
  try {
    const result = await getCourses();
    const courses = (result?.data ?? []) as ApiCourse[];
    return courses.map(toCourse);
  } catch {
    return [];
  }
}

// Unused while the Featured Section is hidden below — restore alongside it.
// async function loadFeaturedBundle(): Promise<ApiBundle | undefined> {
//   try {
//     const result = await getBundles();
//     const bundles = (result?.data ?? []) as ApiBundle[];
//     return bundles[0];
//   } catch {
//     return undefined;
//   }
// }

export default async function Home() {
  const [data, allCourses] = await Promise.all([loader(), loadCourses()]);
  const latestCourses = allCourses.slice(0, 3);
  const sections: HomeSection[] = data?.sections ?? [];

  // Rendered explicitly (not via the switch below) so the announcement bar
  // always sits right after the navbar, regardless of where "Announcement"
  // falls in the CMS's own section array.
  const announcementSection = sections.find(
    (section) => section.title === "Announcement",
  );
  const restSections = sections.filter(
    (section) => section.title !== "Announcement",
  );
  const announcementContent = announcementSection?.content as
    Partial<AnnouncementContent> | undefined;
  const hasAnnouncement = Boolean(
    announcementContent?.status && announcementContent?.text,
  );

  return (
    <main>
      <Announcement data={announcementContent} />
      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "Hero":
              return (
                <Hero
                  key={idx}
                  data={section.content as Partial<HeroContent>}
                  hasAnnouncement={hasAnnouncement}
                  courses={allCourses}
                />
              );
            case "Trusted By":
              return null;
            // return (
            //   <TrustedBy
            //     key={idx}
            //     data={section.content as Partial<TrustedByContent>}
            //   />
            // );
            case "Featured Section":
              return null;
            // return (
            //   <Offer
            //     key={idx}
            //     data={section.content as Partial<OfferContent>}
            //     bundle={featuredBundle}
            //   />
            // );
            case "Courses Section":
              return (
                <HomeCourses
                  key={idx}
                  data={section.content as Partial<HomeCoursesContent>}
                  courses={latestCourses}
                />
              );
            case "Why Choose Us":
              return (
                <WhyChooseUs
                  key={idx}
                  data={section.content as Partial<WhyChooseUsContent>}
                />
              );
            case "Quote":
              return (
                <EverythingYouNeed
                  key={idx}
                  data={section.content as Partial<EverythingYouNeedContent>}
                />
              );
            case "Reviews":
              return (
                <Reviews
                  key={idx}
                  data={section.content as Partial<ReviewsContent>}
                />
              );
            case "FAQ":
              return (
                <FAQ key={idx} data={section.content as Partial<FaqContent>} />
              );
            default:
              return <CommonSection key={idx} data={section as never} />;
          }
        })
      ) : (
        <NoSectionFound />
      )}
      {/* <Testimonials /> */}
    </main>
  );
}
