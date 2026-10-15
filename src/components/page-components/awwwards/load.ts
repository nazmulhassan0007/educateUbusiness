import { unstable_cache } from "next/cache";
import { getFooter, getHomePage } from "@/lib/cms/loaders";
import { getCourseBySlug, getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { toKeywordList } from "@/lib/courses/search";
import type { HomeCms, HomeCourse } from "./types";

// Shared by every /new homepage preview: the live homepage's CMS copy plus
// the course catalogue, each course enriched from its own detail page.

// The API's durations are free text ("2", "3 hours", "2 hourse").
function tidyDuration(label: string | null) {
  const n = label?.match(/[\d.]+/)?.[0];
  if (!n) return label ?? "";
  return `${n} hour${n === "1" ? "" : "s"}`;
}

function toCourse(item: ApiCourse): HomeCourse {
  const price = Number(item.price);
  const discounted = item.discountedPrice ? Number(item.discountedPrice) : null;
  return {
    slug: item.slug,
    title: item.title,
    description: item.shortDescription,
    price: discounted ?? price,
    originalPrice: discounted ? price : undefined,
    thumbnailImage: item.thumbnailImage?.url ?? null,
    categoryName: item.category?.name,
    categorySlug: item.category?.slug,
    keywords: toKeywordList(item.tags),
    duration: tidyDuration(item.durationLabel),
    category: item.category?.name ?? "",
  };
}

// Each course's own page carries its modules, audience and inclusions.
// Fetched in parallel; a course whose detail fails still shows from the list.
async function withDetail(course: HomeCourse): Promise<HomeCourse> {
  try {
    const { data: d } = await getCourseBySlug(course.slug);
    return {
      ...course,
      detail: {
        overview: d.overviewText || d.longDescription || course.description,
        whoIsFor: d.whoIsFor,
        modules: (d.modules ?? []).map((m: { title: string }) => m.title).filter(Boolean),
        included: d.whatsIncluded,
        image: d.heroImage?.url ?? null,
        level: d.skillLevel,
        delivery: d.deliveryMode,
        certificate: d.certificateType,
      },
    };
  } catch {
    return course;
  }
}

// The list plus one detail call per course is 19 backend requests, so the
// enriched catalogue is cached briefly. The window is short on purpose (see
// the note in src/lib/courses/loaders.ts about stale course data): a price or
// course change shows within a minute. A failed list call throws, and
// unstable_cache never stores a throw.
const getCatalogue = unstable_cache(
  async () => {
    const r = await getCourses();
    return Promise.all(((r?.data ?? []) as ApiCourse[]).map(toCourse).map(withDetail));
  },
  ["new-home-catalogue"],
  { revalidate: 60 },
);

type Section = { title: string; content: unknown };

export async function loadHome(): Promise<{ cms: HomeCms; courses: HomeCourse[] }> {
  const [home, courses, footer] = await Promise.all([
    getHomePage().catch(() => null),
    getCatalogue().catch(() => [] as HomeCourse[]),
    getFooter().catch(() => null),
  ]);
  const sections: Section[] = home?.data?.sections ?? [];
  const get = <T,>(title: string) => sections.find((s) => s.title === title)?.content as T | undefined;

  return {
    courses,
    cms: {
      hero: get("Hero"),
      announcement: get("Announcement"),
      trusted: get("Trusted By"),
      courses: get("Courses Section"),
      why: get("Why Choose Us"),
      quote: get("Quote"),
      reviews: get("Reviews"),
      faq: get("FAQ"),
      footer: footer?.data?.footer,
    },
  };
}
