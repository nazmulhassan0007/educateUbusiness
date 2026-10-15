"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// The courses a visitor has hearted, by slug. Kept in the browser like the
// cart, so it works signed out and survives a reload.
type FavoritesState = {
  slugs: string[];
  toggle: (slug: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((s) => s !== slug)
            : [...state.slugs, slug],
        })),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Same idea as useCartHydrated: hearts only show as filled once the saved
// list has loaded, so the server render and the first client render agree.
export const useFavoritesHydrated = () =>
  useSyncExternalStore(
    (callback) => useFavoritesStore.persist.onFinishHydration(callback),
    () => useFavoritesStore.persist.hasHydrated(),
    () => false,
  );
