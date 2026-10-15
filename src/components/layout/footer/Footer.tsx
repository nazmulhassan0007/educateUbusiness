import { Fragment } from "react";
import Link from "next/link";
import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import { EdgeGradientAnimation } from "@/components/ui/edge-gradient-animation";
import { Globe, type GlobeConfig } from "@/components/ui/globe";
import { htmlToLines } from "@/lib/utils";
import {
  CERTIFICATE_CHECKER_LINK,
  QUICK_LINKS,
  SUPPORT_LINKS,
  type FooterLink,
} from "./footer-links";
import NewsletterForm from "./NewsletterForm";
import type { IconType } from "react-icons";
import { TfiFacebook } from "react-icons/tfi";
import { FaXTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { FlipText } from "@/components/shared/animation/FlipText";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

type FooterColumnItem = {
  id: string;
  url: string;
  label: string;
  logo?: string;
};

type FooterColumn = {
  id: string;
  title: string;
  items: FooterColumnItem[];
  order_index: number;
};

type FooterField = {
  type: string;
  value: string;
  field_id: string;
};

type FooterSection = {
  id: string;
  name: string;
  items: Record<string, FooterField | undefined>;
  order_index: number;
};

export type FooterData = {
  columns?: FooterColumn[];
  sections?: FooterSection[];
};

const DEFAULT_DESCRIPTION =
  "EducateU is a global education provider offering high quality learning opportunities to Students and Working Professional Worldwide";
const DEFAULT_COMPANY_INTRO =
  "A flexible learning platform for recognised qualifications and career growth";
const DEFAULT_COPYRIGHT =
  "© All rights reserved. EducateU is registered in England & Wales No. 14400001";
const DEFAULT_ENROLL_LABEL = "Enroll Our Courses";
const DEFAULT_ENROLL_HREF = "/courses";
const DEFAULT_HERO_TITLE = "Advance your skills. Achieve your goals.";
const DEFAULT_HERO_DESCRIPTION =
  "Start your learning journey today with educateU.";
const DEFAULT_NEWSLETTER_CTA_LABEL = "Subscribe";

// Brand palette (globals.css): --primary-500 #1ee9b5, --primary-700 #128c6d,
// --primary-800 #0c5d48, converted to COBE's 0-1 rgb tuples.
const FOOTER_GLOBE_CONFIG: GlobeConfig = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.6,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.0471, 0.3647, 0.2824],
  markerColor: [0.1176, 0.9137, 0.7098],
  glowColor: [0.0706, 0.549, 0.4275],
  markers: [{ location: [51.5072, -0.1276], size: 0.08 }],
};

const DEFAULT_LOCATIONS: FooterColumnItem[] = [
  {
    id: "default-address",
    url: "/",
    label: "Address: 12th Floor, 1 Harbour Exchange Square, London E14 9GE",
  },
  { id: "default-email", url: "/", label: "Email: support@educateu.com" },
];

const DEFAULT_SOCIALS: {
  id: string;
  url: string;
  label: string;
  Icon: IconType;
}[] = [
  { id: "default-facebook", url: "#", label: "Facebook", Icon: TfiFacebook },
  { id: "default-x", url: "#", label: "X", Icon: FaXTwitter },
  { id: "default-linkedin", url: "#", label: "LinkedIn", Icon: FaLinkedinIn },
  { id: "default-instagram", url: "#", label: "Instagram", Icon: FaInstagram },
];

function toFooterLinks(items?: FooterColumnItem[]): FooterLink[] | undefined {
  if (!items?.length) return undefined;
  return items.map((item) => ({ label: item.label, href: item.url }));
}

// The support column is CMS-owned when the CMS sends one, which would drop any
// link that only exists in code. The dedupe means nothing changes here once
// the column carries it too.
function withCertificateChecker(links: FooterLink[]): FooterLink[] {
  return links.some((link) => link.href === CERTIFICATE_CHECKER_LINK.href)
    ? links
    : [...links, CERTIFICATE_CHECKER_LINK];
}

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

