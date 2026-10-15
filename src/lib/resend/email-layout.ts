// The shell every educateU email is built on, styled after the site's footer:
// deep green ground, cream type, mint accents, the soft-bordered rounded card
// the newsletter form sits in, and the two-tone headline ("Skills Without
// Borders, / Careers Without Limits").
//
// Email HTML rules apply: tables for layout, inline styles only, no SVG, and
// images from a public URL. The site's fonts load where the client allows it
// (Apple Mail, iOS); everywhere else falls back to Helvetica/Arial.

export const EMAIL_COLORS = {
  page: "#041f17",
  card: "#0f2920",
  border: "rgba(255,255,255,0.10)",
  cream: "#f2efe6",
  muted: "rgba(242,239,230,0.70)",
  faint: "rgba(242,239,230,0.50)",
  mint: "#1ee9b5",
  ink: "#06180b",
};

const SANS = "'Stack Sans Text','Helvetica Neue',Helvetica,Arial,sans-serif";
const TITLE = "'Stack Sans Notch','Helvetica Neue',Helvetica,Arial,sans-serif";

const SUPPORT_EMAIL = "support@educateu.com";
const SUPPORT_PHONE = "+44 204 613 9443";
const ADDRESS = "EDUCATEU LTD, 118-120 Meridian Place, Isle Of Dogs, London, E14 9FF";
const COMPANY = "educateU is registered in England &amp; Wales No. 14400001";
const SOCIALS: [string, string][] = [
  ["LinkedIn", "https://www.linkedin.com/company/educateuofficial/"],
  ["Instagram", "https://www.instagram.com/educateuofficial/"],
  ["Facebook", "https://www.facebook.com/educateu/"],
  ["YouTube", "https://www.youtube.com/@educateU_official"],
  ["TikTok", "https://www.tiktok.com/@educateuofficial"],
];

// Unsanitized input (an address, an enquiry) goes through this before it
// gets anywhere near the HTML.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Where links and the logo in an email point. An email is opened far from the
 * request that sent it, so this is the public site (NEXT_PUBLIC_BASE_URL)
 * rather than whatever origin the request came in on — a sign-up from
 * localhost must still get a logo that loads.
 */
export function publicSiteUrl(fallback: string): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? fallback).replace(/\/+$/, "");
}

/** A mint pill button, as on the site. Rounded corners square off in Outlook, which is fine. */
export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="border-radius:999px;background-color:${EMAIL_COLORS.mint};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:16px;font-weight:500;line-height:20px;color:${EMAIL_COLORS.ink};text-decoration:none;border-radius:999px;">${escapeHtml(label)}&nbsp;&nbsp;&rarr;</a>
    </td>
  </tr>
</table>`;
}

/** Label/value rows, for emails that report details (a new subscriber, an enquiry). */
export function emailDetails(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  ${rows
    .map(
      ([label, value]) => `<tr>
    <td style="padding:12px 0;border-top:1px solid ${EMAIL_COLORS.border};font-family:${SANS};font-size:13px;line-height:20px;color:${EMAIL_COLORS.faint};width:120px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:12px 0;border-top:1px solid ${EMAIL_COLORS.border};font-family:${SANS};font-size:15px;line-height:20px;color:${EMAIL_COLORS.cream};">${escapeHtml(value)}</td>
  </tr>`,
    )
    .join("")}
</table>`;
}

export type EmailLayout = {
  /** Public site origin, from publicSiteUrl(). */
  site: string;
  /** Inbox preview text, shown after the subject line. */
  preheader: string;
  /** Small label above the headline, with the site's mint dot. */
  eyebrow: string;
  /** Two-tone headline: the first line in cream, the second in mint. */
  headline: [string, string];
  /** Card body — trusted HTML; escape any user input before passing it in. */
  body: string;
  /** Why the reader got this email, plus any unsubscribe link — trusted HTML. */
  footnote?: string;
};

export function renderEmail({ site, preheader, eyebrow, headline, body, footnote }: EmailLayout): string {
  const logo = `${site}/educateU%20business%20white%20logo.png`;
  const c = EMAIL_COLORS;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <link href="https://fonts.googleapis.com/css2?family=Stack+Sans+Notch:wght@400;500&family=Stack+Sans+Text:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      @media (max-width: 600px) {
        .eu-pad { padding-left: 24px !important; padding-right: 24px !important; }
        .eu-headline { font-size: 32px !important; line-height: 36px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${c.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${c.page};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
            <tr>
              <td style="padding:0 8px 32px 8px;">
                <a href="${escapeHtml(site)}" style="text-decoration:none;">
                  <img src="${logo}" width="168" height="55" alt="educateU Business" style="display:block;border:0;outline:none;width:168px;height:auto;color:${c.cream};font-family:${SANS};font-size:20px;" />
                </a>
              </td>
            </tr>
            <tr>
              <td class="eu-pad" style="background-color:${c.card};border:1px solid ${c.border};border-radius:26px;padding:40px;">
                <p style="margin:0 0 20px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${c.muted};">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:8px;background-color:${c.mint};margin-right:8px;vertical-align:middle;"></span><span style="vertical-align:middle;">${escapeHtml(eyebrow)}</span>
                </p>
                <h1 class="eu-headline" style="margin:0 0 20px 0;font-family:${TITLE};font-size:40px;line-height:44px;font-weight:500;letter-spacing:-1.2px;color:${c.cream};">
                  ${escapeHtml(headline[0])}<br /><span style="color:${c.mint};">${escapeHtml(headline[1])}</span>
                </h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:32px 8px 0 8px;font-family:${SANS};font-size:13px;line-height:20px;color:${c.faint};">
                <p style="margin:0 0 12px 0;">
                  ${SOCIALS.map(([name, url]) => `<a href="${url}" style="color:${c.cream};text-decoration:none;">${name}</a>`).join(`&nbsp;&nbsp;<span style="color:${c.faint};">&middot;</span>&nbsp;&nbsp;`)}
                </p>
                <p style="margin:0 0 12px 0;">
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:${c.faint};text-decoration:none;">${SUPPORT_EMAIL}</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;${SUPPORT_PHONE}<br />
                  UK support team &middot; Mon &ndash; Fri, 9:00 am &ndash; 5:00 pm GMT
                </p>
                ${footnote ? `<p style="margin:0 0 12px 0;">${footnote}</p>` : ""}
                <p style="margin:0;padding-top:16px;border-top:1px solid ${c.border};">
                  ${ADDRESS}<br />${COMPANY}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
