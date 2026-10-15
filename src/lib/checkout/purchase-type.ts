import type { PurchaseType } from "@/lib/checkout/plan";

// The backend's card-payment purchase types this app uses (see the
// EducateU API reference). company_po is deliberately excluded, since PO
// purchases never go through Stripe or this grouping at all (see
// src/app/checkout/purchase-order). The backend's "gift" type isn't offered.
export type BackendPurchaseType = "individual" | "group" | "company_card";

// Maps the app's own pricing tier (personal/group/enterprise) onto the
// backend's purchaseType vocabulary.
export function resolveBackendPurchaseType(item: {
  purchaseType: PurchaseType;
}): BackendPurchaseType {
  if (item.purchaseType === "group") return "group";
  if (item.purchaseType === "enterprise") return "company_card";
  return "individual";
}
