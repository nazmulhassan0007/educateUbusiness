"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Course } from "@/components/shared/course-card/CourseCard";
import { planForQuantity, type PurchaseType } from "@/lib/checkout/plan";

// Re-exported so existing client imports keep working; the rule itself
// lives in src/lib/checkout/plan.ts so /api/checkout can enforce it too.
export { planForQuantity, type PurchaseType };

// Quantity to jump to when a plan is picked directly (course page or cart
// dropdown), so plan and quantity stay in sync either way.
export const DEFAULT_QUANTITY_FOR_PLAN: Record<PurchaseType, number> = {
  personal: 1,
  group: 2,
  enterprise: 6,
};

export type CartItem = {
  course: Course;
  quantity: number;
  purchaseType: PurchaseType;
  // Only the code string is ever trusted from here — the coupon itself is
  // looked up against the backend and the discount recomputed server-side
  // at checkout time (src/lib/coupons/backend.ts), never taken from client
  // state.
  couponCode?: string | null;
  // Enterprise tier only — which of the buyer's companies this seat pool
  // is purchased under (backend's company_card purchaseType requires it).
  companyId?: string | null;
};

// Moves a line to `purchaseType`, swapping in that tier's unit price when the
// line carries tier prices. Display only — checkout reprices server-side.
const withPlan = (item: CartItem, purchaseType: PurchaseType): CartItem => {
  if (purchaseType === item.purchaseType) return item;
  const tier = item.course.planPrices?.[purchaseType];
  return {
    ...item,
    purchaseType,
    course: tier
      ? { ...item.course, price: tier.price, originalPrice: tier.originalPrice }
      : item.course,
  };
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    course: Course,
    purchaseType?: PurchaseType,
    quantity?: number,
    couponCode?: string | null,
    openDropdown?: boolean,
  ) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  // Also resets quantity to the plan's default, mirroring the course page.
  updatePurchaseType: (slug: string, purchaseType: PurchaseType) => void;
  updateCompanyId: (slug: string, companyId: string) => void;
  // One code covers the whole cart: the backend applies a coupon to a
  // checkout request, not to a single line, so there is only ever one.
  applyCouponToAll: (couponCode: string | null) => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (
        course,
        purchaseType = "personal",
        quantity = 1,
        couponCode,
        openDropdown = true,
      ) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.course.slug === course.slug,
          );
          return {
            isOpen: openDropdown ? true : state.isOpen,
            items: existing
              ? state.items.map((item) => {
                  if (item.course.slug !== course.slug) return item;
                  const newQuantity = item.quantity + quantity;
                  return withPlan(
                    {
                      ...item,
                      quantity: newQuantity,
                      couponCode: couponCode ?? item.couponCode,
                    },
                    planForQuantity(newQuantity),
                  );
                })
              : [...state.items, { course, quantity, purchaseType, couponCode }],
          };
        }),
      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((item) => item.course.slug !== slug),
        })),
      updateQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.course.slug !== slug) return item;
            const newQuantity = Math.max(1, quantity);
            return withPlan(
              { ...item, quantity: newQuantity },
              planForQuantity(newQuantity),
            );
          }),
        })),
      updatePurchaseType: (slug, purchaseType) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.course.slug !== slug) return item;
            return withPlan(
              { ...item, quantity: DEFAULT_QUANTITY_FOR_PLAN[purchaseType] },
              purchaseType,
            );
          }),
        })),
      updateCompanyId: (slug, companyId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.course.slug === slug ? { ...item, companyId } : item,
          ),
        })),
      applyCouponToAll: (couponCode) =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, couponCode })),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Deliberately excludes `isOpen` — otherwise a page reload could
      // restore the dropdown already open.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const getCartTotal = (items: CartItem[]) =>
  items.reduce(
    (acc, item) => ({
      price: acc.price + item.course.price * item.quantity,
      originalPrice:
        acc.originalPrice +
        (item.course.originalPrice ?? item.course.price) * item.quantity,
    }),
    { price: 0, originalPrice: 0 },
  );

// Ties UI to the actual zustand persist rehydration event, so components
// showing cart contents can avoid a flash of "empty cart" before
// localStorage data loads in on the client. Built on useSyncExternalStore
// (rather than an effect + setState) since that's the same external-store
// zustand itself is built on — it also lets the server snapshot stay a
// hardcoded `false` without ever touching `.persist`, which isn't safe to
// call during server prerendering.
export const useCartHydrated = () =>
  useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
