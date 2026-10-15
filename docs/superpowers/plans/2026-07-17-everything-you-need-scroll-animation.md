# EverythingYouNeed Scroll Animation Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the scroll-pinned animation in `EverythingYouNeed.tsx` so cards converge along true circular arcs with a slight rotational "swing," ease more smoothly, and — on continued scroll within the same pin — swap positions with their row partner.

**Architecture:** Same GSAP + `ScrollTrigger` pin/scrub timeline already in the component. No new dependencies, no new files. All changes are inside the single `useEffect` in `src/components/page-components/home/EverythingYouNeed.tsx`.

**Tech Stack:** Next.js, React, GSAP (`gsap`, `gsap/ScrollTrigger`), Tailwind CSS.

## Global Constraints

- No new npm dependencies — use only `gsap` and `gsap/ScrollTrigger`, already imported.
- Keep the pin + scrub architecture: one `ScrollTrigger.create` driving one `gsap.timeline()`, not multiple triggers.
- No automated test suite applies to this visual/scroll effect (confirmed in the spec) — every task's "test" step is a manual visual check via the running dev server, not a unit test.
- Preserve the existing JSX/markup and Tailwind classes in `EverythingYouNeed.tsx` exactly — only the `useEffect` animation logic changes.

---

## Reference: current file before changes

`src/components/page-components/home/EverythingYouNeed.tsx` — the `useEffect` block (lines 90–173) currently reads:

```tsx
useEffect(() => {
  const section = sectionRef.current;
  if (!section) return;

  const ctx = gsap.context(() => {
    const heading = section.querySelector<HTMLElement>(".reveal-heading");
    const cards = gsap.utils.toArray<HTMLElement>(".reveal-card", section);

    if (heading) {
      gsap.set(heading, { opacity: 0, y: 48 });
    }

    const cardState = cards.map((card, i) => {
      const direction = i < 2 ? -1 : i % 2 === 0 ? -1 : 1;
      const radius = 160 + (i % 3) * 30;
      const isTopRight = i === 1;
      const yDirection = isTopRight ? -1 : 1;
      const radiusY = isTopRight ? 70 : radius;
      gsap.set(card, { opacity: 0 });
      return { card, direction, radius, radiusY, yDirection, angle: 100 };
    });

    const tl = gsap.timeline();

    if (heading) {
      tl.to(
        heading,
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        0,
      );
    }

    const cardsStart = 0.55;
    cardState.forEach((state, i) => {
      const proxy = { angle: state.angle, opacity: 0 };
      tl.to(
        proxy,
        {
          angle: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const x = state.direction * state.radius * Math.sin(rad);
            const y = state.yDirection * state.radiusY * (1 - Math.cos(rad));
            gsap.set(state.card, { x, y, opacity: proxy.opacity });
          },
        },
        cardsStart + i * 0.08,
      );
    });

    const navbarHeight =
      document.querySelector("header")?.getBoundingClientRect().height ?? 0;

    ScrollTrigger.create({
      trigger: section,
      start: `top ${navbarHeight}`,
      end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      animation: tl,
      invalidateOnRefresh: true,
    });
  }, section);

  return () => ctx.revert();
}, []);
```

Card DOM order (from JSX, `.reveal-card` query order) and row grouping:

| index | component | row |
|---|---|---|
| 0 | `PhotoCard` (photo-library) | row 1, left |
| 1 | `LiveCoursesCard` | row 1, right |
| 2 | `CpdCourseCard` | row 2, left |
| 3 | `PhotoCard` (photo-video-call) | row 2, right |
| 4 | `PhotoCard` (photo-bookshelf) | row 3, alone (no swap partner) |

---

### Task 1: Unify card convergence into true circular arcs

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx:102-151`

**Interfaces:**
- Consumes: nothing new — same `cards` array from `gsap.utils.toArray<HTMLElement>(".reveal-card", section)`.
- Produces: `cardState` items shaped as `{ card: HTMLElement, direction: number, yDirection: number, radius: number }` (drops `radiusY` and the initial `angle` field) — Task 2 and Task 4 read `card`, `direction`, and `radius` from this shape; Task 4 additionally groups `cardState` entries by index into `swapPairs`.

- [ ] **Step 1: Replace the `cardState` construction to use one shared radius per card**

Replace:
```tsx
    const cardState = cards.map((card, i) => {
      // The top two cards (photo + live courses) sweep in together
      // from left to right along the same circular arc. The rest keep
      // alternating so they converge from opposite sides.
      const direction = i < 2 ? -1 : i % 2 === 0 ? -1 : 1;
      const radius = 160 + (i % 3) * 30;
      // The top-right card (live courses) drops in from above instead
      // of from below, with a smaller vertical reach.
      const isTopRight = i === 1;
      const yDirection = isTopRight ? -1 : 1;
      const radiusY = isTopRight ? 70 : radius;
      gsap.set(card, { opacity: 0 });
      return { card, direction, radius, radiusY, yDirection, angle: 100 };
    });
