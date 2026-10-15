# Navbar Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a site-wide navbar matching Figma node `239:2016` exactly on desktop, with a self-authored responsive mobile menu, wired into the root layout.

**Architecture:** A single client component (`src/components/navbar/Navbar.tsx`) holds two pieces of UI state (mobile menu open, Courses dropdown open) and renders three regions: the logo, a desktop nav row (hidden below `lg`), and a mobile hamburger + drawer (hidden at `lg` and above). Nav link data lives in a small sibling data module. Real exported Figma assets are committed under `public/navbar/`. Brand colors are added as Tailwind v4 theme tokens in `globals.css` so they're reusable by future components.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript. No test runner is configured in this repo (`package.json` has no `jest`/`vitest`/`playwright`) — adding one is out of scope for a single UI component, so verification per task is: `npx tsc --noEmit` (types), `npm run lint` (lint), and a manual visual check against the Figma screenshot via `npm run dev`.

## Global Constraints

- Match Figma node `239:2016` pixel-for-pixel at the `lg` breakpoint and above (source: https://www.figma.com/design/VXvxxMFn0PWTkuyj7kiKVr/EducateU-Website---Revamp?node-id=239-2016).
- No mobile variant exists in Figma — mobile/tablet behavior (hamburger + drawer) is a reasonable addition, not a pixel match.
- Navbar is global: rendered in `src/app/layout.tsx` above `{children}`.
- Links point to placeholder routes (`/for-learners`, `/courses`, `/about`, `/contact`, `/cart`, `/login`) that don't exist yet — 404s are expected until those pages are built.
- "Courses" dropdown toggles open/closed but has no menu content yet (placeholder text only).
- Never hand-author SVG path data for icons/logo that exist in the Figma design — use the exact exported assets. A hand-drawn hamburger icon (three `<span>` bars, no `<svg>`) is fine since no mobile design exists in Figma to reproduce.
- Do not install Tailwind or any new dependency — it's already present.

---

### Task 1: Add navbar color tokens to `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Tailwind utility classes `bg-surface-dark`, `text-surface-dark`, `border-surface-dark`, `bg-primary`, `text-primary`, `border-primary`, `bg-on-dark`, `text-on-dark`, `border-on-dark` — consumed by Task 4.

- [ ] **Step 1: Add the three brand color variables and theme mappings**

Edit `src/app/globals.css` so the top of the file reads exactly:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --surface-dark: #06180b;
  --primary: #1ee9b5;
  --on-dark: #ffffff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface-dark: var(--surface-dark);
  --color-primary: var(--primary);
  --color-on-dark: var(--on-dark);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Leave the rest of the file (the `@media (prefers-color-scheme: dark)` block and `body` rule) unchanged below this.

- [ ] **Step 2: Verify Tailwind compiles the new tokens**

Run: `npm run build`
Expected: Build completes with `Compiled successfully` (or equivalent success output) and no CSS/theme errors. Ctrl+C is not needed — `next build` exits on its own when done.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
Add navbar brand color tokens to Tailwind theme

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add real Figma-exported navbar assets

**Files:**
- Create: `public/navbar/logo-mark.svg`
- Create: `public/navbar/logo-wordmark.svg`
- Create: `public/navbar/logo-subtext.svg`
- Create: `public/navbar/icon-graduation-hat.svg`
- Create: `public/navbar/icon-chevron-down.svg`
- Create: `public/navbar/icon-shopping-cart.svg`
- Create: `public/navbar/icon-log-in.svg`

**Interfaces:**
- Produces: seven static asset paths under `/navbar/*.svg` — consumed by Task 4 as `<img src="/navbar/...">`.

- [ ] **Step 1: Copy the already-downloaded Figma assets into `public/navbar/`**

These SVGs were pulled directly from the Figma file's exported asset URLs for node `239:2016` (logo mark, "educateU" wordmark, "BUSINESS" subtext, and the four icon glyphs) and cached in the scratchpad this session:

```bash
mkdir -p public/navbar
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/group.raw public/navbar/logo-mark.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/group1.raw public/navbar/logo-wordmark.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/group2.raw public/navbar/logo-subtext.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/graduation-hat.raw public/navbar/icon-graduation-hat.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/chevron-down.raw public/navbar/icon-chevron-down.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/shopping-cart.raw public/navbar/icon-shopping-cart.svg
cp /private/tmp/claude-506/-Users-sadika-r-Desktop-educate-u-business/acec46c8-a386-4207-ab20-4b9d02243832/scratchpad/navbar-assets/log-in.raw public/navbar/icon-log-in.svg
```

- [ ] **Step 2: Verify all seven files exist and are valid SVGs**

Run: `file public/navbar/*.svg`
Expected: seven lines, each ending in `SVG Scalable Vector Graphics image`.

- [ ] **Step 3: Commit**

```bash
git add public/navbar
git commit -m "$(cat <<'EOF'
Add real Figma-exported navbar logo and icon assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add nav link data module

**Files:**
- Create: `src/components/navbar/nav-links.ts`

**Interfaces:**
- Produces: `type NavLink = { label: string; href: string }`, `FOR_LEARNERS_LINK: NavLink`, `COURSES_LINK: NavLink`, `NAV_LINKS: NavLink[]` — consumed by Task 4.

- [ ] **Step 1: Create the data module**

```ts
export type NavLink = {
  label: string;
  href: string;
};

export const FOR_LEARNERS_LINK: NavLink = {
  label: "For Learners",
  href: "/for-learners",
};

export const COURSES_LINK: NavLink = {
  label: "Courses",
  href: "/courses",
};

export const NAV_LINKS: NavLink[] = [
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
];
```

Save as `src/components/navbar/nav-links.ts`.

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/navbar/nav-links.ts
git commit -m "$(cat <<'EOF'
Add navbar nav-link data module

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Build the static desktop Navbar and wire it into the root layout

**Files:**
- Create: `src/components/navbar/Navbar.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `FOR_LEARNERS_LINK`, `COURSES_LINK`, `NAV_LINKS`, `type NavLink` from `./nav-links` (Task 3); tokens from Task 1; assets from Task 2.
- Produces: `export default function Navbar()` from `@/components/navbar/Navbar` — consumed by `layout.tsx` in this task, and extended in place by Tasks 5 and 6.

- [ ] **Step 1: Create the static (server component) Navbar**

```tsx
import Link from "next/link";
import { COURSES_LINK, FOR_LEARNERS_LINK, NAV_LINKS } from "./nav-links";

export default function Navbar() {
  return (
    <header className="bg-surface-dark">
      <div className="flex items-center justify-between px-6 py-4 lg:px-40 lg:py-[42px]">
        <Link
          href="/"
          aria-label="educateU Business home"
          className="relative h-[55.12px] w-[243px] shrink-0"
        >
          <div className="absolute inset-[0_77.31%_0_0]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-mark.svg"
            />
          </div>
          <div className="absolute inset-[17.87%_0_29.7%_25.53%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-wordmark.svg"
            />
          </div>
          <div className="absolute inset-[80.22%_0_0_72.06%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-subtext.svg"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-16 lg:flex">
          <div className="flex items-center gap-6">
            <Link
              href={FOR_LEARNERS_LINK.href}
              className="flex items-center gap-2 rounded-full border border-on-dark px-4 py-3 text-base text-on-dark"
            >
              <img
                alt=""
                className="size-6"
                src="/navbar/icon-graduation-hat.svg"
              />
              <span>{FOR_LEARNERS_LINK.label}</span>
            </Link>

            <Link
              href={COURSES_LINK.href}
              className="flex items-center gap-[3px] text-base text-on-dark"
            >
              <span>{COURSES_LINK.label}</span>
              <img
                alt=""
                className="size-5"
                src="/navbar/icon-chevron-down.svg"
              />
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-on-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-[15px]">
            <Link
              href="/cart"
              className="flex items-center gap-[3px] text-base text-on-dark"
            >
              <img
                alt=""
                className="size-[18px]"
                src="/navbar/icon-shopping-cart.svg"
              />
              <span>
                CART <span className="text-primary">(0)</span>
              </span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary py-[10px] pl-[26px] pr-[10px] text-base text-surface-dark"
            >
              <span>Log in</span>
              <span className="flex size-[37px] items-center justify-center rounded-full bg-surface-dark">
                <img
                  alt=""
                  className="size-[18px]"
                  src="/navbar/icon-log-in.svg"
                />
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
```

Save as `src/components/navbar/Navbar.tsx`.

- [ ] **Step 2: Wire Navbar into the root layout**

In `src/app/layout.tsx`, add the import and render `<Navbar />` as the first child of `<body>`, immediately before `{children}`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

Run: `npm run lint`
Expected: `No ESLint warnings or errors` (or equivalent clean output).

- [ ] **Step 4: Verify visually against Figma**

Run: `npm run dev`, open `http://localhost:3000` in a browser at a viewport width of 1920px (or use browser devtools responsive mode set to 1920×1080).
Expected: the rendered navbar visually matches the Figma screenshot at https://www.figma.com/design/VXvxxMFn0PWTkuyj7kiKVr/EducateU-Website---Revamp?node-id=239-2016 — dark green background, white logo top-left, "For Learners" pill / "Courses ⌄" / "About us" / "Contact us" centered-right, "CART (0)" and mint "Log in" button on the far right. Stop the dev server with Ctrl+C when done.

- [ ] **Step 5: Commit**

```bash
git add src/components/navbar/Navbar.tsx src/app/layout.tsx
git commit -m "$(cat <<'EOF'
Add static desktop Navbar and wire into root layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Make the Courses dropdown interactive

**Files:**
- Modify: `src/components/navbar/Navbar.tsx`

**Interfaces:**
- Consumes: `Navbar.tsx` from Task 4 (full file rewritten below).
- Produces: same `export default function Navbar()`, now a client component with an `isCoursesOpen` boolean toggle — Task 6 extends this same state and file further.

- [ ] **Step 1: Convert to a client component and add the dropdown toggle**

Replace the full contents of `src/components/navbar/Navbar.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { COURSES_LINK, FOR_LEARNERS_LINK, NAV_LINKS } from "./nav-links";

export default function Navbar() {
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);

  return (
    <header className="bg-surface-dark">
      <div className="flex items-center justify-between px-6 py-4 lg:px-40 lg:py-[42px]">
        <Link
          href="/"
          aria-label="educateU Business home"
          className="relative h-[55.12px] w-[243px] shrink-0"
        >
          <div className="absolute inset-[0_77.31%_0_0]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-mark.svg"
            />
          </div>
          <div className="absolute inset-[17.87%_0_29.7%_25.53%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-wordmark.svg"
            />
          </div>
          <div className="absolute inset-[80.22%_0_0_72.06%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-subtext.svg"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-16 lg:flex">
          <div className="flex items-center gap-6">
            <Link
              href={FOR_LEARNERS_LINK.href}
              className="flex items-center gap-2 rounded-full border border-on-dark px-4 py-3 text-base text-on-dark"
            >
              <img
                alt=""
                className="size-6"
                src="/navbar/icon-graduation-hat.svg"
              />
              <span>{FOR_LEARNERS_LINK.label}</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-expanded={isCoursesOpen}
                className="flex items-center gap-[3px] text-base text-on-dark"
                onClick={() => setIsCoursesOpen((open) => !open)}
              >
                <span>{COURSES_LINK.label}</span>
                <img
                  alt=""
                  className={`size-5 transition-transform ${isCoursesOpen ? "rotate-180" : ""}`}
                  src="/navbar/icon-chevron-down.svg"
                />
              </button>
              {isCoursesOpen ? (
                <div className="absolute left-0 top-full mt-3 w-48 rounded-2xl bg-white p-4 text-sm text-surface-dark shadow-lg">
                  Coming soon
                </div>
              ) : null}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-on-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-[15px]">
            <Link
              href="/cart"
              className="flex items-center gap-[3px] text-base text-on-dark"
            >
              <img
                alt=""
                className="size-[18px]"
                src="/navbar/icon-shopping-cart.svg"
              />
              <span>
                CART <span className="text-primary">(0)</span>
              </span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary py-[10px] pl-[26px] pr-[10px] text-base text-surface-dark"
            >
              <span>Log in</span>
              <span className="flex size-[37px] items-center justify-center rounded-full bg-surface-dark">
                <img
                  alt=""
                  className="size-[18px]"
                  src="/navbar/icon-log-in.svg"
                />
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

Run: `npm run lint`
Expected: `No ESLint warnings or errors` (or equivalent clean output).

- [ ] **Step 3: Verify the dropdown behavior in the browser**

Run: `npm run dev`, open `http://localhost:3000` at desktop width, click "Courses".
Expected: the chevron rotates 180° and a small white "Coming soon" panel appears below it; clicking again closes it. Stop the dev server with Ctrl+C when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/navbar/Navbar.tsx
git commit -m "$(cat <<'EOF'
Add interactive Courses dropdown toggle to Navbar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Add the responsive mobile menu

**Files:**
- Modify: `src/components/navbar/Navbar.tsx`

**Interfaces:**
- Consumes: `Navbar.tsx` from Task 5 (full file rewritten below), adding `isMobileMenuOpen` state alongside the existing `isCoursesOpen` state.
- Produces: final `export default function Navbar()` for this feature — no further tasks extend it.

- [ ] **Step 1: Add the hamburger button and mobile drawer**

Replace the full contents of `src/components/navbar/Navbar.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { COURSES_LINK, FOR_LEARNERS_LINK, NAV_LINKS } from "./nav-links";

export default function Navbar() {
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCoursesOpen(false);
  };

  return (
    <header className="relative bg-surface-dark">
      <div className="flex items-center justify-between px-6 py-4 lg:px-40 lg:py-[42px]">
        <Link
          href="/"
          aria-label="educateU Business home"
          className="relative h-[55.12px] w-[243px] shrink-0"
        >
          <div className="absolute inset-[0_77.31%_0_0]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-mark.svg"
            />
          </div>
          <div className="absolute inset-[17.87%_0_29.7%_25.53%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-wordmark.svg"
            />
          </div>
          <div className="absolute inset-[80.22%_0_0_72.06%]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/navbar/logo-subtext.svg"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-16 lg:flex">
          <div className="flex items-center gap-6">
            <Link
              href={FOR_LEARNERS_LINK.href}
              className="flex items-center gap-2 rounded-full border border-on-dark px-4 py-3 text-base text-on-dark"
            >
              <img
                alt=""
                className="size-6"
                src="/navbar/icon-graduation-hat.svg"
              />
              <span>{FOR_LEARNERS_LINK.label}</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-expanded={isCoursesOpen}
                className="flex items-center gap-[3px] text-base text-on-dark"
                onClick={() => setIsCoursesOpen((open) => !open)}
              >
                <span>{COURSES_LINK.label}</span>
                <img
                  alt=""
                  className={`size-5 transition-transform ${isCoursesOpen ? "rotate-180" : ""}`}
                  src="/navbar/icon-chevron-down.svg"
                />
              </button>
              {isCoursesOpen ? (
                <div className="absolute left-0 top-full mt-3 w-48 rounded-2xl bg-white p-4 text-sm text-surface-dark shadow-lg">
                  Coming soon
                </div>
              ) : null}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-on-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-[15px]">
            <Link
              href="/cart"
              className="flex items-center gap-[3px] text-base text-on-dark"
            >
              <img
                alt=""
                className="size-[18px]"
                src="/navbar/icon-shopping-cart.svg"
              />
              <span>
                CART <span className="text-primary">(0)</span>
              </span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary py-[10px] pl-[26px] pr-[10px] text-base text-surface-dark"
            >
              <span>Log in</span>
              <span className="flex size-[37px] items-center justify-center rounded-full bg-surface-dark">
                <img
                  alt=""
                  className="size-[18px]"
                  src="/navbar/icon-log-in.svg"
                />
              </span>
            </Link>
          </div>
        </nav>

        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
          className="flex h-6 w-6 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span
            className={`h-0.5 w-6 bg-on-dark transition-transform ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-on-dark transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-on-dark transition-transform ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="absolute inset-x-0 top-full flex flex-col gap-6 bg-surface-dark px-6 py-8 lg:hidden">
          <Link
            href={FOR_LEARNERS_LINK.href}
            className="flex items-center gap-2 text-base text-on-dark"
            onClick={closeMobileMenu}
          >
            <img
              alt=""
              className="size-6"
              src="/navbar/icon-graduation-hat.svg"
            />
            <span>{FOR_LEARNERS_LINK.label}</span>
          </Link>

          <div>
            <button
              type="button"
              aria-expanded={isCoursesOpen}
              className="flex w-full items-center justify-between text-base text-on-dark"
              onClick={() => setIsCoursesOpen((open) => !open)}
            >
              <span>{COURSES_LINK.label}</span>
              <img
                alt=""
                className={`size-5 transition-transform ${isCoursesOpen ? "rotate-180" : ""}`}
                src="/navbar/icon-chevron-down.svg"
              />
            </button>
            {isCoursesOpen ? (
              <p className="mt-3 text-sm text-on-dark/70">Coming soon</p>
            ) : null}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-on-dark"
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className="flex items-center gap-[3px] text-base text-on-dark"
            onClick={closeMobileMenu}
          >
            <img
              alt=""
              className="size-[18px]"
              src="/navbar/icon-shopping-cart.svg"
            />
            <span>
              CART <span className="text-primary">(0)</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-[10px] pl-[26px] pr-[10px] text-base text-surface-dark"
            onClick={closeMobileMenu}
          >
            <span>Log in</span>
            <span className="flex size-[37px] items-center justify-center rounded-full bg-surface-dark">
              <img
                alt=""
                className="size-[18px]"
                src="/navbar/icon-log-in.svg"
              />
            </span>
          </Link>
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no output, exit code 0.

Run: `npm run lint`
Expected: `No ESLint warnings or errors` (or equivalent clean output).

- [ ] **Step 3: Verify responsive behavior in the browser**

Run: `npm run dev`, open `http://localhost:3000`.
- At desktop width (≥1024px): the hamburger button is absent and the full desktop nav from Task 4/5 is shown.
- At a narrow width (e.g. 375px): only the logo and hamburger icon show; clicking the hamburger animates it into an X and opens a full-width dark drawer listing For Learners, Courses (tap to expand "Coming soon"), About us, Contact us, Cart, and the Log in button, stacked vertically; clicking any link or the hamburger again closes the drawer.

Stop the dev server with Ctrl+C when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/navbar/Navbar.tsx
git commit -m "$(cat <<'EOF'
Add responsive mobile menu to Navbar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
