import type { Metadata } from "next";
import AccountPage from "@/components/page-components/account/AccountPage";

export const metadata: Metadata = {
  title: "My Account | educateU",
  description: "View your account and company memberships.",
};

export default function Page() {
  return <AccountPage />;
}
