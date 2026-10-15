import type { Metadata } from "next";
import { loadHome } from "@/components/page-components/awwwards/load";
import ConceptC from "@/components/page-components/concepts/ConceptC";
import type { HeroKind } from "@/components/page-components/concepts/Heroes";

// Redesign preview: lives beside the live homepage until it's signed off.
// All copy comes from the same CMS page the live homepage uses.
export const metadata: Metadata = {
  title: "educateU Business",
  robots: { index: false, follow: false },
};

// Kept here, not imported from the client Heroes file (a server page only gets its components).
const HEROES: HeroKind[] = ["letters", "frame", "wall"];

// While the director compares: ?hero=letters|frame|wall.
export default async function NewHome({ searchParams }: { searchParams: Promise<{ hero?: string }> }) {
  const [{ cms, courses }, params] = await Promise.all([loadHome(), searchParams]);
  const hero = HEROES.includes(params.hero as HeroKind) ? (params.hero as HeroKind) : undefined;
  return <ConceptC cms={cms} courses={courses} hero={hero} />;
}
