"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowForward, IoIosHome } from "react-icons/io";
import type { ApiBundle } from "@/lib/courses/loaders";

type TabId = "overview" | "details" | "content" | "faq";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Bundle Details" },
  { id: "content", label: "Course Content" },
  { id: "faq", label: "FAQ" },
];

// "Course Content" and "FAQ" mirror the single-course page's own
// placeholders — real per-bundle content for those doesn't exist yet
// either. The included courses themselves are shown in the full card grid
// below this section instead (see `BundleCourses`), not duplicated here.
function ComingSoon() {
  return (
    <div className="flex flex-col items-start gap-2 py-10 text-left md:items-center md:text-center">
      <h2 className="font-title type-h3 font-semibold text-surface-white">
        Coming Soon
      </h2>
      <p className="type-body font-light text-on-dark/60">
        This section isn&rsquo;t available yet — check back soon.
      </p>
    </div>
  );
}

export default function BundleHero({ bundle }: { bundle: ApiBundle }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const title = bundle.title;

  const atAGlance = [
    { label: "Certificate", value: bundle.certificationBadge },
    { label: "Duration", value: bundle.durationLabel },
    { label: "Study Method", value: bundle.deliveryMode },
    { label: "Courses Included", value: `${bundle.courseCount} courses` },
    {
      label: "Value if Bought Individually",
      value: `£${bundle.individualTotal}`,
    },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  return (
    <div className="flex flex-col gap-8 lg:gap-6">
      <div className="flex flex-col gap-3 text-on-dark">
        <div className="flex flex-wrap items-center gap-1.5 type-body">
          <Link href="/" className="flex items-center gap-1.5 text-primary-500">
            <IoIosHome className="size-5 lg:size-6" />
            Home
          </Link>
          <IoIosArrowForward className="size-5 text-primary-500 lg:size-6" />
          <Link href="/courses" className="text-primary-500">
            Courses
          </Link>
          <IoIosArrowForward className="size-5 text-primary-500 lg:size-6" />
          <span>{title}</span>
        </div>

        <h1 className="font-title type-h1 font-semibold">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <img
            alt={`${bundle.ratingStars} stars`}
            className="h-5 w-[107px]"
            src="/hero/trustpilot-stars.svg"
          />
          <p className="type-body">{bundle.ratingText}</p>
        </div>

        <p className="type-lead font-light">
          {bundle.description}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative h-[240px] w-full overflow-hidden rounded-2xl sm:h-[320px] lg:h-[445px]">
          <Image
            alt={title}
            src={bundle.image?.url || "/course-details/photo-hero.jpeg"}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(52,101,124,0.3)]" />
        </div>

        <div className="flex w-full flex-wrap gap-2.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-6 py-3.5 type-small whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-800 text-primary-50"
                  : "bg-primary-950 text-primary-50/70 hover:text-primary-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 text-on-dark ">
        {/* Overview and At a Glance both stay visible regardless of which
            tab is active — matches the single-course page's own pattern. */}
        <p className="type-body font-light">{bundle.description}</p>

        <h2 className="font-title type-h3 font-semibold">At a Glance</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {atAGlance.map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <p className="type-body font-medium text-primary-500">
                {item.label}
              </p>
              <p className="type-body font-light">{item.value}</p>
            </div>
          ))}
        </div>

        {(activeTab === "content" || activeTab === "faq") && <ComingSoon />}
      </div>
    </div>
  );
}
