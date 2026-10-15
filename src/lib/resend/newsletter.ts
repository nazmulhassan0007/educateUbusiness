import { resend } from "./server";
import { EMAIL_COLORS, emailButton, emailDetails, escapeHtml, publicSiteUrl, renderEmail } from "./email-layout";
import { isValidUnsubscribeToken, unsubscribeQuery } from "./unsubscribe-token";
import { normaliseEmail } from "@/lib/validation/email";
import { deliverableEmailProblem } from "@/lib/validation/email-server";

// `unsubscribeQuery` lets the form offer an "Unsubscribe" right after signing
// up. It's only returned when this request is what added the address, so the
// worst the form can do is undo its own sign-up — never take an existing
// subscriber off the list by typing their email in.
export type SubscribeResult =
  | { success: true; alreadySubscribed: true }
  | { success: true; unsubscribeQuery: string }
  | { success: false; error: string };

export type UnsubscribeResult = { success: true } | { success: false; error: string };

const WHAT_YOU_GET: [string, string][] = [
  ["New courses", "Be first to hear when a new course launches."],
  ["Offers", "Discounts and bundles for you and your team."],
  ["Learning resources", "Guides and tips to help you keep learning."],
];

// The welcome note: what the newsletter brings, a way into the courses, and
// the unsubscribe link at the bottom, where readers look for it.
export function renderWelcomeHtml(email: string, site: string, unsubscribeUrl: string): string {
  const c = EMAIL_COLORS;
  const font = "'Stack Sans Text','Helvetica Neue',Helvetica,Arial,sans-serif";

  const list = WHAT_YOU_GET.map(
    ([title, text], i) => `<tr>
      <td width="44" style="padding:0 0 18px 0;vertical-align:top;">
        <!-- A table cell, not a div: email clients disagree on line-height
             centring in a div, but all of them centre a cell's content. -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="32" height="32" align="center" valign="middle" style="width:32px;height:32px;padding:0;border-radius:32px;background-color:${c.mint};color:${c.ink};font-family:${font};font-size:14px;font-weight:600;line-height:14px;mso-line-height-rule:exactly;text-align:center;vertical-align:middle;">${i + 1}</td>
          </tr>
        </table>
      </td>
      <td style="padding:4px 0 18px 0;vertical-align:top;font-family:${font};">
        <p style="margin:0;font-size:17px;line-height:24px;font-weight:500;color:${c.cream};">${title}</p>
        <p style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:${c.muted};">${text}</p>
      </td>
    </tr>`,
  ).join("");

  return renderEmail({
    site,
    preheader: "Thanks for subscribing. Here's what we'll send you.",
    eyebrow: "You're subscribed",
    headline: ["You're on the list.", "Welcome to educateU."],
    body: `<p style="margin:0 0 28px 0;font-family:${font};font-size:16px;line-height:26px;color:${c.muted};">
        Thanks for signing up. Here&rsquo;s what you&rsquo;ll get from us &mdash; and nothing else.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">${list}</table>
      ${emailButton("Browse courses", `${site}/courses`)}`,
    footnote: `You&rsquo;re receiving this because ${escapeHtml(email)} subscribed on the educateU website. Don&rsquo;t want these emails? <a href="${escapeHtml(unsubscribeUrl)}" style="color:${c.mint};text-decoration:underline;">Unsubscribe</a>`,
  });
}

/**
 * What the team sees: the address that just subscribed, sent to the same
 * inbox the contact form reports to (`RESEND_CONTACT_TO_EMAIL`).
 *
 * The subscriber is already saved in the Resend audience by the time this
 * runs, so the audience remains the list of record — this is the team
 * finding out about it without going to look.
 */
export function renderSubscriberNoticeHtml(email: string, when: string, site: string): string {
  return renderEmail({
    site,
    preheader: `${email} subscribed to the newsletter.`,
    eyebrow: "Newsletter",
    headline: ["New subscriber.", "Someone just signed up."],
    body: emailDetails([
      ["Email", email],
      ["Subscribed", when],
      ["Source", "Website newsletter form"],
    ]),
    footnote: "Sent to the educateU team. Reply to this email to write to the subscriber.",
  });
}

