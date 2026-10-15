export type FooterLink = {
  label: string;
  href: string;
};

export const QUICK_LINKS: FooterLink[] = [
  { label: "Courses", href: "/courses" },
  // { label: "About us", href: "/about" }, // hidden for now — the /about page itself is kept
  // { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact-us" },
];

// Linked from code rather than left to the CMS: /certificate-checker is a
// route in this app, so a CMS-managed "Supports" column has no way to know it
// exists — and that column replaces this list whenever the CMS sends one.
// Footer.tsx appends this to whichever list it ends up rendering.
export const CERTIFICATE_CHECKER_LINK: FooterLink = {
  label: "Certificate Checker",
  href: "/certificate-checker",
};

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "Support Hub", href: "/support-hub" },
  CERTIFICATE_CHECKER_LINK,
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cookies Policy", href: "/cookies-policy" },
];
