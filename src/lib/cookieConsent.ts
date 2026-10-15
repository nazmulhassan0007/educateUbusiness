const STORAGE_KEY = "educate-u-business-cookie-consent";

// Fired on `window` whenever preferences are saved (from the banner's
// Accept/Reject actions or from the preferences modal), so any mounted
// listener (e.g. the banner, to hide itself) can react without prop drilling.
export const COOKIE_PREFERENCES_SAVED_EVENT =
  "educate-u-business-cookie-preferences-saved";
// Fired to ask the (globally-mounted) preferences modal to open, so any
// trigger on the page — the banner's "Let me choose", a future footer link —
// can reuse the same modal instance instead of managing its own.
export const OPEN_COOKIE_PREFERENCES_EVENT =
  "educate-u-business-open-cookie-preferences";

export type CookiePreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const ACCEPT_ALL: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
};

const DECLINE_ALL: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function cookiePreferencesExist(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

export function saveCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_SAVED_EVENT));
}

export function acceptAllCookies(): void {
  saveCookiePreferences(ACCEPT_ALL);
}

export function declineAllCookies(): void {
  saveCookiePreferences(DECLINE_ALL);
}
