# Navbar Component Design

**Date:** 2026-07-15
**Source:** Figma — EducateU Website Revamp, node `239:2016` ("Nav Bar")
https://www.figma.com/design/VXvxxMFn0PWTkuyj7kiKVr/EducateU-Website---Revamp?node-id=239-2016

## Purpose

Add a site-wide navigation bar matching the Figma design exactly, wired into the root layout so it appears on every route.

## Design source

Desktop frame is 1920px wide, dark background (`#06180b`), containing:
- Logo lockup (educateU Business, white) on the left
- Center nav group: "For Learners" pill (icon + label, bordered), "Courses" (with dropdown chevron), "About us", "Contact us"
- Right group: "CART (0)" with cart icon (count in mint `#1ee9b5`), and a mint pill "Log in" button with a dark circular icon

Figma only defines the desktop breakpoint — no mobile/tablet variant exists in the file.

## Scope decisions (confirmed with user)

1. **Responsiveness:** Match Figma pixel-for-pixel at desktop widths (`lg:` and up). Below that, collapse to logo + hamburger button that opens a full-width mobile drawer with the same links stacked vertically, since Figma doesn't specify a mobile design.
2. **Placement:** Global — rendered in `src/app/layout.tsx` above `{children}`, so it appears on every page.
3. **Interactivity:** Links are real `<Link>` components pointing to placeholder routes (`/courses`, `/about`, `/contact`, `/cart`, `/login`). These routes don't exist yet and will 404 until built — expected at this stage. "Courses" gets a working open/close dropdown (chevron rotates on toggle); the dropdown panel has no menu items yet since Figma doesn't define dropdown contents.

## Structure

- `src/components/navbar/Navbar.tsx` — client component (`"use client"`) owning two pieces of state: mobile menu open/closed, Courses dropdown open/closed.
- `src/components/navbar/nav-links.ts` — plain data array of `{ label, href }` for the four nav items, avoiding hardcoded duplication between desktop and mobile render paths.
- `public/navbar/` — real exported Figma assets (logo mark, graduation-hat icon, chevron-down icon, shopping-cart icon, log-in icon) downloaded and committed as files, replacing Figma's temporary asset URLs (which expire after ~7 days).
- Color tokens added to `src/app/globals.css` as CSS variables matching the Figma variable names (`Surface/Background-Dark #06180b`, `Primary/500 #1ee9b5`, `Text/On-Dark-Primary #ffffff`) so future components can reuse them instead of hardcoding hex values.

## Out of scope

- Real destination pages for the placeholder routes (`/courses`, `/about`, `/contact`, `/cart`, `/login`)
- Actual dropdown menu contents for "Courses"
- Auth/cart functionality — these are visual/UI only at this stage
