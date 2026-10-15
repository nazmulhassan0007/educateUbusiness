"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import type { Course } from "@/components/shared/course-card/CourseCard";
import {
  buildCourseSearchIndex,
  scoreCourseSearch,
  tokenizeSearchQuery,
} from "@/lib/courses/search";
import { formatPrice } from "@/lib/utils";

const MAX_RESULTS = 5;

export default function HeroCourseSearch({
  courses = [],
  className = "",
}: {
  courses?: Course[];
  className?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Normalised once per catalogue, not once per keystroke.
  const indexed = useMemo(
    () =>
      courses.map((course) => ({
        course,
        index: buildCourseSearchIndex(course),
      })),
    [courses],
  );

  // Ranked, not just filtered: five slots for a whole catalogue means the
  // order decides what the reader actually sees, and a title match is a
  // better answer than a passing mention in someone else's summary. See
  // src/lib/courses/search.ts for what counts as a match.
  const results = useMemo(() => {
    const tokens = tokenizeSearchQuery(query);
    if (tokens.length === 0) return [];
    return indexed
      .map(({ course, index }) => ({
        course,
        score: scoreCourseSearch(index, tokens),
      }))
      .filter((result) => result.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.course.title.localeCompare(b.course.title),
      )
      .slice(0, MAX_RESULTS)
      .map((result) => result.course);
  }, [indexed, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToResults = (q: string) => {
    setIsOpen(false);
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToResults(query.trim());
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Underlined field to match the hero's left-aligned layout — icon +
          placeholder over a bottom border, no pill/box chrome. */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2.5 border-b border-on-dark/20 pb-3.5 sm:gap-3 sm:pb-4.5"
      >
        <IoIosSearch className="size-5 shrink-0 text-on-dark sm:size-5.5" />
        <input
          type="search"
          placeholder="Search course by keyword and subjects....."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="search-cancel-mint w-full bg-transparent text-base text-on-dark placeholder:text-on-dark/60 focus:outline-none sm:text-base"
        />
      </form>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-3 overflow-hidden rounded-[20px] border border-primary-900 bg-primary-950 shadow-xl">
          {results.length > 0 ? (
            <>
              <ul className="scrollbar-none max-h-80 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden">
                {results.map((course) => (
                  <li key={course.slug}>
                    <Link
                      href={`/courses/${course.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-black/30">
                        {course.thumbnailImage && (
                          <Image
                            src={course.thumbnailImage}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate type-small text-on-dark">
                          {course.title}
                        </p>
                        {course.categoryName && (
                          <p className="truncate type-caption text-primary-700">
                            {course.categoryName}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 type-small text-primary-500">
                        {formatPrice(course.price)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => goToResults(query.trim())}
                className="w-full border-t border-white/10 px-4 py-3 text-left type-small text-primary-500 transition-colors hover:bg-white/5"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          ) : (
            <p className="px-4 py-3 type-small text-on-dark/70">
              No courses match &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
