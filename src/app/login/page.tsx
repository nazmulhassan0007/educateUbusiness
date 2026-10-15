import type { Metadata } from "next";
import LoginForm from "@/components/page-components/login/LoginForm";

export const metadata: Metadata = {
  title: "Login | educateU",
  description:
    "Log in to your educateU account to continue learning and access your courses.",
};

export default function LoginPage() {
  return <LoginForm />;
}
