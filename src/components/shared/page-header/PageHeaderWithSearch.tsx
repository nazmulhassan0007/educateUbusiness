import { Suspense } from "react";
import PageHeader, { type Crumb } from "./PageHeader";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";
import CourseSearchInput from "./CourseSearchInput";

/**
 * Same dark hero band as `PageHeader`, with a search input grouped into the
 * same section (e.g. Explore Our Courses) so its spacing and background stay
 * visually part of the header instead of a separately-styled block below it.
 *
 * The input itself (`CourseSearchInput`) is a separate client component that
 * syncs its value to the `q` URL param (debounced), so any other component
 * on the page — e.g. the course grid — can read the same query via
 * `useSearchParams()` without a shared parent holding the state. Kept out of
 * this component so the title/breadcrumb stay server-rendered rather than
 * waiting on a Suspense boundary.
 */
export default function PageHeaderWithSearch({
  title,
  subtitle,
  breadcrumbs,
  className = "",
  searchPlaceholder = "Search",
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  className?: string;
  searchPlaceholder?: string;
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      className={`lg:pb-10 2xl:pb-10 ${className}`}
    >
      <SlideUpReveal
        delay={0.4}
        className="flex w-full max-w-2xl items-center justify-center mt-7.5 "
      >
        <Suspense
          fallback={
            <div className="h-[60px] w-full max-w-xl rounded-full border border-[rgba(27,245,118,0.17)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[75px] lg:max-w-2xl" />
          }
        >
          <CourseSearchInput placeholder={searchPlaceholder} />
        </Suspense>
      </SlideUpReveal>
    </PageHeader>
  );
}
