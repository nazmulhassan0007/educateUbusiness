"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import CookiePreferencesModal from "@/components/page-components/cookies-policy/CookiePreferencesModal";
import {
  acceptAllCookies,
  declineAllCookies,
  cookiePreferencesExist,
  COOKIE_PREFERENCES_SAVED_EVENT,
  OPEN_COOKIE_PREFERENCES_EVENT,
} from "@/lib/cookieConsent";

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener(COOKIE_PREFERENCES_SAVED_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(COOKIE_PREFERENCES_SAVED_EVENT, onStoreChange);
}

// No preferences saved yet == show the banner. `cookiePreferencesExist` is
// only meaningful client-side (it reads localStorage), so the server
// snapshot always resolves to "don't show" — the banner then appears the
// moment the client's real snapshot is read post-hydration, with no
// server/client markup mismatch.
const getShowBannerSnapshot = () => !cookiePreferencesExist();
const getShowBannerServerSnapshot = () => false;

export default function CookieBanner() {
  const showBanner = useSyncExternalStore(
    subscribeToConsent,
    getShowBannerSnapshot,
    getShowBannerServerSnapshot,
  );
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const handleOpenPreferences = () => setShowPreferences(true);
    window.addEventListener(
      OPEN_COOKIE_PREFERENCES_EVENT,
      handleOpenPreferences,
    );
    return () =>
      window.removeEventListener(
        OPEN_COOKIE_PREFERENCES_EVENT,
        handleOpenPreferences,
      );
  }, []);

  // No manual setShowBanner here — saving preferences dispatches
  // COOKIE_PREFERENCES_SAVED_EVENT, which the store subscription above
  // picks up to hide the banner.
  const handleAcceptAll = () => acceptAllCookies();
  const handleDecline = () => declineAllCookies();
  const handleOpenPreferences = () => setShowPreferences(true);

  return (
    <>
      {showBanner && (
        <section className="fixed bottom-3 left-3 right-3 z-90 rounded-3xl border border-primary-800/60 bg-primary-950 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] duration-700 ease-out animate-in slide-in-from-bottom-4 md:bottom-8 md:left-8 md:right-auto md:max-w-155 md:p-7">
          <div className="mb-5 md:mb-6">
            <div className="mb-3 flex items-center gap-4 md:mb-4">
              <span
                className="shrink-0 text-3xl md:text-4xl"
                role="img"
                aria-label="cookie"
              >
                🍪
              </span>
              <h2 className="font-title type-h4 font-semibold text-on-dark">
                We use cookies!
              </h2>
            </div>
            <p className="type-body text-primary-50/80">
              This website uses essential cookies to ensure its proper
              operation and tracking cookies to understand how you interact
              with it. The latter will be set only after consent.{" "}
              <button
                type="button"
                onClick={handleOpenPreferences}
                className="cursor-pointer font-semibold text-primary-500 underline underline-offset-4 transition-colors hover:text-primary-500/80"
              >
                Let me choose
              </button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="cursor-pointer rounded-lg bg-primary px-6 py-3 type-button font-semibold text-primary-950 transition-colors hover:bg-primary-500/90 active:scale-[0.98]"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="cursor-pointer rounded-lg border border-on-dark/30 px-6 py-3 type-button font-semibold text-on-dark transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                Reject All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleOpenPreferences}
                className="cursor-pointer rounded-lg border border-on-dark/30 px-6 py-3 type-button font-semibold text-on-dark transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                Preferences
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="cursor-pointer rounded-lg border border-on-dark/30 px-6 py-3 type-button font-semibold text-on-dark/70 transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </section>
      )}

      <CookiePreferencesModal
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}
