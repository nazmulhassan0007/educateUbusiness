import type { Course } from "@/components/shared/course-card/CourseCard";

export const EASE = [0.22, 1, 0.36, 1] as const;

// Palette for the preview: paper, ink and the brand mint. A darker mint is
// used for text on paper, where #1ee9b5 would be too light to read.
export const PAPER = "#f2f0e9";
export const INK = "#06180b";
export const MINT = "#1ee9b5";
export const MINT_DEEP = "#0c7a5e";

export type HomeCourse = Course & {
  duration: string;
  category: string;
  // From the course's own page in the courses API, so the explorer can show
  // what a buyer gets without leaving the homepage.
  detail?: {
    overview: string;
    whoIsFor: string | null;
    modules: string[];
    included: string[];
    image: string | null;
    level: string | null;
    delivery: string | null;
    certificate: string | null;
  };
};

type Link = { url: string; text: string };
type Asset = { url: string; alt?: string };

// The CMS homepage sections, typed as far as this page reads them.
export type HomeCms = {
  hero?: {
    title?: string;
    sub_title?: string;
    cta_1?: Link;
    cta_2?: Link;
    hero_video?: string;
    hero_quote?: string;
    name?: string;
    position?: string;
  };
  announcement?: { status?: boolean; text?: string };
  trusted?: { title?: string; sub_title?: string; brands?: { logo?: Asset }[] };
  courses?: { title?: string; description?: string; cta?: Link };
  why?: {
    title?: string;
    description?: string;
    cta?: Link;
    image?: Asset;
    video?: string;
    cards?: { title?: string; description?: string; icon?: Asset }[];
  };
  quote?: {
    main_quote?: string;
    img_1?: Asset;
    img_2?: Asset;
    img_3?: Asset;
    card_1_title?: string;
    card_1_description?: string;
    card_1_cta?: Link;
    card_2_eyebrow?: string;
    card_2_title?: string;
    card_2_subtitle?: string;
  };
  reviews?: { title?: string; description?: string; reviews?: { name: string; quote: string; position: string }[] };
  faq?: { title?: string; description?: string; faqs?: { question: string; answer: string }[] };
  // The site footer from the CMS navigation (columns of links, plus text sections).
  footer?: {
    columns?: { title?: string; items?: { label: string; url: string }[] }[];
    sections?: { name?: string; items?: Record<string, { value?: string }> }[];
  };
};
