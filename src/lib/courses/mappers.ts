import type { Course } from "@/components/shared/course-card/CourseCard";
import type { ApiBundle } from "./loaders";

// A bundle becomes a single cart line item — its own slug, title, and
// (discounted) price — rather than each included course added separately
// at its own individual price.
export function bundleToCartCourse(bundle: ApiBundle): Course {
  const price = Number(bundle.price);
  const originalPrice = bundle.originalPrice
    ? Number(bundle.originalPrice)
    : null;

  return {
    slug: bundle.slug,
    title: bundle.title,
    description: bundle.description,
    rating: bundle.ratingText,
    price,
    originalPrice: originalPrice ?? undefined,
    kind: "bundle",
  };
}
