import Bounded from "@/components/layout/bounded/Bounded";

type CommonSectionData = {
  title?: string;
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
};

// Fallback renderer for CMS section types that don't have a dedicated
// component yet — keeps an unrecognized section's copy visible instead of
// silently dropping it from the page.
export default function CommonSection({ data }: { data: CommonSectionData }) {
  const heading = data?.content?.title ?? data?.title;
  const body = data?.content?.subtitle ?? data?.content?.description;

  if (!heading && !body) return null;

  return (
    <section className="bg-surface-dark py-16 lg:py-24">
      <Bounded className="flex flex-col items-start gap-4 text-left md:items-center md:text-center">
        {heading && (
          <h2 className="type-h2 font-title font-semibold text-surface-white">
            {heading}
          </h2>
        )}
        {body && (
          <p className="type-lead max-w-2xl text-on-dark">{body}</p>
        )}
      </Bounded>
    </section>
  );
}
