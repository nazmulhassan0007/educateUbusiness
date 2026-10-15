import Image from "next/image";
import Link from "next/link";
import type { ApiRelatedCourse } from "@/lib/courses/loaders";
import { tidyDuration } from "@/lib/courses/format";
import { isOfferActive } from "@/lib/courses/offer";
import { formatPrice } from "@/lib/utils";

const FALLBACK_PHOTO = "/courses/course-photo.jpeg";

// What the course costs today: a live offer, else its discount, else its price.
function priceOf(c: ApiRelatedCourse) {
  if (isOfferActive(c)) return Number(c.offerPrice);
  return Number(c.discountedPrice ?? c.price);
}

/**
 * "Pairs well with" (Figma 184:364): up to three of the API's related
 * courses as photo cards — price on a mint tag, subject and length, title
 * and line — each opening its own page. Wraps to a swipe row on phones.
 */
export default function RelatedCourses({ courses }: { courses: ApiRelatedCourse[] }) {
  const shown = courses.slice(0, 3);
  if (!shown.length) return null;

  return (
    <section aria-labelledby="related-title" className="bg-[#f2efe6] px-5 pb-4 pt-20 text-[#06180b] md:px-10 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-site">
        <h2 id="related-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
          Pairs well with
        </h2>
        <ul className="-mx-5 mt-10 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:mt-12 lg:gap-6 [&::-webkit-scrollbar]:hidden">
          {shown.map((c) => {
            const meta = [c.category?.name, tidyDuration(c.durationLabel)].filter(Boolean).join(" · ");
            return (
              <li key={c.id} className="w-[82vw] max-w-[420px] shrink-0 snap-start md:w-auto md:max-w-none">
                <Link
                  href={`/courses/${c.slug}`}
                  className="group relative flex h-[420px] flex-col justify-end overflow-hidden isolate rounded-[20px] p-7 text-[#f2efe6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c7a5e]"
                >
                  <Image
                    src={c.thumbnailImage?.url || FALLBACK_PHOTO}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 82vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_24_11/0)_30%,rgb(6_24_11/0.9)_100%)]" />
                  <span className="absolute right-5 top-5 rounded-full bg-[#1ee9b5] px-2.5 py-1.5 type-caption font-medium text-[#06180b] tabular-nums">
                    {formatPrice(priceOf(c))}
                  </span>
                  <span className="relative flex flex-col gap-2">
                    {meta && <span className="type-caption font-medium text-[#1ee9b5]">{meta}</span>}
                    <span className="font-title type-h4 tracking-[-0.025em]">{c.title}</span>
                    {c.shortDescription && <span className="line-clamp-2 type-small text-[#f2efe6]/80">{c.shortDescription}</span>}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-[68px] grid size-10 translate-y-1 place-items-center rounded-full bg-[#f7f6f1] text-[#06180b] opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 11 11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
