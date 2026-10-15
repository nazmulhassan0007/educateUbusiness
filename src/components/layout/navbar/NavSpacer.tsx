"use client";

import { usePathname } from "next/navigation";
import { isOverFilm } from "./SiteNav";

/**
 * SiteNav is fixed, so on ordinary pages this holds its height in the flow
 * (as the old sticky navbar did). The homepage and its previews lay their
 * hero out under the bar themselves.
 */
export default function NavSpacer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/new" || pathname.startsWith("/new/") || isOverFilm(pathname)) return null;
  return <div aria-hidden="true" className="h-[var(--home-nav-h)] shrink-0" />;
}
