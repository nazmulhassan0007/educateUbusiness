"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_PREFERENCES_SAVED_EVENT,
  getCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookieConsent";

export type CookieKey = keyof CookiePreferences;

/**
 * The visitor's saved cookie choices, or null before they've made one. Kept
 * current when they save anywhere on the page (the banner, the modal, the
 * console in the hero), all of which fire the saved event.
 */
export function useCookiePrefs() {
  const [prefs, setPrefs] = useState<CookiePreferences | null>(null);
  useEffect(() => {
    const read = () => setPrefs(getCookiePreferences());
    read();
    window.addEventListener(COOKIE_PREFERENCES_SAVED_EVENT, read);
    return () => window.removeEventListener(COOKIE_PREFERENCES_SAVED_EVENT, read);
  }, []);
  return prefs;
}

// Which switch a CMS category belongs to, read from its title.
export function keyForCategory(title: string): CookieKey | null {
  if (/essential|necessary/i.test(title)) return "necessary";
  if (/functional/i.test(title)) return "functional";
  if (/analytic/i.test(title)) return "analytics";
  if (/marketing|advert/i.test(title)) return "marketing";
  return null;
}
