"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * A reload starts a fresh check, not a repeat of the last one.
 *
 * The looked-up code lives in the URL (see the page), which is what makes a
 * result shareable and what a certificate's QR code lands on — but it also
 * means refreshing the page re-runs someone else's lookup and leaves their
 * certificate on screen. So the reload case, and only that case, drops the
 * code and sends the page back to the empty form; arriving by link, by QR
 * scan or by submitting the form is untouched.
 *
 * `performance.getEntriesByType("navigation")` is what distinguishes them:
 * `"reload"` covers the refresh button, Cmd-R and re-entering the same
 * address, while a normal visit reports `"navigate"`.
 */
export default function ClearResultOnReload({ code }: { code: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const [navigation] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigation?.type !== "reload") return;

    router.replace("/certificate-checker");
  }, [code, router]);

  return null;
}
