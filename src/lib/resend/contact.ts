import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { resend } from "./server";
import { normaliseEmail } from "@/lib/validation/email";
import { deliverableEmailProblem } from "@/lib/validation/email-server";
import { DEFAULT_PHONE_COUNTRY, PHONE_INVALID } from "@/lib/validation/phone";

export type ContactEnquiry = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  inquiry: string;
  message: string;
};

// `field` names the input the error belongs to, so the form can show it there.
export type SendContactResult =
  | { success: true }
  | { success: false; error: string; field?: keyof ContactEnquiry };

const MAX_NAME = 100;
const MAX_INQUIRY = 60;
const MAX_MESSAGE = 5000;

// Enquiry fields are unsanitized text input — escape before interpolating
// into raw HTML, same as the order-confirmation email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderContactEnquiryHtml(enquiry: ContactEnquiry): string {
  const rows: [string, string][] = [
    ["Name", `${enquiry.firstName} ${enquiry.lastName}`],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Inquiry Type", enquiry.inquiry || "Not specified"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;font-size:13px;font-weight:700;color:#1ee9b5;text-transform:uppercase;letter-spacing:1px;width:140px;vertical-align:top;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:10px 0;font-size:15px;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            ${escapeHtml(value)}
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
                  New Contact Enquiry
                </p>
                <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">
                  Someone submitted the contact form
                </h1>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${rowsHtml}
                </table>

                <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.09);">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#1ee9b5;text-transform:uppercase;letter-spacing:1px;">
                    Message
                  </p>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);white-space:pre-wrap;">
                    ${escapeHtml(enquiry.message)}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderContactEnquiryText(enquiry: ContactEnquiry): string {
  return [
    "New contact enquiry",
    "",
    `Name: ${enquiry.firstName} ${enquiry.lastName}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Inquiry Type: ${enquiry.inquiry || "Not specified"}`,
    "",
    "Message:",
    enquiry.message,
  ].join("\n");
}

export async function sendContactEnquiry(
  input: ContactEnquiry,
): Promise<SendContactResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName) return { success: false, field: "firstName", error: "Enter your first name." };
  if (!lastName) return { success: false, field: "lastName", error: "Enter your last name." };
  if (firstName.length > MAX_NAME || lastName.length > MAX_NAME) {
    return {
      success: false,
      field: firstName.length > MAX_NAME ? "firstName" : "lastName",
      error: `Names can be up to ${MAX_NAME} characters.`,
    };
  }

  const emailError = await deliverableEmailProblem(input.email);
  if (emailError) return { success: false, field: "email", error: emailError };

  if (!input.phone.trim()) return { success: false, field: "phone", error: "Enter a phone number." };
  // The full metadata checks the digits themselves, not just their length —
  // the form's own check uses the lighter one.
  const phone = parsePhoneNumberFromString(input.phone.trim(), DEFAULT_PHONE_COUNTRY);
  if (!phone?.isValid()) return { success: false, field: "phone", error: PHONE_INVALID };

  const message = input.message.trim();
  if (!message) return { success: false, field: "message", error: "Enter a message." };
  if (message.length > MAX_MESSAGE) {
    return { success: false, field: "message", error: `Keep your message under ${MAX_MESSAGE} characters.` };
  }

  const enquiry: ContactEnquiry = {
    firstName,
    lastName,
    email: normaliseEmail(input.email),
    // One consistent format in the team's inbox, whatever was typed.
    phone: phone.formatInternational(),
    inquiry: input.inquiry.trim().slice(0, MAX_INQUIRY),
    message,
  };

  const to = process.env.RESEND_CONTACT_TO_EMAIL;
  if (!to) {
    throw new Error(
      "RESEND_CONTACT_TO_EMAIL is not set in environment variables.",
    );
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mail.educateu.com",
    to,
    replyTo: enquiry.email,
    subject: `New contact enquiry: ${enquiry.inquiry || "General enquiry"}`,
    html: renderContactEnquiryHtml(enquiry),
    text: renderContactEnquiryText(enquiry),
  });

  if (error) {
    return { success: false, error: "Could not send your message right now" };
  }

  return { success: true };
}
