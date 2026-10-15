import type { Metadata } from "next";
import Link from "next/link";
import Bounded from "@/components/layout/bounded/Bounded";
import PageHeader from "@/components/shared/page-header/PageHeader";
import UnsubscribeConfirm from "@/components/page-components/newsletter/UnsubscribeConfirm";
import { isValidUnsubscribeToken } from "@/lib/resend/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe | educateU",
  description: "Stop receiving the educateU newsletter.",
  robots: { index: false, follow: false },
};

// The page the "Unsubscribe" link in our emails opens. Opening it changes
// nothing — the reader confirms with a button, so a mail scanner that follows
// every link can't unsubscribe anyone.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { email, token } = await searchParams;
  const address = typeof email === "string" ? email : "";
  const valid =
    Boolean(address) &&
    typeof token === "string" &&
    isValidUnsubscribeToken(address, token);

  return (
    <>
      <PageHeader
        title="Newsletter"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Unsubscribe" }]}
      />

      <section className="bg-white py-12 lg:py-16">
        <Bounded className="flex max-w-[720px] flex-col gap-8">
          {valid ? (
            <UnsubscribeConfirm email={address} token={token as string} />
          ) : (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#cdd1ce] bg-[#f7f8f7] p-5 sm:p-6">
              <h2 className="font-title type-h4 text-[#06180b]">
                This unsubscribe link isn&rsquo;t valid
              </h2>
              <p className="type-body font-light text-[#42697c]">
                It may have been cut short when it was copied. Use the
                &ldquo;Unsubscribe&rdquo; link at the bottom of any educateU
                email, or{" "}
                <Link href="/contact-us" className="text-[#0c7a5e] underline underline-offset-4">
                  contact us
                </Link>{" "}
                and we&rsquo;ll remove you.
              </p>
            </div>
          )}
        </Bounded>
      </section>
    </>
  );
}
