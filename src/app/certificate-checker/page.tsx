import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CertificateHero from "@/components/page-components/certificate-checker/CertificateHero";
import CertificateLookupForm from "@/components/page-components/certificate-checker/CertificateLookupForm";
import CertificateResult from "@/components/page-components/certificate-checker/CertificateResult";
import ClearResultOnReload from "@/components/page-components/certificate-checker/ClearResultOnReload";

export const metadata: Metadata = {
  title: "Certificate Checker | educateU",
  description:
    "Enter an educateU certificate's verification code to confirm it is genuine and view the certificate it belongs to.",
};

// What a check answers, in the order an employer asks it.
const CONFIRMS = [
  { q: "Who it was issued to", a: "The learner’s name, exactly as it appears on the certificate." },
  { q: "Which course it covers", a: "The educateU course the certificate was awarded for." },
  { q: "When it was issued", a: "The date of issue, and the renewal date if the certificate has one." },
  { q: "Whether it still stands", a: "Valid, expired, or withdrawn by educateU." },
];

export default async function CertificateCheckerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await searchParams;
  // The code lives in the URL rather than in component state so a checked
  // certificate has an address of its own — shareable, printable straight
  // from a link an employer has been sent, and the target a certificate's own
  // QR code redirects to (see src/app/certificates/verify/[code]).
  const certificateCode = (typeof code === "string" ? code : "").trim();

  return (
    <>
      {/* Refreshing the page must not re-show the certificate someone
          checked before — the code is in the URL, so it survives a reload
          unless something takes it out. */}
      <ClearResultOnReload code={certificateCode} />

      <CertificateHero checked={Boolean(certificateCode)}>
        {/* Keyed so the field is rebuilt when the code changes — including
            back to empty, which is what a reload does (ClearResultOnReload
            above). An uncontrolled input the reader has already typed into
            would otherwise keep the old code. */}
        <CertificateLookupForm
          key={certificateCode}
          defaultValue={certificateCode}
        />
      </CertificateHero>

      <section
        aria-label={certificateCode ? "Result" : undefined}
        aria-labelledby={certificateCode ? undefined : "confirms-title"}
        className="bg-[#f2efe6] px-5 py-16 text-[#06180b] selection:bg-[#1ee9b5]/40 md:px-10 lg:pb-[128px] lg:pt-[96px] print:bg-white print:p-0"
      >
        <div className="mx-auto max-w-site">
          {certificateCode ? (
            // Keyed on the code so each lookup gets its own boundary and the
            // skeleton comes back for the next one instead of the page
            // sitting on the previous result.
            <Suspense key={certificateCode} fallback={<ResultSkeleton />}>
              <CertificateResult code={certificateCode} />
            </Suspense>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-24">
              <div>
                <h2 id="confirms-title" className="m-0 font-title type-h2 font-normal tracking-[-0.04em]">
                  What a check confirms
                </h2>
                <p className="m-0 mt-5 max-w-[380px] type-lead text-[#06180b]/75">
                  The answer comes straight from our records, so it&rsquo;s the same one we&rsquo;d give if you asked us.
                  Can&rsquo;t find a code?{" "}
                  <Link href="/contact-us" className="font-medium text-[#0c7a5e] underline underline-offset-4 transition-colors hover:text-[#06180b]">
                    Contact our team
                  </Link>
                  .
                </p>
              </div>
              <dl className="m-0 border-t border-[#06180b]/15">
                {CONFIRMS.map((c) => (
                  <div
                    key={c.q}
                    className="grid gap-2 border-b border-[#06180b]/15 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10 md:py-8"
                  >
                    <dt className="flex items-center gap-4 font-title type-h4 tracking-[-0.03em]">
                      <span aria-hidden="true" className="size-2 shrink-0 bg-[#0c7a5e]" />
                      {c.q}
                    </dt>
                    <dd className="m-0 pl-6 type-body text-[#06180b]/75 md:pl-0 md:pt-1">{c.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ResultSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden>
      <div className="h-[132px] rounded-[18px] bg-[#06180b]/[0.06]" />
      <div className="h-[560px] rounded-[18px] bg-[#06180b]/[0.06]" />
    </div>
  );
}
