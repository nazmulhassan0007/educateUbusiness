import type { Metadata } from "next";
import { loadHome } from "@/components/page-components/awwwards/load";
import ConceptC from "@/components/page-components/concepts/ConceptC";
import type { HeroKind } from "@/components/page-components/concepts/Heroes";
import { getHomePage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

// The new homepage. The previous one is kept at /old until this is signed off.
const FALLBACK_METADATA = {
  title: "educateU - Empowering Lifelong Learning",
  description:
    "educateU Business delivers accredited online courses and certification for businesses, teams, and individuals across the UK and beyond.",
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomePage().catch(() => null);
  return buildMetadata(data?.data, FALLBACK_METADATA);
}

// Kept here, not imported from the client Heroes file (a server page only gets its components).
const HEROES: HeroKind[] = ["letters", "frame", "wall"];

// While the director compares: ?hero=letters|frame|wall and ?courses=popular|explorer|reel.
export default async function Home({ searchParams }: { searchParams: Promise<{ hero?: string; courses?: string }> }) {
  const [{ cms, courses }, params] = await Promise.all([loadHome(), searchParams]);
  const hero = HEROES.includes(params.hero as HeroKind) ? (params.hero as HeroKind) : undefined;
  const catalogue = params.courses === "reel" || params.courses === "explorer" ? params.courses : "popular";
  return <ConceptC cms={cms} courses={courses} hero={hero} catalogue={catalogue} />;
}
