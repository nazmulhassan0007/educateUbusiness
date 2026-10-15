import { resend } from "./server";
import { getCourseBySlug } from "@/lib/courses/loaders";

// buyer_name/course titles are interpolated into raw HTML below — escape
// first since buyer_name comes from an unsanitized text input on /checkout.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Mirrors the site's dark theme tokens (globals.css): --surface-dark
// (#06180b), --surface-dark-2 (#08210f, used for the card), --primary-500
// (#1ee9b5, the mint accent), --on-dark (#ffffff). Built with a
// table-based layout and inline styles throughout — email clients (most
// notably Outlook desktop) don't reliably support flexbox/grid or <style>
// blocks the way browsers do, so the site's own CSS can't be reused as-is.
function renderOrderConfirmationHtml({
  firstName,
  courseTitles,
  total,
}: {
  firstName: string;
  courseTitles: string[];
  total: string;
}): string {
  const courseRows = courseTitles
    .map(
      (title, index) => `
        <tr>
          <td style="padding:14px 16px;${
            index < courseTitles.length - 1
              ? "border-bottom:1px solid rgba(255,255,255,0.06);"
              : ""
          }">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:10px;vertical-align:middle;">
                  <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#1ee9b5;font-size:0;line-height:0;">&nbsp;</span>
                </td>
                <td style="font-size:15px;color:#ffffff;vertical-align:middle;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  ${escapeHtml(title)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#06180b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#06180b;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#08210f;border:1px solid rgba(255,255,255,0.09);border-radius:16px;">
            <tr>
              <td style="padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.09);">
                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#1ee9b5;letter-spacing:-0.5px;">educateU</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#1ee9b5;text-transform:uppercase;letter-spacing:1px;">
                  Order Confirmed
                </p>
                <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">
                  Thanks, ${firstName}!
                </h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.7);">
                  Your payment went through and your order is confirmed. Here&rsquo;s a summary for your records.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;margin-bottom:24px;">
                  ${courseRows}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.09);">
                  <tr>
                    <td style="padding:16px 0 0 0;font-size:14px;color:rgba(255,255,255,0.7);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                      Total paid
                    </td>
                    <td align="right" style="padding:16px 0 0 0;font-size:22px;font-weight:700;color:#1ee9b5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                      ${total}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;background-color:#06180b;border-top:1px solid rgba(255,255,255,0.09);border-radius:0 0 16px 16px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.5);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  Keep this email as your proof of purchase. If you have any questions, just reply to this email.
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

function renderOrderConfirmationText({
  firstName,
  courseTitles,
  total,
}: {
  firstName: string;
  courseTitles: string[];
  total: string;
}): string {
  const lines = [
    `Thanks, ${firstName}!`,
    "",
    "Your payment went through and your order is confirmed.",
    "",
    ...courseTitles.map((title) => `- ${title}`),
    "",
    `Total paid: ${total}`,
    "",
    "Keep this email as your proof of purchase.",
  ];
  return lines.join("\n");
}

export async function sendOrderConfirmationEmail({
  buyerName,
  buyerEmail,
  slugs,
  amount,
  currency,
}: {
  buyerName: string;
  buyerEmail: string;
  slugs: string[];
  amount: number; // in the currency's smallest unit (pence for GBP)
  currency: string;
}) {
  if (!buyerEmail || slugs.length === 0) return;

  const courses = await Promise.all(
    slugs.map((slug) => getCourseBySlug(slug).catch(() => null)),
  );
  const courseTitles = courses
    .map((course) => course?.data?.title)
    .filter((title): title is string => Boolean(title));

  const total = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const firstName = escapeHtml(buyerName.trim().split(" ")[0] || "there");

  // Resend's SDK returns `{ data, error }` rather than throwing on
  // API-level failures (bad recipient, unverified domain, rate limit,
  // etc.) — check `error` explicitly so the caller's try/catch actually
  // sees a failed send, not a false "it worked."
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mail.educateu.com",
    to: buyerEmail,
    subject: "Your educateU order confirmation",
    html: renderOrderConfirmationHtml({ firstName, courseTitles, total }),
    text: renderOrderConfirmationText({
      firstName: buyerName.trim().split(" ")[0] || "there",
      courseTitles,
      total,
    }),
  });

  if (error) {
    throw new Error(`Resend failed to send: ${error.message}`);
  }
}
