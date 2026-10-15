import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactHero from "@/components/page-components/contact-us/ContactHero";
import ContactEnquiry, {
  type ContactFormContent,
} from "@/components/page-components/contact-us/ContactEnquiry";
import ContactFaq, {
  type ContactFaqContent,
} from "@/components/page-components/contact-us/ContactFaq";
import AboutCta from "@/components/page-components/about-us/AboutCta";
import CommonSection from "@/components/shared/CommonSection";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import { formatPrice } from "@/lib/utils";
import NoSectionFound from "@/components/shared/NoSectionFound";
import { getContactPage } from "@/lib/cms/loaders";
import { buildMetadata } from "@/lib/cms/metadata";

const FALLBACK_METADATA = {
  title: "Contact Us | educateU",
  description:
    "Get in touch with educateU for general enquiries about our courses, partnerships, and organisational information.",
};

type ContactSection = {
  title: string;
  content: unknown;
};

async function loader() {
  try {
    const data = await getContactPage();
    if (!data?.data?.is_published) notFound();
    return { ...data.data };
  } catch {
    notFound();
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loader();
  return buildMetadata(data, FALLBACK_METADATA);
}

// The closing banner's price: the cheapest live course, or the design's £15 if the call fails.
async function loadPrice() {
  const courses = ((await getCourses().catch(() => null))?.data ?? []) as ApiCourse[];
  const prices = courses.map((c) => Number(c.discountedPrice ?? c.price)).filter((n) => Number.isFinite(n) && n > 0);
  return formatPrice(prices.length ? Math.min(...prices) : 15);
}

export default async function ContactUsPage() {
  const [data, price] = await Promise.all([loader(), loadPrice()]);
  const sections: ContactSection[] = data?.sections ?? [];

  // The Banner section is replaced by the hero.
  const restSections = sections.filter((section) => section.title !== "Banner");

  return (
    <>
      {/* The design's own headline and line; the CMS banner ("Contact educateU") is a page title, not this question. */}
      <ContactHero />
      {restSections.length > 0 ? (
        restSections.map((section, idx) => {
          switch (section.title) {
            case "Contact Form":
              return (
                <ContactEnquiry
                  key={idx}
                  data={section.content as Partial<ContactFormContent>}
                />
              );
            // The board in the hero and the "What happens next" card give these addresses now.
            case "Contact Info":
              return null;
            case "FAQ":
              return (
                <ContactFaq key={idx} data={section.content as ContactFaqContent} />
              );
            default:
              return <CommonSection key={idx} data={section as never} />;
          }
        })
      ) : (
        <NoSectionFound />
      )}
      {/* The same closing banner as the About page; its "Contact us" goes to the form above. */}
      <AboutCta price={price} contactHref="#contact-form" />
    </>
  );
}
