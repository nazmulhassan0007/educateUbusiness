import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/page-components/forgot-password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | educateU",
  description: "Reset the password for your educateU account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
