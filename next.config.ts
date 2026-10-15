import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// The hosts the site loads media from, mirrored from `images` below. The
// backend serves plain HTTP from a bare IP, which is also why there's no
// `upgrade-insecure-requests`: it would break every one of its URLs.
const BACKEND = "http://3.8.193.16";
const CMS_STORAGE = "https://gttbyrsjwoyzubxlioju.supabase.co";

// No nonces: they force every page to render per request (see the Next.js
// CSP guide), so inline scripts are allowed instead. The Stripe origins are
// what the Payment Element needs (scripts, its iframes, and its API calls).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${BACKEND} ${CMS_STORAGE} https://*.stripe.com`,
  `media-src 'self' blob: ${BACKEND} ${CMS_STORAGE}`,
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com https://*.stripe.com${isDev ? " ws:" : ""}`,
  "frame-src https://js.stripe.com https://*.stripe.com https://*.link.com",
  // The certificate checker embeds the certificate PDF in an <object>.
  `object-src 'self' blob: ${BACKEND}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Browsers must always show the latest deploy, never a stored copy. Pages
// are not stored at all (no-store; Pragma/Expires cover older browsers and
// proxies), so a reload or a revisit always fetches fresh HTML. Files from
// /public (logos, hero videos, images) may be kept but must be re-checked
// with the server on every use (no-cache): unchanged files come back as a
// quick 304, changed ones are downloaded again. /_next/static is left alone:
// Next.js names those files by content hash and marks them immutable, so a
// new deploy always points at new URLs.
const NO_STORE = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];
const REVALIDATE = [{ key: "Cache-Control", value: "no-cache, must-revalidate, max-age=0" }];
const PUBLIC_FILES = "avif|webp|png|jpe?g|gif|svg|ico|mp4|webm|mov|woff2?|ttf|otf|pdf|json|txt|xml";

const nextConfig: NextConfig = {
  // Client-side navigation keeps visited pages in memory for 5 minutes by
  // default; keep dynamic pages not at all and static ones for the minimum
  // Next.js allows (30s), so moving around the site shows fresh content too.
  experimental: {
    staleTimes: { dynamic: 0, static: 30 },
  },
  async headers() {
    return [
      // Later entries win for the same header key, so the /public file rule
      // below overrides this one for those files.
      { source: "/((?!_next/static|_next/image).*)", headers: NO_STORE },
      { source: `/:path*.:ext(${PUBLIC_FILES})`, headers: REVALIDATE },
      {
        source: "/(.*)",
        headers: [
          // Report-Only while it beds in: the browser logs what it would
          // have blocked (in the console) without blocking anything. Once a
          // full pass of the site — checkout included — shows no
          // violations, rename the key to `Content-Security-Policy`.
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  images: {
    // Optimised images are re-checked against their source after 60s (the
    // Next.js 16 default is 4 hours), so a replaced image shows up quickly.
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        // The courses API's own image host (thumbnails, bundle images,
        // course hero images) — plain HTTP, no TLS, since it's a bare IP.
        protocol: "http",
        hostname: "3.8.193.16",
        pathname: "/**",
      },
      {
        // The CMS's image storage host — serves the course "Overview"
        // section's hero_image/thumbnail_image uploads.
        protocol: "https",
        hostname: "gttbyrsjwoyzubxlioju.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
