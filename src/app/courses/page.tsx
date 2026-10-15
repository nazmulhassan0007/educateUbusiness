import Benefits, {
  type BenefitsContent,
} from "@/components/page-components/all-courses/Benefits";
import ExploreCourses from "@/components/page-components/all-courses/ExploreCourses";
import WhyCourses, {
  type WhyCoursesContent,
} from "@/components/page-components/all-courses/WhyCourses";
import CoursesHero, {
  type WallCourse,
} from "@/components/page-components/all-courses/CoursesHero";
import AboutCta from "@/components/page-components/about-us/AboutCta";
import StepsTimeline from "@/components/page-components/support-hub/StepsTimeline";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { formatPrice } from "@/lib/utils";
import { tidyDuration } from "@/lib/courses/format";
import { Suspense } from "react";
import LearnerReviews, {
  type LearnerReviewsContent,
} from "@/components/page-components/all-courses/LearnerReviews";

import CommonSection from "@/components/shared/CommonSection";
import NoSectionFound from "@/components/shared/NoSectionFound";
import { getCoursesPage, getHomePage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const FALLBACK_METADATA = {
  title: "Explore Our Courses | educateU",
  description:
    "Discover a wide range of accredited online courses designed to fit your professional needs. Enroll directly and gain immediate access upon purchase.",
};

// `CoursesExplorer`/`CourseSearchInput` read the `q` URL param via
// `useSearchParams()`. On a fully static page that has no per-request
// query string to read, that forces the whole subtree into a client-only
// Suspense hole — the course grid and results text render nothing until JS
// hydrates. Forcing this route dynamic makes Next server-render it per
// request instead, so the real search param (and so the real content) is
// there from the first response. The underlying course/category fetches
// stay cheap either way — they're `unstable_cache`d with a 5-minute
// revalidate at the data layer.
export const dynamic = "force-dynamic";

type CoursesSection = {
  title: string;
  content: unknown;
};

async function loader() {
  try {
    const data = await getCoursesPage();
    if (!data?.data?.is_published) notFound();
    return { ...data.data };
  } catch {
    notFound();
  }
}

// The Courses page's own CMS entry has no "Reviews" section of its own —
// reviews are only authored once, on the Home page's CMS entry — so this
// reuses that same content instead of duplicating it as a separate,
// independently-editable CMS field.
async function loadReviewsContent(): Promise<
  LearnerReviewsContent | undefined
> {
  try {
    const home = await getHomePage();
    const sections: CoursesSection[] = home?.data?.sections ?? [];
    return sections.find((section) => section.title === "Reviews")?.content as
      | LearnerReviewsContent
      | undefined;
  } catch {
    return undefined;
  }
}

// Photos this site supplies for a course, matched on title (the API's slugs carry version suffixes).
const PHOTOS: [RegExp, string][] = [[/fire safety/i, "/hero/fire-safety.jpg"]];

// The header's wall of courses, from the live catalogue.
async function loadHeader(): Promise<{ courses: WallCourse[] }> {
  const api = ((await getCourses().catch(() => null))?.data ?? []) as ApiCourse[];
  const courses = api.map((c) => ({
    slug: c.slug,
    title: c.title.trim(),
    category: c.category?.name ?? "",
    duration: tidyDuration(c.durationLabel),
    price: Number(c.discountedPrice ?? c.price),
    image: PHOTOS.find(([re]) => re.test(c.title))?.[1] ?? c.thumbnailImage?.url ?? "/courses/course-photo.jpeg",
  }));
  return { courses };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loader();
  return buildMetadata(data, FALLBACK_METADATA);
}

export default async function Page() {
  const [data, reviewsContent, header] = await Promise.all([
    loader(),
    loadReviewsContent(),
    loadHeader(),
  ]);
  const sections: CoursesSection[] = data?.sections ?? [];

  // The closing banner's price: the cheapest live course, or the design's £15.
  const prices = header.courses.map((c) => c.price).filter((n) => n > 0);

  // The Banner section is replaced by the header.
  const restSections = sections.filter((section) => section.title !== "Banner");

  return (
    <div className="">
      <Suspense>
        <CoursesHero courses={header.courses} />
      </Suspense>
      <ExploreCourses />
      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "Benefits":
              // return (
              //   <Benefits
              //     key={idx}
              //     data={section.content as Partial<BenefitsContent>}
              //   />
              // );
              return null;
            case "why Choose Us":
              return (
                <WhyCourses key={idx} data={section.content as WhyCoursesContent} />
              );
            default:
              return <CommonSection key={idx} data={section as never} />;
          }
        })
      ) : (
        <NoSectionFound />
      )}
      {/* How buying works, once they know why: checkout to certificate, before the reviews and the closing banner. */}
      <StepsTimeline />
      {/* <Testimonials /> */}
      <LearnerReviews data={reviewsContent} />
      {/* The same closing banner as the About and Contact pages; its price is the cheapest live course. */}
      <AboutCta
        price={formatPrice(prices.length ? Math.min(...prices) : 15)}
        // The list's section id (CourseList's EXPLORE_COURSES_SECTION_ID; a client module's constant can't be read here).
        coursesHref="#explore-courses"
      />
    </div>
  );
}
