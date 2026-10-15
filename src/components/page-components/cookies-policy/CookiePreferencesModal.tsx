"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  getCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookieConsent";

type PrefKey = keyof CookiePreferences;

const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

type PrefRow = {
  key: PrefKey;
  title: string;
  description: string;
  locked?: boolean;
};

const ROWS: PrefRow[] = [
  {
    key: "necessary",
    title: "Necessary Cookies",
    description: "Required for basic functionality",
    locked: true,
  },
  {
    key: "functional",
    title: "Functional Cookies",
    description: "Enhanced website features",
  },
  {
    key: "analytics",
    title: "Analytics Cookies",
    description: "Help us improve our website",
  },
  {
    key: "marketing",
    title: "Marketing Cookies",
    description: "Personalized advertising",
  },
];

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-[52px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary-500" : "bg-white/25"
      } ${disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1/2 size-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? "left-[27px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

export default function CookiePreferencesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);

  // Re-sync from storage each time the modal opens, so it reflects the
  // latest saved choice (e.g. "Accept All" from the banner) rather than
  // whatever was left over from a previous open. Adjusted during render
  // (React's recommended pattern for resetting state on a prop change)
  // rather than in an effect, to avoid an extra render pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPrefs(getCookiePreferences() ?? DEFAULT_PREFS);
  }

  // Close on Escape and lock body scroll while open.
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

  const toggle = (key: PrefKey) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    saveCookiePreferences(prefs);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie Preferences"
        className={`relative z-10 flex max-h-[90dvh] w-full max-w-[1000px] flex-col overflow-y-auto rounded-3xl bg-primary-900 px-6 py-8 transition-all duration-300 sm:px-10 lg:rounded-[32px] lg:px-[55px] lg:py-[50px] ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-title type-h3 font-semibold text-on-dark">
            Cookie Preferences
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 cursor-pointer text-on-dark transition-opacity hover:opacity-70"
          >
            <FiX className="size-8" />
          </button>
        </div>
        <hr className="mt-6 border-t border-white/15" />

        {/* Rows */}
        <div className="flex flex-col">
          {ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 border-b border-white/15 py-4 sm:py-5 lg:gap-6 lg:py-6"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2.5">
                <p className="font-title type-h4 font-semibold text-surface-white">
                  {row.title}
                </p>
                <p className="type-body text-primary-50/80">
                  {row.description}
                </p>
              </div>
              <Toggle
                label={row.title}
                checked={prefs[row.key]}
                disabled={row.locked}
                onChange={() => toggle(row.key)}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3.5 lg:mt-12">
          <button
            type="button"
            onClick={handleSave}
            className="w-full cursor-pointer rounded-lg bg-accent-600 px-6 py-3 type-button text-primary-950 transition-colors hover:bg-accent-700 sm:w-auto sm:px-8 sm:py-3.5"
          >
            Save Preference
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg border border-on-dark px-6 py-3 type-button text-on-dark transition-colors hover:bg-white/10 sm:w-auto sm:px-8 sm:py-3.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
