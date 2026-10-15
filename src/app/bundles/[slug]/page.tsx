import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Bounded from "@/components/layout/bounded/Bounded";
import BundleHero from "@/components/page-components/bundle-details/BundleHero";
import BundleSidebar from "@/components/page-components/bundle-details/BundleSidebar";
import BundleCourses from "@/components/page-components/bundle-details/BundleCourses";
import { getBundleBySlug, type ApiBundle } from "@/lib/courses/loaders";

export const metadata: Metadata = {
  title: "Bundle Details | educateU",
  description:
    "Explore what's included, pricing, and savings for this educateU course bundle.",
};

async function loader(slug: string): Promise<ApiBundle> {
  try {
    const result = await getBundleBySlug(slug);
    if (!result?.data) notFound();
    return result.data as ApiBundle;
  } catch {
    notFound();
  }
}

export default async function BundleDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await loader(slug);

  return (
    <>
      {/* No `overflow-hidden` here — an ancestor with overflow set to
          anything but `visible` breaks `position: sticky` relative to the
          viewport, which is what the sidebar below relies on. */}
      <section className="relative bg-surface-dark py-12 lg:py-16">
        <Bounded className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex w-full flex-col gap-10 lg:w-[68%]">
            <BundleHero bundle={bundle} />
          </div>
          <div
            className="w-full lg:sticky lg:w-[32%]"
            style={{ top: "var(--navbar-height, 120px)" }}
          >
            <BundleSidebar bundle={bundle} />
          </div>
        </Bounded>
      </section>
      <BundleCourses courses={bundle.courses} />
    </>
  );
}
