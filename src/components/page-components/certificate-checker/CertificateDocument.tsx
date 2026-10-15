import Image from "next/image";
import type { Certificate } from "@/lib/certificates/loaders";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatCertificateDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_FORMAT.format(date);
}

/**
 * The soft copy itself: what the learner would otherwise be holding on paper.
 *
 * `data-certificate` is what the print rules in globals.css key off — printing
 * this page puts only this element on the sheet, so "Save as PDF" in the
 * browser produces the certificate rather than a screenshot of the checker.
 */
export default function CertificateDocument({
  certificate,
}: {
  certificate: Certificate;
}) {
  const issued = formatCertificateDate(certificate.issuedAt);
  const expires = formatCertificateDate(certificate.expiresAt);

  // Exactly the fields the public verification endpoint returns — it serves
  // nothing else about the learner, by design.
  const facts = [
    issued && { label: "Date of issue", value: issued },
    { label: "Valid until", value: expires ?? "No expiry" },
    { label: "Verification code", value: certificate.code },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <article
      data-certificate
      className="overflow-hidden rounded-[18px] border border-[#06180b]/15 bg-white shadow-[0_30px_60px_-40px_rgb(6_24_11/0.45)]"
    >
      {/* The brand mark only exists as a white-on-transparent logo, so it
          rides a dark band rather than sitting on the certificate's paper. */}
      <div className="flex flex-col items-center gap-2 bg-[#0b3a28] px-6 py-6 text-center sm:px-10">
        <img alt="educateU" src="/logo.svg" className="h-10 w-auto" />
        <p className="font-title type-caption tracking-[0.3em] text-[#1ee9b5] uppercase">
          Certificate of Completion
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10 lg:px-16 lg:py-14">
        <div className="flex flex-col items-center gap-3">
          <p className="type-body font-light text-[#06180b]/70">
            This is to certify that
          </p>
          <p className="font-title text-3xl font-normal tracking-[-0.03em] text-[#06180b] sm:text-4xl lg:text-5xl">
            {certificate.learnerName}
          </p>
          <p className="type-body font-light text-[#06180b]/70">
            has successfully completed
          </p>
          <h2 className="font-title max-w-3xl text-xl font-normal tracking-[-0.02em] text-[#06180b] sm:text-2xl lg:text-3xl">
            {certificate.courseName}
          </h2>
        </div>

        <div className="h-px w-full max-w-2xl bg-[#06180b]/15" />

        <dl className="grid w-full max-w-3xl grid-cols-1 gap-5 text-left sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="type-caption tracking-[0.12em] text-[#06180b]/60 uppercase">
                {fact.label}
              </dt>
              <dd className="type-body font-medium break-words text-[#06180b]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full max-w-3xl flex-col items-center justify-between gap-6 border-t border-[#06180b]/15 pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#06180b]/15 bg-white p-2">
              <Image
                alt="CPD certified"
                src="/all-courses/cpd-logo.avif"
                width={56}
                height={56}
                className="size-full object-contain"
              />
            </span>
            <span className="text-left type-small font-light text-[#06180b]/70">
              Accredited training,
              <br />
              independently verified
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <span className="font-title type-h4 font-medium text-[#06180b]">
              educateU
            </span>
            <span className="type-small font-light text-[#06180b]/70">
              Issued on behalf of educateU Ltd
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
