# EverythingYouNeed clockwise reveal + fade-swap — design

## Goal

Replace the current card-appearance and card-reshuffle behavior in `EverythingYouNeed.tsx` with a simpler, more legible sequence: cards fade in one at a time in a clockwise order, then row pairs swap via a crossfade (disappear at one slot, reappear at the other) instead of sliding past each other.

## Relationship to prior spec

This supersedes the **Phase 2** and **Phase 3** sections of `2026-07-17-everything-you-need-scroll-animation-design.md` (the circular-arc convergence with rotation, and the sliding row-swap). Phase 1 (heading) and the overall architecture (pin + scrub, breakpoint guard, scroll-distance tuning) are unchanged and carry over from that implementation.

## Card layout reference

| index | component | row |
|---|---|---|
| 0 | `PhotoCard` (photo-library) | row 1, left |
| 1 | `LiveCoursesCard` | row 1, right |
| 2 | `CpdCourseCard` | row 2, left |
| 3 | `PhotoCard` (photo-video-call) | row 2, right |
| 4 | `PhotoCard` (photo-bookshelf) | row 3, alone (no swap partner) |

## Phase 1 — heading (unchanged)

Heading fades and slides up, then holds briefly before phase 2 begins. No changes.

## Phase 2 — clockwise reveal (replaces circular-arc convergence)

Cards fade in one at a time — pure opacity `0 → 1`, no scale, no positional arc, no rotation — staggered so each card's fade-in starts after the previous one, in this order:

1. row1-left (index 0, photo-library)
2. row1-right (index 1, LiveCoursesCard)
3. row2-right (index 3, photo-video-call)
4. row2-left (index 2, CpdCourseCard)
5. row3 (index 4, photo-bookshelf)

This order traces a clockwise sweep around the layout (top-left → top-right → down to bottom-right → bottom-left → the lone bottom card last). Cards render at their normal (final) layout position throughout — since there's no positional animation, "reveal" is entirely an opacity change.

## Phase 3 — fade-swap (replaces sliding row-swap)

Once all five cards are visible, continued scroll (still pinned) drives a swap:

- Row 1's pair (index 0 ↔ 1) and row 2's pair (index 2 ↔ 3) swap **simultaneously** — not one row after the other.
- Within each pair, both cards fade to opacity 0 together, then — with their visual content exchanged — fade back to opacity 1 together at the same two slots. The left slot now shows what was the right card's content and vice versa (visually: a crossfade swap, not a slide/cross).
- Row 3's card (index 4) has no partner and is unaffected — stays visible throughout phase 3.
- Once the swap completes, the pin releases and normal scrolling continues, same as before.

## Architecture (unchanged)

Single `EverythingYouNeed.tsx` component, one `ScrollTrigger.create` pinning the section and scrubbing one `gsap.timeline()`. The `>=1024px` guard that skips the swap phase below the `lg` breakpoint (where cards stack in a single column) carries over unchanged, as does the pattern of scaling the pinned scroll distance to match the timeline's total duration per breakpoint.

## Verification

No automated test applies to this visual/scroll effect. Verification is running the dev server and visually scrubbing through the section (browser or headless-browser capture), confirming: cards appear in the specified clockwise order with a plain fade (no arc/rotation/scale), both row pairs crossfade-swap simultaneously once all cards are visible, row 3 stays untouched, and the breakpoint guard/pin-distance behavior from the prior implementation still holds.
