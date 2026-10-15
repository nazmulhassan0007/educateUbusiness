import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutCta from "@/components/page-components/about-us/AboutCta";
import CourseAudience from "@/components/page-components/course-details/CourseAudience";
import CourseFAQ from "@/components/page-components/course-details/CourseFAQ";
import CourseGlance from "@/components/page-components/course-details/CourseGlance";
import CourseHero from "@/components/page-components/course-details/CourseHero";
import CourseModules from "@/components/page-components/course-details/CourseModules";
import CourseOverview from "@/components/page-components/course-details/CourseOverview";
import CourseOutcomes from "@/components/page-components/course-details/CourseOutcomes";
import RelatedCourses from "@/components/page-components/course-details/RelatedCourses";
import { getCourseBySlug, type ApiCourseDetail } from "@/lib/courses/loaders";
import { isOfferActive } from "@/lib/courses/offer";
import { formatPrice } from "@/lib/utils";

async function loader(slug: string): Promise<ApiCourseDetail> {
  try {
    const result = await getCourseBySlug(slug);
    if (!result?.data) notFound();
    return result.data as ApiCourseDetail;
  } catch {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await loader(slug);
  return {
    title: `${course.title} | educateU`,
    description:
      course.shortDescription ||
      "Explore course details, study options, and pricing for this educateU course.",
  };
}

// The course page (Figma 183:172), top to bottom; each band drops out when
// the course has nothing for it.
export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await loader(slug);
  const price = isOfferActive(course)
    ? Number(course.offerPrice)
    : Number(course.discountedPrice ?? course.price);

  return (
    <div className="selection:bg-[#1ee9b5] selection:text-[#06180b]">
      <CourseHero course={course} />
      <CourseOverview course={course} />
      <CourseGlance course={course} />
      <CourseModules course={course} />
      <CourseOutcomes course={course} />
      <CourseAudience course={course} />
      <CourseFAQ faqs={course.faqs} />
      <RelatedCourses courses={course.relatedCourses} />
      <AboutCta price={formatPrice(price)} />
    </div>
  );
}
