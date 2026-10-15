import RefundDocument from "./RefundDocument";

export type RefundPolicyContentData = {
  document_name: string;
  effective_date: string;
  document_status: string;
  // Rich HTML from the CMS: a flat sequence of <h3> section headings
  // followed by either a <p> or a <ul><li><p>...</p></li></ul> list.
  content: string;
};

export const DEFAULT_CONTENT: RefundPolicyContentData = {
  document_name: "Refund Policy",
  effective_date: "January 2026",
  document_status: "Approved",
  content: `
    <h3>1.0 Policy Statement</h3>
    <p>EducateU is deeply committed to upholding the highest standards of professionalism, transparency, and compliance in delivering educational courses. To ensure absolute clarity and fairness in our refund processes, we have meticulously outlined the following comprehensive Refund Policy.</p>
    <h3>2.0 Eligibility</h3>
    <ul>
      <li><p>Students formally notify the institution of their intention to withdraw from a course at least 7 days prior to the scheduled commencement date.</p></li>
      <li><p>Students formally notify the institution of their intention to withdraw from a course at least 7 days prior to the scheduled commencement date.</p></li>
    </ul>
    <h3>3.0 Refund Amount</h3>
    <ul>
      <li><p>Upon approving a refund request that meets the eligibility criteria above, the institution promptly initiates a refund equivalent to the total amount of the course fee originally paid by the student.</p></li>
      <li><p>An administrative deduction of £45 applies to cover processing fees. This deduction ensures the sustainability of administrative operations while facilitating fair and efficient refund transactions.</p></li>
    </ul>
    <h3>4.0 Process</h3>
    <ul>
      <li><p>An administrative deduction of £45 applies to cover processing fees. This deduction ensures the sustainability of administrative operations while facilitating fair and efficient refund transactions.</p></li>
      <li><p>The refund application should include the learner's full name, course title, and a concise explanation for withdrawal. This information enables us to expedite the processing of refunds while maintaining accuracy and accountability.</p></li>
      <li><p>The institution pledges to expedite the refund process, with reimbursements typically processed within 14 business days from the date of receiving the refund request. We prioritise prompt resolution to minimise any inconvenience to the learner.</p></li>
      <li><p>Refunds are disbursed utilising the same method of payment employed for the initial transaction. This practice ensures consistency and security in financial transactions.</p></li>
    </ul>
    <h3>5.0 Exceptions</h3>
    <ul>
      <li><p>In the rare occurrence of a course cancellation by EducateU, learners are entitled to a complete refund of the course fee, devoid of any administrative charges. This ensures that circumstances beyond their control do not financially burden learners.</p></li>
      <li><p>Requests for refunds due to extenuating circumstances, such as medical emergencies or unforeseen hardships, will be evaluated on an individual basis by the Management. We prioritise compassion and understanding in such situations while also upholding the integrity of our refund process.</p></li>
    </ul>
    <h3>6.0 Learner Obligations</h3>
    <ul>
      <li><p>We emphasise that learners are responsible for ensuring their eligibility and suitability for the chosen course prior to enrollment. This includes meeting any prerequisites specified by the awarding body. It is incumbent upon learners to diligently assess their readiness and commitment to the course, thereby minimising the likelihood of withdrawal and optimising their learning experience.</p></li>
      <li><p>Learners must ensure they have reliable access to the internet and the necessary technology (e.g. a computer, webcam and microphone) to complete the course and assessments.</p></li>
    </ul>
    <h3>7.0 Cancellations</h3>
    <ul>
      <li><p>EducateU reserves the right to cancel a course due to unforeseen circumstances, including but not limited to insufficient enrollment, instructor unavailability, or force majeure events. In such cases, learners will be notified promptly, and a full refund will be provided. This policy underscores our commitment to transparency, accountability, and student welfare.</p></li>
    </ul>
    <h3>8.0 Monitoring Arrangements</h3>
    <ul>
      <li><p>This Refund Policy is reviewed annually to ensure its ongoing relevance and effectiveness. The review process includes an assessment of any changes in applicable laws, regulations, or organisational practices that may necessitate updates to the policy. The Finance Manager, along with the management team, convenes a review committee consisting of relevant stakeholders, including legal counsel and finance department representatives, to evaluate the policy.</p></li>
    </ul>
  `,
};

export type RefundSection = { id: string; num: string; title: string; html: string };

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * The policy as the page uses it: the document details, and the rich text cut
 * into its numbered sections (one per <h3>, "1.0 Policy Statement" read as
 * number 01 and title "Policy Statement"), plus a reading time.
 */
export function resolveRefundContent(data?: Partial<RefundPolicyContentData>) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const html = content.content || DEFAULT_CONTENT.content;
  const sections: RefundSection[] = [];
  for (const m of html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/g)) {
    const heading = strip(m[1]);
    const parts = heading.match(/^(\d+)(?:\.\d+)?[.)]?\s+(.+)$/);
    const n = parts ? Number(parts[1]) : sections.length + 1;
    const title = parts ? parts[2] : heading;
    sections.push({
      id: `refund-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      num: String(n).padStart(2, "0"),
      title,
      html: m[2].trim(),
    });
  }
  // Text with no section headings still shows, as one section.
  if (!sections.length && strip(html)) {
    sections.push({ id: "refund-policy", num: "01", title: content.document_name || DEFAULT_CONTENT.document_name, html });
  }
  return {
    meta: {
      name: content.document_name || DEFAULT_CONTENT.document_name,
      effective: content.effective_date || DEFAULT_CONTENT.effective_date,
      status: content.document_status || DEFAULT_CONTENT.document_status,
    },
    sections,
    minutes: Math.max(1, Math.round(strip(html).split(" ").length / 200)),
  };
}

export default function RefundPolicyContent({
  data,
}: {
  data?: Partial<RefundPolicyContentData>;
}) {
  const { sections } = resolveRefundContent(data);
  return <RefundDocument sections={sections} />;
}