```

With:
```tsx
    const ARC_RADIUS = 200;

    const cardState = cards.map((card, i) => {
      // The top two cards (photo + live courses) sweep in together
      // from left to right along the same circular arc. The rest keep
      // alternating so they converge from opposite sides.
      const direction = i < 2 ? -1 : i % 2 === 0 ? -1 : 1;
      // The top-right card (live courses) drops in from above instead
      // of from below, on its own circle.
      const isTopRight = i === 1;
      const yDirection = isTopRight ? -1 : 1;
      gsap.set(card, { opacity: 0 });
      return { card, direction, yDirection, radius: ARC_RADIUS };
    });
```

- [ ] **Step 2: Update the convergence tween to use one radius for both axes**

Replace:
```tsx
    const cardsStart = 0.55;
    cardState.forEach((state, i) => {
      const proxy = { angle: state.angle, opacity: 0 };
      tl.to(
        proxy,
        {
          angle: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const x = state.direction * state.radius * Math.sin(rad);
            const y = state.yDirection * state.radiusY * (1 - Math.cos(rad));
            gsap.set(state.card, { x, y, opacity: proxy.opacity });
          },
        },
        cardsStart + i * 0.08,
      );
    });
```

With:
```tsx
    const cardsStart = 0.55;
    cardState.forEach((state, i) => {
      const proxy = { angle: 90, opacity: 0 };
      tl.to(
        proxy,
        {
          angle: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const x = state.direction * state.radius * Math.sin(rad);
            const y = state.yDirection * state.radius * (1 - Math.cos(rad));
            gsap.set(state.card, { x, y, opacity: proxy.opacity });
          },
        },
        cardsStart + i * 0.08,
      );
    });
```

Note: the starting angle changed from 100° to 90° (a clean quarter circle) — at 90°, `x = direction * radius` and `y = yDirection * radius`, so every card now starts exactly `ARC_RADIUS` px away along a true circle, instead of the old mismatched-ellipse offsets.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open the home page, scroll to the "Everything you need" section.
Expected: Heading fades/slides in first, then all five cards sweep into place. Every card's motion should look like a segment of the same-size circle (equal reach in x and y at the midpoint), including the live-courses card (which should now arc down from directly above rather than a flattened swoop).

- [ ] **Step 4: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "refactor: unify card convergence arcs to a shared circular radius"
```

---

### Task 2: Add rotation and smoother easing to the convergence sweep

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx` (the block edited in Task 1, step 2)

**Interfaces:**
- Consumes: `cardState` shape from Task 1 (`{ card, direction, yDirection, radius }`).
- Produces: no new shape — cards now also receive a `rotation` transform via `gsap.set`, on top of `x`/`y`/`opacity`. Task 4's swap segment reuses the same `ARC_ROTATION` constant name/value convention (its own local constant, since it's a separate code block), so keep the name consistent if copying.

- [ ] **Step 1: Add an `ARC_ROTATION` constant next to `ARC_RADIUS`**

In the block from Task 1 step 1, change:
```tsx
    const ARC_RADIUS = 200;
```
to:
```tsx
    const ARC_RADIUS = 200;
    const ARC_ROTATION = 10;
```

- [ ] **Step 2: Drive rotation from the same sweep angle and switch to a smoother ease**

Replace the `onUpdate` callback and `ease` from Task 1 step 2:
```tsx
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const x = state.direction * state.radius * Math.sin(rad);
            const y = state.yDirection * state.radius * (1 - Math.cos(rad));
            gsap.set(state.card, { x, y, opacity: proxy.opacity });
          },
```

With:
```tsx
          duration: 0.4,
          ease: "sine.inOut",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const x = state.direction * state.radius * Math.sin(rad);
            const y = state.yDirection * state.radius * (1 - Math.cos(rad));
            const rotation = state.direction * ARC_ROTATION * Math.sin(rad);
            gsap.set(state.card, { x, y, rotation, opacity: proxy.opacity });
          },
```

Rotation is proportional to `sin(rad)`, so it's at its maximum mid-swing and resolves to exactly `0` at `rad = 0` (rest), matching the direction each card swings in from.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, scroll through the section again.
Expected: Cards visibly tilt a few degrees as they swing in, settling perfectly upright at rest. The overall motion should feel smoother/less snappy than before (no hard stop at the end of each card's sweep).

- [ ] **Step 4: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "feat: add swing rotation and smoother easing to card convergence"
```

---

