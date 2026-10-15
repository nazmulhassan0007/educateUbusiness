import Link from "next/link";
import {
  IoAlertCircleOutline,
  IoCheckmark,
  IoCloseOutline,
  IoDownloadOutline,
  IoOpenOutline,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import CertificateDocument, {
  formatCertificateDate,
} from "@/components/page-components/certificate-checker/CertificateDocument";
import CertificatePdfViewer from "@/components/page-components/certificate-checker/CertificatePdfViewer";
import PrintCertificateButton from "@/components/page-components/certificate-checker/PrintCertificateButton";
import { ACTION_SOLID, ACTION_SOLID_FILL, ACTION_SOLID_ICON } from "@/components/page-components/certificate-checker/actions";
import {
  verifyCertificate,
  type Certificate,
} from "@/lib/certificates/loaders";

const ACTION_LINE =
  "inline-flex h-[56px] items-center gap-2.5 rounded-full border border-[#06180b]/20 px-6 type-button font-medium text-[#06180b] outline-none transition-colors hover:border-[#06180b] focus-visible:ring-2 focus-visible:ring-[#0c7a5e]";

/**
 * Renders one lookup. Kept as its own async component so the page can stream
 * it inside a Suspense boundary: the form and the page around it paint
 * immediately and only the result waits on the API.
 */
export default async function CertificateResult({
  code,
}: {
  code: string;
}) {
  const lookup = await verifyCertificate(code);

  if (lookup.state === "unavailable") {
    return (
      <Status
        icon={IoAlertCircleOutline}
        tone="warning"
        title="We couldn’t check that certificate just now"
        body="The verification service didn’t answer. Please try again in a few minutes. The certificate itself is unaffected."
      />
    );
  }

  if (lookup.state === "not-found") {
    return (
      <Status
        icon={IoSearchOutline}
        tone="neutral"
        title="No certificate matches that code"
        body={
          <>
            Check the code against the certificate itself: it is printed
            beside the QR code, and every character counts. If it still
            doesn&rsquo;t match,{" "}
            <Link
              href="/contact-us"
              className="font-medium text-[#0c7a5e] underline underline-offset-4 transition-colors hover:text-[#06180b]"
            >
              contact our team
            </Link>{" "}
            and we&rsquo;ll look it up for you.
          </>
        }
      />
    );
  }

  const { certificate } = lookup;

  // The real certificate when there is one: the backend's own watermarked
  // PDF is the authoritative copy, so a valid certificate is shown as that
  // file and downloaded as that file. The HTML rendering stays for expired
  // and revoked certificates, whose preview endpoint 404s — there is no PDF
  // left to show, but the details still need to be readable.
  const actions = certificate.previewUrl ? (
    <>
      <a
        href={`${certificate.previewUrl}?download=1`}
        // Same-origin (it's our own proxy), so the browser honours
        // this and saves the file instead of opening its viewer.
        download={`educateU-certificate-${certificate.code}.pdf`}
        className={ACTION_SOLID}
      >
        <span aria-hidden="true" className={ACTION_SOLID_FILL} />
        <span className="relative">Download PDF</span>
        <span className={ACTION_SOLID_ICON}>
          <IoDownloadOutline className="size-[18px]" />
        </span>
      </a>
      <a
        href={certificate.previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={ACTION_LINE}
      >
        Open in a new tab
        <IoOpenOutline className="size-[18px]" />
      </a>
    </>
  ) : (
    // Print rather than a generated file: every browser's print dialog can
    // save to PDF, and the print rules in globals.css put the certificate on
    // the sheet by itself.
    <PrintCertificateButton />
  );

  return (
    <div className="flex flex-col gap-8">
      <StatusFor certificate={certificate} actions={actions} />

      {certificate.previewUrl ? (
        <CertificatePdfViewer
          previewUrl={certificate.previewUrl}
          learnerName={certificate.learnerName}
        />
      ) : (
        <CertificateDocument certificate={certificate} />
      )}
    </div>
  );
}

function StatusFor({
  certificate,
  actions,
}: {
  certificate: Certificate;
  actions: React.ReactNode;
}) {
  const expires = formatCertificateDate(certificate.expiresAt);

  if (certificate.status === "revoked") {
    return (
      <Status
        icon={IoCloseOutline}
        tone="danger"
        title="This certificate has been withdrawn"
        body="It was issued by educateU but is no longer valid, so it should not be accepted as proof of completion."
        actions={actions}
      />
    );
  }

  if (certificate.status === "expired") {
    return (
      <Status
        icon={IoTimeOutline}
        tone="warning"
        title="This certificate has expired"
        body={
          expires
            ? `It was genuinely issued by educateU and expired on ${expires}. The course can be retaken to renew it.`
            : "It was genuinely issued by educateU but has passed its renewal date. The course can be retaken to renew it."
        }
        actions={actions}
      />
    );
  }

  return (
    <Status
      icon={IoCheckmark}
      tone="success"
      title="This is a valid educateU certificate"
      body={
        <>
          Issued to <strong className="font-medium text-[#06180b]">{certificate.learnerName}</strong> for{" "}
          <strong className="font-medium text-[#06180b]">{certificate.courseName}</strong>
          {expires ? `, valid until ${expires}.` : "."}
        </>
      }
      actions={actions}
    />
  );
}

// The disc carries the verdict's colour; the words stay ink so they read on cream.
const TONES = {
  success: { disc: "bg-[#1ee9b5] text-[#06180b]", ring: "border-[#0c7a5e]/30" },
  warning: { disc: "bg-[#f5a623] text-[#06180b]", ring: "border-[#b8740a]/35" },
  danger: { disc: "bg-[#c2410c] text-white", ring: "border-[#c2410c]/35" },
  neutral: { disc: "bg-[#06180b] text-[#f2efe6]", ring: "border-[#06180b]/15" },
} as const;

function Status({
  icon: Icon,
  tone,
  title,
  body,
  actions,
}: {
  icon: IconType;
  tone: keyof typeof TONES;
  title: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      role="status"
      className={`flex flex-col gap-7 rounded-[18px] border bg-[#f7f6f1] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10 print:hidden ${t.ring}`}
    >
      <div className="flex min-w-0 items-start gap-5 sm:gap-6">
        <span className={`grid size-12 shrink-0 place-items-center rounded-full sm:size-14 ${t.disc}`}>
          <Icon aria-hidden="true" className="size-6 sm:size-7" />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-balance font-title type-h3 font-normal tracking-[-0.035em]">
            {title}
          </h2>
          <p className="m-0 mt-3 max-w-[640px] type-body text-[#06180b]/75">{body}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3 sm:pl-[80px] lg:pl-0">{actions}</div>}
    </div>
  );
}
