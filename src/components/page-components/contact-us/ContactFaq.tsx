import FaqSection from "@/components/page-components/concepts/FaqSection";

export type ContactFaqContent = { title?: string; faqs?: { question?: string; answer?: string }[] };

const plain = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/**
 * The Contact FAQ: the homepage's FAQ section (numbered questions, the answer
 * in a card beside them) with the Contact page's own questions from the CMS.
 */
export default function ContactFaq({ data }: { data?: ContactFaqContent }) {
  const faqs = (data?.faqs ?? []).map((f) => ({ q: plain(f.question ?? ""), a: plain(f.answer ?? "") })).filter((f) => f.q && f.a);
  if (!faqs.length) return null;
  return (
    <FaqSection
      faqs={faqs}
      contactHref="#contact-form"
      intro="Quick answers to what people ask us most. Still stuck? Send us a message and our UK team will reply."
    />
  );
}
