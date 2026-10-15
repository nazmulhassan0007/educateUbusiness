// The app's own pricing tiers. Kept out of the "use client" cart store so
// /api/checkout can enforce the same quantity->plan rule the cart applies.
export type PurchaseType = "personal" | "group" | "enterprise";

// Single source of truth for the quantity->plan mapping — used by the cart
// store (so changing quantity anywhere keeps the plan in sync), by
// CoursePurchaseCard.tsx, and by /api/checkout to reject a payload whose
// plan doesn't match its quantity.
export const planForQuantity = (quantity: number): PurchaseType =>
  quantity === 1 ? "personal" : quantity <= 5 ? "group" : "enterprise";
