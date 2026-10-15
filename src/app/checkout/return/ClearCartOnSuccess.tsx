"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export default function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
    // Runs once, on mount, regardless of `clearCart`'s identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
