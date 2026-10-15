import type { Metadata } from "next";
import RegisterForm from "@/components/page-components/register/RegisterForm";

export const metadata: Metadata = {
  title: "Register | educateU",
  description:
    "Create your educateU account to access online courses and start learning without borders.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