// Location labels are plain CMS strings like "Email: support@educateu.com" —
// pulls the address out of whichever label contains one and turns just that
// part into a highlighted mailto link, leaving the rest (e.g. the "Email: "
// prefix) as plain text.
function renderLocationLabel(label: string) {
  const match = label.match(EMAIL_PATTERN);
  if (!match || match.index === undefined) return label;

  const email = match[0];
  const before = label.slice(0, match.index);
  const after = label.slice(match.index + email.length);

  return (
    <>
      {before}
      <a
        href={`mailto:${email}`}
        className="text-primary-500 underline underline-offset-4 transition-colors hover:text-primary-400"
      >
        {email}
      </a>
      {after}
    </>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6.5">
      <p className="font-title type-h4 font-semibold text-on-dark">
        {title}
      </p>
      <div className="flex flex-col gap-3 type-body font-light text-on-dark lg:gap-3.5">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group w-fit">
            <FlipText>{link.label}</FlipText>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer({ data }: { data?: FooterData }) {
  // Sections are matched by which fields they carry rather than by `name`,
  // since the CMS's own section name ("Compnay Info") is misspelled and
  // could get corrected later without warning. Matched on "logo" alone
  // (not "description" too) since Top Section also has a "description"
  // field and would otherwise collide with this one.
  const companyInfoSection = data?.sections?.find((s) => "logo" in s.items);
  const bottomSection = data?.sections?.find(
    (s) => "company_intro" in s.items || "copyright_text" in s.items,
  );
  const topSection = data?.sections?.find(
    (s) => "title" in s.items || "cta_label" in s.items,
  );

  const heroTitleLines = htmlToLines(topSection?.items?.title?.value);
  const heroTitle = heroTitleLines.length
    ? heroTitleLines
    : [DEFAULT_HERO_TITLE];
  const heroDescription =
    topSection?.items?.description?.value?.trim() || DEFAULT_HERO_DESCRIPTION;
  const newsletterCtaLabel =
    topSection?.items?.cta_label?.value || DEFAULT_NEWSLETTER_CTA_LABEL;

  const logoSrc = companyInfoSection?.items?.logo?.value || "/logo.svg";
  const description =
    companyInfoSection?.items?.description?.value || DEFAULT_DESCRIPTION;
  const companyIntro =
    bottomSection?.items?.company_intro?.value || DEFAULT_COMPANY_INTRO;
  const copyrightText =
    bottomSection?.items?.copyright_text?.value || DEFAULT_COPYRIGHT;

  // The CMS keys this field by its own button label (e.g. "Enroll Our
  // Courses") rather than a fixed field name, so the label comes from
  // whichever key holds the "link" field, not a hardcoded string.
  const enrollField = bottomSection
    ? Object.entries(bottomSection.items).find(
        ([, field]) => field?.type === "link",
      )
    : undefined;
  const enrollLabel = enrollField?.[0] || DEFAULT_ENROLL_LABEL;
  const enrollHref = enrollField?.[1]?.value || DEFAULT_ENROLL_HREF;

  const quickLinkColumn = data?.columns?.find((c) => c.title === "Quick Link");
  const supportColumn = data?.columns?.find((c) => c.title === "Supports");
  const locationsColumn = data?.columns?.find((c) => c.title === "Locations");
  const socialsColumn = data?.columns?.find((c) => c.title === "Socials");
  const quickLinks = toFooterLinks(quickLinkColumn?.items) ?? QUICK_LINKS;
  const supportLinks = withCertificateChecker(
    toFooterLinks(supportColumn?.items) ?? SUPPORT_LINKS,
  );
  const locationItems = locationsColumn?.items?.length
    ? locationsColumn.items
    : DEFAULT_LOCATIONS;
  const socialItems = socialsColumn?.items?.filter((item) => item.logo);

  return (
    <footer className="relative overflow-hidden bg-surface-dark">
      <div
        className="pointer-events-none absolute left-[-30px] top-[250px] hidden size-[350px] opacity-40 md:block md:size-[460px] lg:left-[-40px] lg:top-[240px] lg:size-[520px] xl:left-[-30px] xl:top-[180px] xl:size-[780px]"
        aria-hidden
      >
        <div
          className="animate-float absolute inset-0"
          style={{ animationDuration: "10s" }}
        >
          <Globe
            config={FOOTER_GLOBE_CONFIG}
            className="max-w-none"
            rotationSpeed={0.002}
          />
        </div>
      </div>

      <Bounded className="relative flex flex-col items-center gap-6 pb-[76px] pt-16 text-center lg:pb-16 lg:pt-24">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <SplitTextReveal
            as="h2"
            className="font-title type-h2 max-w-4xl font-semibold text-on-dark"
          >
            {heroTitle.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead text-primary-50"
          >
            {heroDescription}
          </SplitTextReveal>
        </div>

        <SlideUpReveal delay={0.4}>
          <PrimaryButton label={enrollLabel} href={enrollHref} />
        </SlideUpReveal>
      </Bounded>

      <Bounded className="relative pb-10 lg:pb-16">
        <SlideUpReveal className="relative">
          <div className="relative z-10 overflow-hidden rounded-3xl border border-white/9 bg-[rgba(137,137,137,0.05)] px-4 py-8 backdrop-blur-[75px] md:p-8 lg:p-20">
            <EdgeGradientAnimation
              gradientBackgroundStart="rgb(8, 63, 49)"
              gradientBackgroundEnd="rgb(21, 165, 128)"
              blendingValue="screen"
              firstColor="30, 233, 181"
              secondColor="18, 140, 109"
              thirdColor="30, 233, 181"
              fourthColor="18, 140, 109"
              fifthColor="30, 233, 181"
              size="480px"
              spread={300}
              blurClassName="blur-2xl"
              interactive={false}
              fadeStart={25}
              containerClassName="absolute inset-0 h-full w-full"
            />

            <div className="relative z-10 flex flex-col gap-8 lg:gap-[68px]">
              <div className="flex flex-col gap-8 lg:gap-[159px] xl:flex-row xl:items-start xl:gap-12 2xl:gap-[159px]">
                <div className="flex flex-col gap-6 lg:gap-8">
                  <img
                    alt="educateU Business"
                    className="h-auto w-[256px] md:w-[417px]"
                    src={logoSrc}
                  />
                  <p className="type-body font-light text-on-dark lg:max-w-[456px]">
                    {description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:flex lg:gap-[84px] xl:gap-8 2xl:gap-[84px]">
                  <FooterLinkColumn title="Quick Link" links={quickLinks} />
                  <FooterLinkColumn title="Supports" links={supportLinks} />
                  <div className="flex flex-col gap-4 md:col-span-2 lg:min-w-0 lg:flex-1 lg:gap-6.5">
                    <p className="font-title type-h4 font-semibold text-on-dark">
                      Locations
                    </p>
                    <ul className="flex flex-col gap-3 type-body font-light text-on-dark lg:gap-3.5">
                      {locationItems.map((item) => (
                        <li key={item.id} className="max-w-[351px]">
                          {renderLocationLabel(item.label)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <hr className="border-t border-primary-800" />

              <div className="flex flex-col items-start gap-6 lg:gap-6 xl:flex-row xl:items-center xl:justify-between">
                <p className="font-title type-h3 font-normal text-on-dark md:max-w-[390px] xl:max-w-[502px]">
                  {companyIntro}
                </p>
                <NewsletterForm ctaLabel={newsletterCtaLabel} />
              </div>

              <hr className="border-t border-primary-800" />

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <p className="type-small text-primary-50">
                  {copyrightText}
                </p>
                <div className="flex items-center gap-4">
                  {socialItems?.length
                    ? socialItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.label}
                          className="group flex size-9 items-center justify-center rounded-full border border-accent p-2 transition-colors hover:border-0 hover:bg-primary-500"
                        >
                          <img
                            alt=""
                            src={item.logo}
                            className="size-full object-contain"
                          />
                        </Link>
                      ))
                    : DEFAULT_SOCIALS.map(({ id, url, label, Icon }) => (
                        <Link
                          key={id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="group flex items-center justify-center"
                        >
                          <Icon className="size-9 text-accent border rounded-full p-2 hover:bg-primary-500 hover:text-primary-800 hover:border-0" />
                        </Link>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </SlideUpReveal>
      </Bounded>
    </footer>
  );
}
