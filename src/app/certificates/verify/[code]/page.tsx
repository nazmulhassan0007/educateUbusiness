import { redirect } from "next/navigation";

// Where every certificate's QR code points (the backend embeds
// `<FRONTEND_URL>/certificates/verify/<code>` in it). The checker itself
// lives at /certificate-checker, so this is just the stable public address
// for it — scanning a certificate lands on its own result.
export default async function VerifyCertificateRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/certificate-checker?code=${encodeURIComponent(code)}`);
}
