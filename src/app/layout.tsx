import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Stack_Sans_Notch, Stack_Sans_Text, Geist, Geist_Mono } from "next/font/google";
import { unstable_cache } from "next/cache";
import SiteNav, { type NavSubject } from "@/components/layout/navbar/SiteNav";
import NavSpacer from "@/components/layout/navbar/NavSpacer";
import { getCourses, type ApiCourse } from "@/lib/courses/loaders";
import type { FooterData } from "@/components/layout/footer/Footer";
import SiteFooter from "@/components/layout/footer/SiteFooter";
import SmoothScroll from "@/components/shared/smooth-scroll/SmoothScroll";
import Cursor from "@/components/page-components/awwwards/Cursor";
import MotionBudget from "@/components/shared/MotionBudget";
import CookieBanner from "@/components/shared/CookieBanner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getFooter } from "@/lib/cms/loaders";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// Labels on the sample certificate (homepage) are set in mono.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const stackSansNotch = Stack_Sans_Notch({
  variable: "--font-stack-sans-notch",
  subsets: ["latin"],
});

const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-sans-text",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EducateU - Empowering Lifelong Learning",
  description:
    "EducateU is your gateway to professional growth through online courses. We provide a platform for learners to acquire new skills, advance their careers, and achieve their goals without barriers.",
};

// The navbar's Courses menu: each subject with its course count, largest
// first. Subjects change rarely, so this is cached for five minutes rather
// than costing every page a fresh catalogue call. A failure just means a
// plain "Courses" link (an empty list), never a broken page.
const getNavSubjects = unstable_cache(
  async (): Promise<NavSubject[]> => {
    const r = await getCourses();
    const by = new Map<string, NavSubject>();
    for (const c of (r?.data ?? []) as ApiCourse[]) {
      if (!c.category?.slug || !c.category.name) continue;
      const s = by.get(c.category.slug) ?? { name: c.category.name, slug: c.category.slug, count: 0 };
      s.count += 1;
      by.set(c.category.slug, s);
    }
    return [...by.values()].sort((a, b) => b.count - a.count);
  },
  ["nav-subjects"],
  { revalidate: 300 },
);

// Unlike page loaders, this can't notFound() on failure: it wraps every
// page including the 404 page itself, so a hiccup here falls back to the
// Footer's static defaults and a plain Courses link instead of taking the
// whole site down.
async function loader(): Promise<{ subjects: NavSubject[]; footer?: FooterData }> {
  const [subjects, footerResult] = await Promise.all([
    getNavSubjects().catch(() => [] as NavSubject[]),
    getFooter().catch(() => undefined),
  ]);
  return { subjects, footer: footerResult?.data?.footer };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { subjects, footer } = await loader();

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        stackSansNotch.variable,
        stackSansText.variable,
        "font-sans",
        geist.variable,
        geistMono.variable,
      )}
    >
      <body
        // `overflow-x: clip` (not `hidden`) — `hidden` makes body a scroll
        // container, which breaks `position: sticky` for every descendant
        // on the site (sticky positions relative to the nearest scrolling
        // ancestor's scrollport, not necessarily the real viewport once one
        // exists). `clip` blocks the same horizontal overflow without
        // establishing a scroll container.
        className="min-h-full flex flex-col overflow-x-clip bg-surface-dark font-sans"
        suppressHydrationWarning
      >
        <MotionBudget />
        {/* The homepage's mint-dot cursor, on every page. */}
        <Cursor />
        <SmoothScroll>
          {/* One navbar on every page (the homepage's design). */}
          <SiteNav subjects={subjects} />
          <NavSpacer />
          {children}
          <SiteFooter data={footer} />
        </SmoothScroll>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
