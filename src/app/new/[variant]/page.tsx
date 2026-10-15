import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadHome } from "@/components/page-components/awwwards/load";
import ConceptB from "@/components/page-components/concepts/ConceptB";
import ConceptC from "@/components/page-components/concepts/ConceptC";

// Three design directions for the homepage, side by side, before one is built out.
const CONCEPTS = { b: ConceptB, c: ConceptC } as const;

export const metadata: Metadata = {
  title: "educateU Business, homepage directions",
  robots: { index: false, follow: false },
};

export default async function ConceptPage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const Concept = CONCEPTS[variant as keyof typeof CONCEPTS];
  if (!Concept) notFound();
  const { cms, courses } = await loadHome();
  return <Concept cms={cms} courses={courses} />;
}
