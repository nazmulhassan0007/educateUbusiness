import type { Metadata } from "next";
import CartPage from "@/components/page-components/cart/CartPage";

export const metadata: Metadata = {
  title: "Your Cart | educateU",
  description: "Review the courses in your cart before checkout.",
};

export default function Page() {
  return <CartPage />;
}
