# EverythingYouNeed Clockwise Reveal + Fade-Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the circular-arc card convergence and sliding row-swap in `EverythingYouNeed.tsx` with a simpler sequence: cards fade in one at a time in clockwise order, then both row pairs crossfade-swap simultaneously (fade out together, flip which card renders in which slot, fade back in together) — no positional sliding, no rotation.

**Architecture:** Same GSAP + `ScrollTrigger` pin/scrub timeline already in the component. No new dependencies, no new files. All changes are inside the single `useEffect` in `src/components/page-components/home/EverythingYouNeed.tsx`, replacing the existing Phase 2 (arc convergence) and Phase 3 (sliding swap) blocks entirely.

**Tech Stack:** Next.js, React, GSAP (`gsap`, `gsap/ScrollTrigger`), Tailwind CSS.

## Global Constraints

- No new npm dependencies.
- Keep the pin + scrub architecture: one `ScrollTrigger.create` driving one `gsap.timeline()`.
- No automated test suite applies to this visual/scroll effect — every task's "test" step is a manual visual check via the running dev server (ideally with a headless-browser capture of computed styles/screenshots, per how this component was verified previously), not a unit test.
- Preserve the existing JSX/markup and Tailwind classes in `EverythingYouNeed.tsx` exactly — only the `useEffect` animation logic changes.
- The swap must use opacity + CSS `order` only — no `x`/`y`/`rotation` transforms, and no DOM node reparenting.
- Below the `lg` breakpoint (1024px, confirmed as this project's actual custom breakpoint in `src/app/globals.css`), the swap phase is skipped (cards stack in a single column there) — this guard pattern already exists and must be preserved.

---

## Reference: current file before changes

`src/components/page-components/home/EverythingYouNeed.tsx` — the `useEffect` block (lines 90–223) currently implements a circular-arc convergence (Phase 2) and a sliding-arc row-swap (Phase 3). Both are being replaced. The component's JSX, `PhotoCard`/`LiveCoursesCard`/`CpdCourseCard` sub-components, and the `heading`/`ScrollTrigger` scaffolding are unchanged.

Card DOM order (from JSX, `.reveal-card` query order) and row grouping — **unchanged from before**:

| index | component | row |
|---|---|---|
| 0 | `PhotoCard` (photo-library) | row 1, left |
| 1 | `LiveCoursesCard` | row 1, right |
| 2 | `CpdCourseCard` | row 2, left |
| 3 | `PhotoCard` (photo-video-call) | row 2, right |
| 4 | `PhotoCard` (photo-bookshelf) | row 3, alone (no swap partner) |

Clockwise appear order (per spec): index 0 → 1 → 3 → 2 → 4.

---

### Task 1: Replace circular-arc convergence with clockwise sequential fade-in

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx:94-153` (the `cardState` construction and the arc convergence tween — everything between `const heading = ...` and the `// Phase 3` comment)

**Interfaces:**
- Consumes: `cards` — the flat `HTMLElement[]` from `gsap.utils.toArray<HTMLElement>(".reveal-card", section)` (unchanged selector).
- Produces: `cards` array (kept, now used directly instead of wrapped in `cardState`), `swapPairs` (an array of `[HTMLElement, HTMLElement]` pairs: `[cards[0], cards[1]]` and `[cards[2], cards[3]]`), and `appearEnd` (a number — the timeline position where every card has finished fading in). Task 2 consumes all three; Task 3 does not need any of them directly (it only edits the `end` callback).

- [ ] **Step 1: Replace the setup block (heading set + old `cardState`/`ARC_RADIUS`/`ARC_ROTATION`) with a flat cards setup and explicit `order` baseline**

Replace:
```tsx
      if (heading) {
        gsap.set(heading, { opacity: 0, y: 48 });
      }

      const ARC_RADIUS = 200;
      const ARC_ROTATION = 10;

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

With:
```tsx
      if (heading) {
        gsap.set(heading, { opacity: 0, y: 48 });
      }

      cards.forEach((card) => gsap.set(card, { opacity: 0 }));

      // Each row's two cards form a swap pair for phase 3. Give them an
      // explicit flex `order` matching their current visual position now,
      // so phase 3 can flip it later without moving any DOM nodes.
      const swapPairs: [HTMLElement, HTMLElement][] = [
        [cards[0], cards[1]],
        [cards[2], cards[3]],
      ];
      swapPairs.forEach(([a, b]) => {
        gsap.set(a, { order: 0 });
        gsap.set(b, { order: 1 });
      });
```

- [ ] **Step 2: Replace the arc convergence tween with a sequential, clockwise-ordered fade-in**

Replace:
```tsx
      // Between ~0.4 and ~0.55 nothing animates: the section stays pinned
      // with the heading resting in the center for a beat before the
      // cards start revealing.
      const cardsStart = 0.55;
      cardState.forEach((state, i) => {
        const proxy = { angle: 90, opacity: 0 };
        tl.to(
          proxy,
          {
            angle: 0,
            opacity: 1,
            duration: 0.4,
            ease: "sine.inOut",
            onUpdate: () => {
              const rad = (proxy.angle * Math.PI) / 180;
              const x = state.direction * state.radius * Math.sin(rad);
              const y = state.yDirection * state.radius * (1 - Math.cos(rad));
              const rotation = state.direction * ARC_ROTATION * Math.sin(rad);
              gsap.set(state.card, { x, y, rotation, opacity: proxy.opacity });
            },
          },
          cardsStart + i * 0.08,
        );
      });
```

With:
```tsx
      // Between ~0.4 and ~0.55 nothing animates: the section stays pinned
      // with the heading resting in the center for a beat before the
      // cards start revealing.
      const cardsStart = 0.55;
      const APPEAR_DURATION = 0.3;
      const APPEAR_STAGGER = 0.15;

      // Cards fade in one at a time, in clockwise order around the layout:
      // row1-left, row1-right, row2-right, row2-left, then the lone row3
      // card last. Plain opacity only — no position/rotation change.
      const appearOrder = [cards[0], cards[1], cards[3], cards[2], cards[4]];
      appearOrder.forEach((card, i) => {
        tl.to(
          card,
          { opacity: 1, duration: APPEAR_DURATION, ease: "power1.inOut" },
          cardsStart + i * APPEAR_STAGGER,
        );
      });
      const appearEnd =
        cardsStart + (appearOrder.length - 1) * APPEAR_STAGGER + APPEAR_DURATION;
```

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open the home page, scroll to the "Everything you need" section.
Expected: heading fades/slides in first, then the five cards fade in one at a time (no sliding, no rotation) in this order: photo-library, live-courses, video-call photo, CPD course, bookshelf photo — tracing a clockwise path around the layout.

- [ ] **Step 4: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "feat: replace arc convergence with clockwise sequential fade-in"
```

---

### Task 2: Replace sliding row-swap with simultaneous crossfade order-swap

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx` (the `// Phase 3` block, immediately following the code from Task 1)

**Interfaces:**
- Consumes: `swapPairs` and `appearEnd` from Task 1.
- Produces: nothing new — this is the last animated phase before `ScrollTrigger.create`.

- [ ] **Step 1: Replace the sliding-arc swap block with a crossfade + order-flip block**

Replace:
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
      // Below `lg` the row containers stack full-width (`flex-col`, no
      // `lg:flex-row` override), so paired cards share the same `left`
      // edge and the swap's horizontal delta collapses to ~0 — it would
      // read as a stray vertical bob rather than an actual swap. Only run
      // this phase at the `lg` breakpoint and above, where cards sit
      // side-by-side.
      if (window.innerWidth >= 1024) {
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
      }
```

With:
```tsx
      // Phase 3: once every card is visible, continuing to scroll swaps
      // both row pairs at the same time. Each pair fades out together,
      // has its flex `order` flipped at the midpoint (while invisible),
      // then fades back in together — a crossfade swap, no sliding.
      const swapStart = appearEnd + 0.3;
      const SWAP_DURATION = 0.6;

      // Below `lg` the row containers stack full-width (`flex-col`, no
      // `lg:flex-row` override), so a swap wouldn't read the same way as
      // it does when cards sit side-by-side. Only run this phase at the
      // `lg` breakpoint and above.
      if (window.innerWidth >= 1024) {
        const proxy = { p: 0 };
        tl.to(
          proxy,
          {
            p: 1,
            duration: SWAP_DURATION,
            ease: "power1.inOut",
            onUpdate: () => {
              const p = proxy.p;
              const fadingOut = p <= 0.5;
              const localP = fadingOut ? p / 0.5 : (p - 0.5) / 0.5;
              const opacity = fadingOut ? 1 - localP : localP;
              swapPairs.forEach(([a, b]) => {
                gsap.set(a, { opacity, order: fadingOut ? 0 : 1 });
                gsap.set(b, { opacity, order: fadingOut ? 1 : 0 });
              });
            },
          },
          swapStart,
        );
      }
```

Note: computing `opacity`/`order` purely from `p` (rather than toggling state with a one-time callback) keeps the effect correct regardless of scroll direction — scrubbing backward and forward across this point re-derives the same values every time, with no risk of the order getting out of sync with the opacity.

- [ ] **Step 2: Manual visual check**

Run: `npm run dev`, scroll through the section past the point where all five cards are visible.
Expected: continuing to scroll fades out row1's two cards together and row2's two cards together at the same time, then fades them back in with row1-left/row1-right's content swapped and row2-left/row2-right's content swapped. No sliding motion. Row3's card (bookshelf photo) stays visible and unaffected throughout. Scrubbing back up should reverse the crossfade cleanly.

- [ ] **Step 3: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "feat: replace sliding row-swap with simultaneous crossfade order-swap"
```

---

### Task 3: Retune pinned scroll distance for the new timeline duration

**Files:**
- Modify: `src/components/page-components/home/EverythingYouNeed.tsx` (the `end: () => {...}` callback inside `ScrollTrigger.create`)

**Interfaces:**
- Consumes: nothing new — this task only adjusts the two numeric multipliers already present in the `end` callback (`window.innerWidth >= 1024 ? 2.4 : 1.6`) to match the new timeline duration produced by Tasks 1–2.
- Produces: nothing new.

- [ ] **Step 1: Update the two multipliers to starting values sized for the new timeline**

The new timeline's total duration is `swapStart + SWAP_DURATION` (≈1.75 + 0.6 = 2.35) at `lg` and above, or `appearEnd` (≈1.45) below `lg` — both *longer* than the old timeline (≈1.90 / ≈1.27), since five staggered fade-ins plus a settle beat take more total time than the old five staggered 0.4s arc-sweeps did. Scaling by the same ratio the prior tuning pass used (`multiplier ≈ 1.263 × duration`) gives starting values of `3.0` and `1.8` — both *larger* than the old `2.4`/`1.6`, matching the longer duration.

In the `ScrollTrigger.create` call, change:
```tsx
        end: () => {
          const multiplier = window.innerWidth >= 1024 ? 2.4 : 1.6;
          return `+=${Math.round(window.innerHeight * multiplier)}`;
        },
```
to:
```tsx
        end: () => {
          const multiplier = window.innerWidth >= 1024 ? 3.0 : 1.8;
          return `+=${Math.round(window.innerHeight * multiplier)}`;
        },
```

- [ ] **Step 2: Manual visual check at both breakpoints, adjusting the multipliers if needed**

Run: `npm run dev`. At a viewport `>= 1024px` wide, scroll all the way through the section without stopping — confirm the pin releases right as the crossfade swap finishes (not noticeably before, leaving a jump, and not noticeably after, leaving dead scroll). At a viewport `< 1024px` wide, confirm the pin releases right as the last card's fade-in completes.

If either breakpoint's release feels early or late, adjust that breakpoint's multiplier (the `3.0` or `1.8` from Step 1) up or down and re-check — these starting values are a calculated estimate, not exact, since actual scrub-to-scroll feel also depends on `scrub: 1`'s smoothing.

- [ ] **Step 3: Commit**

```bash
git add src/components/page-components/home/EverythingYouNeed.tsx
git commit -m "fix: retune pinned scroll distance for the clockwise reveal timeline"
```