### Task 3: Add phase 3 — row-swap rearrangement on continued scroll

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx` (insert after the `cardState.forEach(...)` convergence block from Task 2, before the `navbarHeight` line)

**Interfaces:**
- Consumes: `cardState` array from Task 1 (index-ordered per the DOM table above: `0`/`1` are row 1, `2`/`3` are row 2, `4` has no partner). `ARC_ROTATION` constant from Task 2.
- Produces: `swapStart` (a timeline-position number) — not consumed elsewhere, but keep the name for clarity when tuning timing later.

- [ ] **Step 1: Group row partners and compute the swap timeline segment**

Insert immediately after the `cardState.forEach` block (the convergence tween added in Task 1/2), still inside the same `gsap.context` callback and before the `const navbarHeight = ...` line:

```tsx
    // Phase 3: once cards have converged, continuing to scroll swaps each
    // row's two cards with each other — same-row pairs keep compatible
    // widths, so the swap never requires resizing a card mid-flight.
    const swapPairs = [
      [cardState[0], cardState[1]],
      [cardState[2], cardState[3]],
    ];
    const SWAP_LIFT = 40;

    const swapStart = cardsStart + cardState.length * 0.08 + 0.3;
    swapPairs.forEach(([a, b], i) => {
      const rectA = a.card.getBoundingClientRect();
      const rectB = b.card.getBoundingClientRect();
      const dx = rectB.left - rectA.left;

      const proxy = { angle: 0 };
      tl.to(
        proxy,
        {
          angle: 180,
          duration: 0.5,
          ease: "sine.inOut",
          onUpdate: () => {
            const rad = (proxy.angle * Math.PI) / 180;
            const sweep = 1 - Math.cos(rad);
            const aX = (dx / 2) * sweep;
            const bX = -(dx / 2) * sweep;
            const lift = SWAP_LIFT * Math.sin(rad);
            const rotation = Math.sign(dx) * ARC_ROTATION * Math.sin(rad);
            gsap.set(a.card, { x: aX, y: -lift, rotation });
            gsap.set(b.card, { x: bX, y: lift, rotation: -rotation });
          },
        },
        swapStart + i * 0.15,
      );
    });
```

How this works: `dx` is the measured horizontal distance between the two cards' resting slots (read once via `getBoundingClientRect`, before any transform is applied, since the convergence tween runs earlier in the same timeline but `dx` is computed at setup time from untransformed layout). As `angle` sweeps 0°→180°, `aX` carries card `a` fully into `b`'s slot and `bX` carries `b` fully into `a`'s slot (`sweep` goes 0→2, so at 180° `aX = dx` and `bX = -dx`, landing each card exactly on the other's original position). The `lift`/`-lift` split makes the two cards arc in opposite vertical directions at the midpoint so they visibly cross rather than colliding.

- [ ] **Step 2: Extend the pinned scroll distance to give phase 3 room to play out**

In the `ScrollTrigger.create` call, change:
```tsx
      end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
```
to:
```tsx
      end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
```

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, scroll all the way through the section without stopping.
Expected: after the initial convergence settles, continuing to scroll (section still pinned) makes row 1's two cards trade places, then row 2's two cards trade places (or however `swapStart + i * 0.15` staggers them), each swap reading as two cards arcing past each other. The bottom full-width photo card never moves during this phase. After the swap finishes, the section unpins and normal page scroll continues.

- [ ] **Step 4: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "feat: add scroll-driven row-swap phase to EverythingYouNeed animation"
```

---

### Task 4: Tune pacing across breakpoints

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx` (tuning only — `ARC_RADIUS`, `ARC_ROTATION`, `SWAP_LIFT`, `swapStart` offsets, and the `window.innerHeight` multiplier from Task 3)

**Interfaces:**
- Consumes: all constants/timeline offsets introduced in Tasks 1–3.
- Produces: nothing new — this task only adjusts numeric values based on visual review, no structural change.

- [ ] **Step 1: Resize the browser through mobile/tablet/desktop widths with the dev server running**

Run: `npm run dev`, open the home page, use browser devtools responsive mode to check widths around 375px, 768px, and 1280px+.
Expected: since `swapPairs` on narrow widths may stack cards in a single column (the JSX uses `lg:flex-row`, falling back to a stacked column below `lg`), confirm whether the row-swap phase should be skipped below the `lg` breakpoint (where cards already stack full-width and a horizontal swap wouldn't read correctly).

- [ ] **Step 2: Guard phase 3 to only run at `lg` and above, if step 1 confirms it looks wrong on mobile**

If needed, wrap the `swapPairs.forEach(...)` block from Task 3 with a width check:
```tsx
    if (window.innerWidth >= 1024) {
      swapPairs.forEach(([a, b], i) => {
        // ...unchanged body from Task 3...
      });
    }
```
(1024px matches Tailwind's `lg` breakpoint used elsewhere in this component's JSX.)

- [ ] **Step 3: Re-check the full scroll sequence at each breakpoint**

Run: `npm run dev`, repeat the scroll-through from Task 3 step 3 at each width from step 1.
Expected: convergence and (where applicable) row-swap both read smoothly; no card overlaps awkwardly or clips outside the viewport at any tested width.

- [ ] **Step 4: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "fix: skip row-swap phase below lg breakpoint where cards stack"
```

(If step 1 shows no issue and no change was needed, skip this commit.)
