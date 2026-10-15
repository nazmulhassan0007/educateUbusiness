import { Suspense } from "react";
import CourseList, { type ListCourse, type ListSubject } from "@/components/page-components/all-courses/CourseList";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { toKeywordList } from "@/lib/courses/search";

// The API's durations are free text ("2", "3 hours", "2 hourse").
function tidyDuration(label: string | null) {
  const n = label?.match(/[\d.]+/)?.[0];
  return n ? `${n} hour${n === "1" ? "" : "s"}` : (label ?? "");
}

// Photos this site supplies for a course, matched on title (the API's slugs carry version suffixes).
const PHOTOS: [RegExp, string][] = [[/fire safety/i, "/hero/fire-safety.jpg"]];

function toCourse(item: ApiCourse): ListCourse {
  const price = Number(item.price);
  const discounted = item.discountedPrice ? Number(item.discountedPrice) : null;
  // The CMS title often carries stray spaces (" Manual Handling"), which would upset A–Z.
  const title = item.title.trim();
  return {
    slug: item.slug,
    title,
    description: item.shortDescription,
    price: discounted ?? price,
    originalPrice: discounted ? price : undefined,
    thumbnailImage: item.thumbnailImage?.url ?? null,
    image: PHOTOS.find(([re]) => re.test(title))?.[1] ?? item.thumbnailImage?.url ?? "/courses/course-photo.jpeg",
    categorySlug: item.category.slug,
    categoryName: item.category.name,
    keywords: toKeywordList(item.tags),
    reviewCount: item.reviewCount,
    duration: tidyDuration(item.durationLabel),
  };
}

export default async function ExploreCourses() {
  const api = ((await getCourses().catch(() => undefined))?.data ?? []) as ApiCourse[];
  // Subjects come from the courses themselves; largest first, as in the design.
  const counts = new Map<string, ListSubject & { n: number }>();
  for (const c of api) {
    if (!c.category?.slug) continue;
    const s = counts.get(c.category.slug) ?? { name: c.category.name, slug: c.category.slug, n: 0 };
    s.n += 1;
    counts.set(c.category.slug, s);
  }
  const subjects = [...counts.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).map(({ name, slug }) => ({ name, slug }));

  return (
    <Suspense>
      <CourseList courses={api.map(toCourse)} subjects={subjects} />
    </Suspense>
  );
}
