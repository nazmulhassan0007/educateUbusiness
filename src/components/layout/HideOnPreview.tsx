"use client";

import { usePathname } from "next/navigation";

// The homepage (and its /new previews) ship their own navigation, footer and cursor,
// so the site-wide chrome steps aside there.
export default function HideOnPreview({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/new" || pathname.startsWith("/new/")) return null;
  return <>{children}</>;
}