// Best-effort, and deliberately after the subscription itself: the contact
// is already in the audience, so a notification that doesn't send must not
// turn a successful subscribe into an error for the reader.
async function notifyTeamOfSubscriber(email: string, site: string) {
  const to = process.env.RESEND_CONTACT_TO_EMAIL;
  if (!to) {
    console.error(
      "[newsletter] RESEND_CONTACT_TO_EMAIL is not set — no subscriber notification sent.",
    );
    return;
  }

  const when = new Date().toUTCString();

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mail.educateu.com",
    to,
    // So a reply from the team reaches the person who subscribed, the same
    // way a reply to a contact enquiry does.
    replyTo: email,
    subject: `New newsletter subscriber: ${email}`,
    html: renderSubscriberNoticeHtml(email, when, site),
    text: [
      "New newsletter subscriber",
      "",
      `Email: ${email}`,
      `Subscribed: ${when}`,
      "Source: Website newsletter form",
    ].join("\n"),
  });

  if (error) {
    console.error("[newsletter] Subscriber notification failed:", error);
  }
}

/**
 * `siteUrl` is the origin the sign-up came from; the unsubscribe links in the
 * welcome email point back to it.
 */
export async function subscribeToNewsletter(
  rawEmail: string,
  siteUrl: string,
): Promise<SubscribeResult> {
  const problem = await deliverableEmailProblem(rawEmail);
  if (problem) {
    return { success: false, error: problem };
  }
  const email = normaliseEmail(rawEmail);

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    throw new Error("RESEND_AUDIENCE_ID is not set in environment variables.");
  }

  // Already on the list: nothing to do, and no second welcome email — the
  // form shouldn't be a way to send someone the same email over and over.
  // Someone who unsubscribed earlier and signs up again is switched back on.
  const { data: existing } = await resend.contacts.get({ email, audienceId });
  if (existing && !existing.unsubscribed) {
    return { success: true, alreadySubscribed: true };
  }

  const { error: contactError } = existing
    ? await resend.contacts.update({ email, audienceId, unsubscribed: false })
    : await resend.contacts.create({ email, audienceId, unsubscribed: false });

  if (contactError) {
    console.error("[newsletter] Contact save failed:", contactError);
    return { success: false, error: "Could not subscribe right now" };
  }

  const query = unsubscribeQuery(email);
  // Links to read later from an inbox go to the public site; the unsubscribe
  // links stay on the origin that signed them.
  const site = publicSiteUrl(siteUrl);
  const unsubscribePage = `${siteUrl}/newsletter/unsubscribe?${query}`;

  // Best-effort welcome email — a failure here shouldn't undo the
  // subscription itself, since the contact is already saved above.
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mail.educateu.com",
    to: email,
    subject: "Welcome to the educateU newsletter",
    html: renderWelcomeHtml(email, site, unsubscribePage),
    text: [
      "You're on the list. Welcome to educateU.",
      "",
      "Thanks for signing up. Here's what you'll get from us:",
      ...WHAT_YOU_GET.map(([title, text], i) => `${i + 1}. ${title} - ${text}`),
      "",
      `Browse courses: ${site}/courses`,
      "",
      `You're receiving this because ${email} subscribed on the educateU website.`,
      `Unsubscribe: ${unsubscribePage}`,
    ].join("\n"),
    // RFC 8058 one-click unsubscribe: Gmail, Yahoo and Apple Mail show their
    // own "Unsubscribe" button and POST straight to this endpoint.
    headers: {
      "List-Unsubscribe": `<${siteUrl}/api/newsletter/unsubscribe?${query}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (emailError) {
    console.error("[newsletter] Welcome email failed to send:", emailError);
  }

  // The team's copy — same inbox the contact form reports to.
  await notifyTeamOfSubscriber(email, site);

  return { success: true, unsubscribeQuery: query };
}

export async function unsubscribeFromNewsletter(
  email: string,
  token: string,
): Promise<UnsubscribeResult> {
  if (!email || !token || !isValidUnsubscribeToken(email, token)) {
    return { success: false, error: "This unsubscribe link isn't valid." };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    throw new Error("RESEND_AUDIENCE_ID is not set in environment variables.");
  }

  // The contact stays in the audience, marked unsubscribed, rather than being
  // deleted: Resend then skips it on every broadcast, and a later sign-up
  // simply switches it back on.
  const { error } = await resend.contacts.update({
    email: normaliseEmail(email),
    audienceId,
    unsubscribed: true,
  });

  // Not in the audience at all is the outcome they asked for anyway.
  if (error && error.name !== "not_found") {
    console.error("[newsletter] Unsubscribe failed:", error);
    return { success: false, error: "Could not unsubscribe right now. Please try again." };
  }

  return { success: true };
}
