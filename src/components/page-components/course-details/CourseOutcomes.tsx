import { Check } from "lucide-react";
import Image from "next/image";
import type { ApiCourseDetail } from "@/lib/courses/loaders";

/**
 * "What you'll learn" (Figma 184:235): the course's outcomes as a ruled list
 * beside a photo that holds its place while the list scrolls, captioned with
 * how to reach support.
 */
export default function CourseOutcomes({ course }: { course: ApiCourseDetail }) {
  if (!course.whatYoullLearn.length) return null;
  const support = course.dedicatedSupportText;
  const isEmail = !!support && /^\S+@\S+\.\S+$/.test(support.trim());

  return (
    <section aria-labelledby="outcomes-title" className="ragged bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 lg:py-[136px]">
      <div className="mx-auto flex max-w-site flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <div className="relative aspect-[4/5] w-full max-w-[520px] shrink-0 overflow-hidden rounded-[20px] lg:sticky lg:top-[calc(var(--home-nav-h,84px)+32px)] lg:aspect-auto lg:h-[min(700px,calc(100svh-160px))] lg:w-[520px]">
          <Image src="/course-details/audience.jpg" alt="" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
          {support && (
            <div className="absolute bottom-6 left-6 flex flex-col gap-1 rounded-[14px] bg-[#f7f6f1] px-[18px] py-3.5 type-small">
              <span className="font-medium">Dedicated support</span>
              {isEmail ? (
                <a href={`mailto:${support.trim()}`} className="text-[#0c7a5e] underline-offset-[3px] hover:underline">
                  {support.trim()}
                </a>
              ) : (
                <span className="text-[#0c7a5e]">{support}</span>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="outcomes-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            What you&rsquo;ll learn
          </h2>
          <ul className="m-0 mt-8 list-none border-b border-[#06180b]/12 p-0">
            {course.whatYoullLearn.map((item) => (
              <li key={item} className="flex items-center gap-[18px] border-t border-[#06180b]/12 py-[18px]">
                <span aria-hidden="true" className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#1ee9b5]">
                  <Check size={14} strokeWidth={2.2} />
                </span>
                <span className="type-body text-[#06180b]/88">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
