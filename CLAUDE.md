# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js version warning (read first)

This project runs **Next.js 16.2 with React 19.2**. As `AGENTS.md` states, APIs and
conventions differ from older Next.js. Before writing framework code, read the relevant
guide under `node_modules/next/dist/docs/` (e.g. `01-app/`, `03-api-reference/`). The
`next/font/google` fonts used here (`Stack_Sans_Notch`, `Stack_Sans_Text`) will not
match older training data — do not assume the font list.

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config, next core-web-vitals + typescript)
```

There is no test suite. Scroll/animation work is verified manually against the running
dev server (the plan docs explicitly state each "test" step is a visual check).

## Architecture

Single-page marketing site for "educateU". Everything renders from
[src/app/page.tsx](src/app/page.tsx), which composes one section component per screen band
(Hero, TrustedBy, Offer, HomeCourses, WhyChooseUs, EverythingYouNeed, Testimonials, FAQ).
[src/app/layout.tsx](src/app/layout.tsx) wraps every page with the shared `Navbar` and `Footer`.

Component layers (import alias `@/*` → `src/*`):

- `components/ui/` — primitives. `button.tsx` is built on **`@base-ui/react`** (not Radix)
  with `class-variance-authority`; shadcn is configured (`components.json`, style
  `base-nova`, registry `@aceternity`) so new primitives come from there.
- `components/shared/` — app-specific reusable pieces, e.g. `PrimaryButton` (the CTA pill,
  with a `VARIANT_STYLES` map; wraps its label in `FlipText` for the hover flip effect).
- `components/layout/` — chrome: `navbar/`, `footer/`, and `Bounded` (the standard
  page container — use it for section width, not ad-hoc padding).
  Link/label data lives in colocated `*-links.ts` / `nav-links.ts` files, kept out of JSX.
- `components/page-components/home/` — the section components listed above.

`cn()` in [src/lib/utils.ts](src/lib/utils.ts) (`clsx` + `tailwind-merge`) is the class-merging helper.

### Styling & design tokens

Tailwind CSS v4, configured entirely in [src/app/globals.css](src/app/globals.css) via
`@theme inline` — there is no `tailwind.config`. Brand tokens are CSS variables mirrored
from Figma (`--primary-*`, `--accent-*`, `--surface-dark/-2`, `--on-dark`, `--warning`,
`--success`) and exposed as Tailwind colors (`bg-primary`, `text-on-dark`,
`bg-surface-dark`, etc.). Custom breakpoints go up to `4xl` (1920px).

**One content width everywhere:** 1312px (`--container-site`). Use `site-container`
(width + the 20px/40px gutter, centred — what `Bounded` and the navbar use) on anything
that carries its own gutter, or `max-w-site` on an inner container inside a section
that already has `px-5 md:px-10`. Don't add other page-level `max-w-[…px]` values. Fonts map to
`font-sans` (Stack Sans Text) and `font-title` (Stack Sans Notch). Prefer these tokens
over raw hex/oklch values when editing components.

### Animation (GSAP)

Scroll effects use **GSAP + ScrollTrigger** directly (no React wrapper lib). The
established pattern (see [HeroMediaReveal.tsx](src/components/page-components/home/HeroMediaReveal.tsx)
and `EverythingYouNeed.tsx`): a `"use client"` component that in a `useEffect` builds one
`gsap.context(() => { ... }, ref)` with a single pinned/scrubbed `ScrollTrigger` timeline,
and returns `ctx.revert()` for cleanup. `gsap.registerPlugin(ScrollTrigger)` is called at
module scope. Keep to one trigger driving one timeline; refs (not id queries) select the
animated nodes. Most components are Server Components — add `"use client"` only for
interactivity/animation.

### Design docs

`docs/superpowers/` holds specs and implementation plans (e.g. the navbar and
EverythingYouNeed scroll animations). When touching an animated section, check for a
matching plan/spec there first — they capture the intended behavior and constraints.

## Deployment

Vercel. [vercel.json](vercel.json) enables auto-deploys only from the `dev` and `main`
branches (the working branch here is `pre-dev`).
