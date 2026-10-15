"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import NewsletterForm from "@/components/layout/footer/NewsletterForm";
import { CERTIFICATE_CHECKER_LINK, QUICK_LINKS, SUPPORT_LINKS } from "@/components/layout/footer/footer-links";
import { EASE, type HomeCms } from "./types";

type FooterLink = { label: string; url: string };

const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
};

// Policies sit in the legal bar, not the Support column.
const POLICY = /refund|cookie/i;

// Fallbacks match the live footer, used only if the CMS sends nothing.
const FALLBACK = {
  tagline: "Skills Without Borders, Careers Without Limits",
  newsletter: "Start your learning journey today with educateU.",
  copyright: "© All rights reserved. educateU is registered in England & Wales No. 14400001",
  address: "EDUCATEU LTD 118-120 Meridian Place, Isle Of Dogs, London, England, E14 9FF",
  email: "support@educateu.com",
};
// Not in the CMS footer yet.
const PHONE = "+44 204 613 9443";
const HOURS = "UK support team · Mon – Fri, 9:00 am – 5:00 pm GMT";

const WORD = "educateU".split("");

/**
 * Footer. The tagline and newsletter, then the link columns, a quiet wordmark
 * and the legal bar. Content comes from the CMS footer.
 */
export default function Footer({ data }: { data?: HomeCms["footer"] }) {
  const cols = data?.columns ?? [];
  const col = (re: RegExp) => cols.find((c) => re.test(c.title ?? ""))?.items ?? [];
  const section = (re: RegExp) => data?.sections?.find((s) => re.test(s.name ?? ""))?.items ?? {};
  const info = section(/company|compnay/i);
  const bottom = section(/bottom/i);
  const top = section(/top/i);

  const explore: FooterLink[] = col(/quick/i).length ? col(/quick/i) : QUICK_LINKS.map((l) => ({ label: l.label, url: l.href }));
  const supportAll: FooterLink[] = col(/support/i).length ? col(/support/i) : SUPPORT_LINKS.map((l) => ({ label: l.label, url: l.href }));
  const policies = supportAll.filter((l) => POLICY.test(l.label));
  const supportRaw = supportAll.filter((l) => !POLICY.test(l.label));
  const support = supportRaw.some((l) => l.url === CERTIFICATE_CHECKER_LINK.href)
    ? supportRaw
    : [...supportRaw, { label: CERTIFICATE_CHECKER_LINK.label, url: CERTIFICATE_CHECKER_LINK.href }];
  const location = col(/location/i);
  const address = location.find((l) => !/email/i.test(l.label))?.label ?? FALLBACK.address;
  const email = location.find((l) => /email/i.test(l.label))?.label.replace(/^email:\s*/i, "") ?? FALLBACK.email;
  const socials = col(/social/i).filter((s) => SOCIAL_ICONS[s.label.toLowerCase()]);

  const tagline = info.description?.value ?? FALLBACK.tagline;
  const newsletter = top.description?.value ?? FALLBACK.newsletter;
  const copyright = bottom.copyright_text?.value ?? FALLBACK.copyright;
  const year = new Date().getFullYear();

  const rise = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10%" },
  } as const;
  const heading = "m-0 text-[13px] font-medium leading-5 text-[#f2efe6]/62";

  return (
    <footer className="relative overflow-hidden bg-[#041f17] px-5 pb-10 pt-20 text-[#f2efe6] md:px-6 md:pt-[120px]">
      <div className="mx-auto max-w-site">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <motion.div className="flex flex-col gap-7" {...rise} transition={{ duration: 0.9, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="educateU Business" className="h-11 w-auto self-start" />
            <p className="m-0 max-w-[640px] font-title text-[clamp(40px,4.5vw,64px)] leading-[1.06] tracking-[-0.03em]">
              {tagline.split(",").map((part, i, all) => (
                <span key={i} className={i === all.length - 1 ? "text-[#1ee9b5]" : undefined}>
                  {part.trim()}
                  {i < all.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
            <p className="m-0 text-[14px] leading-5 text-[#f2efe6]/75">
              {HOURS}
            </p>
          </motion.div>

          <motion.div
            className="flex w-full flex-col gap-5 rounded-[24px] border border-[#f2efe6]/10 bg-[#f2efe6]/5 p-6 md:p-8 lg:w-[580px] lg:shrink-0"
            {...rise}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          >
            <p className="m-0 font-title text-[24px] leading-[30px] tracking-[-0.02em]">{newsletter}</p>
            <NewsletterForm ctaLabel={top.cta_label?.value} variant="field" />
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-[#f2efe6]/10 pt-12 md:mt-24 lg:grid-cols-4">
          {[
            { title: "Explore", links: explore },
            { title: "Support", links: support },
          ].map((group, g) => (
            <motion.nav key={group.title} aria-label={group.title} className="flex flex-col gap-5" {...rise} transition={{ duration: 0.9, delay: 0.1 + g * 0.08, ease: EASE }}>
              <h3 className={heading}>{group.title}</h3>
              <ul className="m-0 grid list-none gap-3 p-0">
                {group.links.map((l) => (
                  <li key={l.url + l.label}>
                    <Link href={l.url} className="text-[16px] leading-6 text-[#f2efe6] transition-colors hover:text-[#1ee9b5]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}

          <motion.div className="col-span-2 flex flex-col gap-5 sm:col-span-1" {...rise} transition={{ duration: 0.9, delay: 0.26, ease: EASE }}>
            <h3 className={heading}>Contact</h3>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${email}`} className="text-[16px] leading-6 transition-colors hover:text-[#1ee9b5]">
                {email}
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-[16px] leading-6 transition-colors hover:text-[#1ee9b5]">
                {PHONE}
              </a>
              <address className="max-w-[260px] text-[14px] not-italic leading-[22px] text-[#f2efe6]/70">{address}</address>
            </div>
          </motion.div>

          {socials.length > 0 && (
            <motion.div className="col-span-2 flex flex-col gap-5 sm:col-span-1" {...rise} transition={{ duration: 0.9, delay: 0.32, ease: EASE }}>
              <h3 className={heading}>Follow educateU</h3>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.label.toLowerCase()];
                  return (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`educateU on ${s.label}`}
                        className="grid size-11 place-items-center rounded-full border border-[#f2efe6]/18 transition-colors hover:border-[#1ee9b5] hover:bg-[#1ee9b5] hover:text-[#06180b]"
                      >
                        <Icon size={15} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Wordmark: each letter rises in turn as the footer arrives. */}
        <div aria-hidden="true" className="flex h-[clamp(120px,21vw,300px)] select-none justify-center overflow-hidden pt-[clamp(32px,5vw,72px)]">
          {WORD.map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block font-title text-[clamp(110px,21vw,300px)] leading-none tracking-[-0.05em] text-[#f2efe6]/6"
              initial={{ y: "60%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.05, ease: EASE }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[#f2efe6]/10 pt-6 text-[13px] leading-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="m-0 text-[#f2efe6]/65">{copyright.replace(/^©\s*/, `© ${year} `)}</p>
            {policies.map((l) => (
              <Link key={l.url} href={l.url} className="text-[#f2efe6]/80 underline underline-offset-2 hover:text-[#f2efe6]">
                {l.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3 self-start text-[#f2efe6]/80 hover:text-[#f2efe6] sm:self-auto"
          >
            Back to top
            <span className="grid size-11 place-items-center rounded-full border border-[#f2efe6]/22 transition-transform duration-300 group-hover:-translate-y-0.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 13V1M2 6l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
