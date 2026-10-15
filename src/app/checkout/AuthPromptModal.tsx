"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { PillAction } from "./checkout-ui";

export default function AuthPromptModal({
  open,
  onClose,
  redirectTo = "/checkout",
}: {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}) {
  // Close on Escape and lock body scroll while open — mirrors
  // CookiePreferencesModal's behavior for consistency.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Portal to `document.body`: unlike CookiePreferencesModal (rendered near
  // the app root), this modal is opened from deep inside page-specific trees
  // — e.g. the course hero card/BundleSidebar, both wrapped in a `lg:sticky`
  // ancestor. `position: sticky` establishes a stacking context, and a
  // `position: fixed` descendant stays trapped *inside* that context for
  // paint order even though it's positioned relative to the viewport — so
  // its z-index only wins against elements inside that same sticky
  // ancestor, and later, unrelated sections of the page (which paint in
  // their own stacking contexts) can end up rendering above it and its
  // backdrop blur. Rendering straight into `document.body` sidesteps that
  // entirely.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // One-time mount flag — `document.body` doesn't exist during SSR, so
    // the portal target can only be resolved after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-[#06180b]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        className="relative z-10 w-full max-w-[440px] rounded-[20px] bg-[#f7f6f1] p-6 text-[#06180b] shadow-[0_40px_80px_-24px_rgb(6_24_11/0.6)] sm:p-8"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 grid size-10 cursor-pointer place-items-center rounded-full text-[#06180b]/70 transition-colors hover:bg-[#06180b]/[0.06] hover:text-[#06180b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
        >
          <FiX className="size-5" />
        </button>

        <h2
          id="auth-prompt-title"
          className="m-0 pr-10 font-title type-h3 font-normal tracking-[-0.025em]"
        >
          Log in to continue
        </h2>
        <p className="m-0 mt-3 type-body text-[#06180b]/70">
          You need an account before completing your purchase.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <PillAction href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
            Log in
          </PillAction>
          <PillAction
            tone="outline"
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          >
            Create an account
          </PillAction>
        </div>
      </div>
    </div>,
    document.body,
  );
}
