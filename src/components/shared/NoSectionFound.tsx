import Bounded from "@/components/layout/bounded/Bounded";

export default function NoSectionFound() {
  return (
    <section className="bg-surface-dark py-16 lg:py-24">
      <Bounded className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-title type-h3 font-semibold text-surface-white">
          No content found
        </h2>
        <p className="text-on-dark">
          This page doesn&apos;t have any sections configured yet.
        </p>
      </Bounded>
    </section>
  );
}
