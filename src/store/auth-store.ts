"use client";

import { create } from "zustand";
import type { ProfileMenuUser } from "@/components/shared/profile-menu/ProfileMenu";

// GET /auth/me returns snake_case field names — confirmed against the live
// backend, unlike every other endpoint (register, courses, etc.), which is
// camelCase. See src/lib/auth/server.ts's AuthUser type for the same note.
export type MeResponseUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
} | null;

export function toProfileMenuUser(user: MeResponseUser): ProfileMenuUser | null {
  if (!user) return null;
  // The backend has no avatar concept — ProfileMenu already falls back to
  // initials when avatarUrl is null.
  return {
    firstName: user.first_name || user.email,
    lastName: user.last_name || "",
    email: user.email,
    avatarUrl: null,
  };
}

type AuthStatus = "idle" | "loading" | "ready";

type AuthState = {
  user: ProfileMenuUser | null;
  status: AuthStatus;
  setUser: (user: ProfileMenuUser | null) => void;
  // Fetches /api/auth/me once per page load — guarded by `status` so every
  // component that needs the current user (Navbar, the checkout page) can
  // call this on mount without triggering duplicate requests.
  fetchUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user, status: "ready" }),
  fetchUser: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    try {
      const response = await fetch("/api/auth/me");
      const data = (await response.json()) as { user: MeResponseUser };
      set({ user: toProfileMenuUser(data.user), status: "ready" });
    } catch {
      set({ user: null, status: "ready" });
    }
  },
}));
