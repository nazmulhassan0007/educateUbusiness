import { Arrow } from "@/components/page-components/concepts/shared";

// A plain GET form on purpose: the result ends up in the URL, so a checked
// certificate can be linked, bookmarked or printed straight from a shared
// address — and the page keeps working with no JavaScript at all.
export default function CertificateLookupForm({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <form method="get" className="flex flex-col gap-3 print:hidden">
      <label htmlFor="certificate-code" className="type-small font-medium text-white/85">
        Verification code
      </label>
      {/* One bar: the code on the left, the button riding inside it. */}
      <div className="group flex flex-col gap-2 rounded-[16px] border border-white/15 bg-[#051d14]/90 p-2 transition-[border-color,box-shadow] duration-300 focus-within:border-[#1ee9b5]/70 focus-within:shadow-[0_0_0_4px_rgb(30_233_181/0.14)] hover:border-white/30 sm:flex-row sm:items-center sm:rounded-full sm:pl-7">
        <input
          id="certificate-code"
          name="code"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={64}
          defaultValue={defaultValue}
          placeholder="e.g. 4f9c1a72b0de"
          aria-describedby="certificate-code-hint"
          className="h-[56px] w-full min-w-0 flex-1 bg-transparent px-4 font-[family-name:var(--font-geist-mono)] text-[20px] tracking-[0.06em] text-white caret-[#1ee9b5] outline-none selection:bg-[#1ee9b5]/35 placeholder:text-white/40 sm:px-0 md:text-[24px]"
        />
        <button
          type="submit"
          className="group/btn relative inline-flex h-[56px] shrink-0 cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-full bg-[#1ee9b5] py-1.5 pl-6 pr-1.5 type-button font-medium text-[#06180b] outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-[60px] sm:justify-center"
        >
          <span aria-hidden="true" className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#5ff3cb] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:w-full" />
          <span className="relative">Check certificate</span>
          <span className="relative grid size-[46px] place-items-center rounded-full bg-[#06180b] text-[#1ee9b5] transition-transform duration-500 group-hover/btn:-rotate-45">
            <Arrow size={14} />
          </span>
        </button>
      </div>
      <p id="certificate-code-hint" className="m-0 max-w-[720px] type-small text-white/70">
        You&rsquo;ll find it printed beside the certificate&rsquo;s QR code, and scanning that code opens this page already filled in.
        Checking a code doesn&rsquo;t change or expire the certificate.
      </p>
    </form>
  );
}
