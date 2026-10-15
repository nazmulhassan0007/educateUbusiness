import { IoDocumentTextOutline } from "react-icons/io5";

/**
 * The certificate itself, exactly as the backend renders it — the
 * watermarked PDF behind `/api/certificates/{code}/preview`, embedded
 * rather than re-drawn in HTML.
 *
 * It is the authoritative copy: what the learner downloads and what an
 * employer would be shown, so a checked certificate should look like that
 * file and not like our own approximation of it. Only a currently-valid
 * certificate has one (the preview endpoint 404s for an expired or revoked
 * code), which is why the HTML rendering stays behind for those.
 *
 * `<object>` rather than `<iframe>` so the fallback inside it is what a
 * browser without an inline PDF viewer shows — most phones — instead of an
 * empty grey box. No JavaScript involved, so this stays a server component.
 */
export default function CertificatePdfViewer({
  previewUrl,
  learnerName,
}: {
  previewUrl: string;
  learnerName: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#06180b]/15 bg-[#e8e5da] shadow-[0_30px_60px_-40px_rgb(6_24_11/0.45)] print:hidden">
      <object
        data={`${previewUrl}#view=FitH`}
        type="application/pdf"
        aria-label={`Certificate issued to ${learnerName}`}
        className="h-[70vh] min-h-[420px] w-full"
      >
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <IoDocumentTextOutline className="size-8 text-[#0c7a5e]" />
          <p className="max-w-[420px] type-body text-[#06180b]/75">
            Your browser can&rsquo;t display the certificate here. Open or
            download it above to view the PDF.
          </p>
        </div>
      </object>
    </div>
  );
}
