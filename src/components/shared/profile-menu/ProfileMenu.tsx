"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileMenuUser = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
};

function getInitials(user: ProfileMenuUser) {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  const fallback = user.firstName || user.lastName || user.email;
  return fallback.slice(0, 2).toUpperCase() || "?";
}

export default function ProfileMenu({
  user,
  onLogout,
  variant = "dropdown",
}: {
  user: ProfileMenuUser;
  onLogout: () => void;
  // "dropdown" overlays the panel absolutely (desktop nav). "inline" renders
  // the panel in normal flow instead — the mobile nav's slide-open wrapper
  // uses `overflow-hidden` for its animation, which would otherwise clip an
  // absolutely-positioned panel that doesn't contribute to its height.
  variant?: "dropdown" | "inline";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDropdown = variant === "dropdown";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const avatar = user.avatarUrl ? (
    <img
      alt=""
      src={user.avatarUrl}
      className="size-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 type-small font-semibold text-primary-950">
      {getInitials(user)}
    </span>
  );

  return (
    <div ref={menuRef} className={isDropdown ? "relative" : undefined}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex items-center gap-2 rounded-full  pl-1.5 type-small text-on-dark",
          !isDropdown && "w-full",
        )}
      >
        {!isDropdown && avatar}
        <span
          className={cn(
            "truncate",
            isDropdown ? "max-w-[140px]" : "flex-1 text-left",
          )}
        >
          {user.firstName}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Always mounted so opening and closing can transition, same as the
          navbar's cart dropdown: closed, the panel is invisible,
          click-through and `inert`. The dropdown fades and drops in; the
          inline copy sits inside the mobile nav's own slide-open wrapper, so
          it grows open in flow instead (grid rows 0fr -> 1fr) rather than
          overlapping the links below it. */}
      <div
        inert={!isOpen}
        className={cn(
          "transition-[opacity,translate,scale,visibility,grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDropdown
            ? "absolute right-0 top-full z-50 mt-3 w-[220px] origin-top-right"
            : "grid w-full",
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible opacity-0",
          !isOpen &&
            (isDropdown
              ? "-translate-y-3 scale-95 motion-reduce:translate-y-0 motion-reduce:scale-100"
              : "grid-rows-[0fr]"),
          isOpen && !isDropdown && "grid-rows-[1fr]",
        )}
      >
        <div className={cn(!isDropdown && "min-h-0 overflow-hidden")}>
          <div
            className={cn(
              "rounded-2xl border border-[#0b5743] bg-primary-950 p-2",
              !isDropdown && "mt-3",
            )}
          >
            <div className="flex flex-col gap-0.5 border-b border-white/9 px-3 pb-3 pt-1">
              <p className="truncate type-small font-medium text-on-dark">
                {fullName}
              </p>
              <p className="truncate type-caption text-on-dark/60">{user.email}</p>
            </div>
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 type-small text-on-dark transition-colors hover:bg-primary-900"
            >
              <User className="size-4" />
              My Account
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 type-small text-on-dark transition-colors hover:bg-primary-900"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
