# EverythingYouNeed scroll animation — design

## Goal

Refine the existing scroll-driven animation on `EverythingYouNeed.tsx` so it reads like the reference behavior on the Ordina site's "Ordina brings everything together..." section: heading appears first, then surrounding cards sweep into place along circular arcs, and further scrolling continues to rearrange the cards — all while the section stays pinned.

The overall architecture (GSAP + ScrollTrigger, pin + scrub, phase-based timeline) is already in place and confirmed to match the reference behavior at a high level. This design is a targeted refinement of the motion math and an added third phase, not a rewrite.

## Confirmed reference behavior (from user's side-by-side comparison)

- Cards converge from short offsets toward their resting layout (not from far off-screen).
- The heading stays centered permanently; cards arrange around it.
- The section is pinned — scroll locks while the animation plays, then releases.
- Cards travel along a curved (circular), not straight, path.
- Cards should also rotate/tilt slightly as they swing in, reinforcing the circular motion.
- The current implementation's main problem is the *feel*: motion reads as mechanical/linear rather than smooth, and the arcs aren't true circles (each card uses a different radius, and one card's arc is flattened into an ellipse).
- Additional requirement: scrolling further (still within the pinned range) should continue to change the cards' positions — a continuous, scroll-scrubbed rearrangement, not a one-time settle.

## Architecture (unchanged)

Single component `src/components/page-components/home/EverythingYouNeed.tsx`. `gsap.context` + `ScrollTrigger.create` pins the section and scrubs a `gsap.timeline()` across a fixed scroll distance (`window.innerHeight * 1.6`, currently). No new dependencies.

## Phase 1 — heading (unchanged)

Heading fades and slides up (`opacity 0→1`, `y 48→0`) over the first ~40% of the timeline, then holds for a beat before cards start moving. No changes planned here.

## Phase 2 — initial convergence (refined)

Replaces the current per-card `radius`/`radiusY` split with a single shared radius `R` per card, using true circular parametrization of a sweep angle `θ` (e.g. 90° → 0°):

```
x = direction * R * sin(θ)
y = yDirection * R * (1 - cos(θ))
```

- `R` is one constant shared by both axes for a given card (no more flattened ellipse for the top-right card — instead it gets its own circle centered above its resting position, arcing down).
- Alternating `direction`/`yDirection` per card is preserved from the current implementation (top two cards sweep together; remaining cards alternate sides).
- Each card also rotates a small amount (~8–12°) proportional to `θ`, resolving to exactly 0° at rest, with rotation direction consistent with the swing direction (from the left → clockwise into upright; from the right → counter-clockwise).
- Easing on the `θ` proxy tween changes from `power2.out` to a smoother, more fluid curve (`sine.inOut` or an equivalent gentle cubic-bezier), so both position and rotation (driven by the same proxy) accelerate/decelerate gradually instead of snapping.

## Phase 3 — continued rearrangement (new)

Extends the pinned scroll distance to add a third timeline segment, active after phase 2's cards have settled:

- Cards within the same row swap horizontal slots with each other (e.g. row 1's photo card and live-courses card trade places; row 2's CPD card and photo card trade places). Same-row cards keep compatible vertical space, avoiding the layout/resizing problems a full cross-grid shuffle would cause given the cards' differing fixed widths.
- Each swap's offset is computed from actual DOM geometry (bounding-rect delta between the two cards' rest positions) rather than a hardcoded value, so it holds up across breakpoints.
- The swap reuses the phase 2 motion recipe: circular arc (shared radius per swapping pair, derived from their measured offset), rotation proportional to sweep angle, same smooth easing.
- Once the swap completes, the pin releases and normal scrolling resumes.
- The row with a single full-width card (bottom `PhotoCard`) has no swap partner and is unaffected by phase 3.

## Total scroll distance

The pinned scroll distance (`window.innerHeight * 1.6`) will need to grow to accommodate phase 3 — exact multiplier to be tuned during implementation/visual verification rather than fixed in advance.

## Verification

No automated test is meaningful for a scroll-driven visual effect. Verification is running the dev server and visually scrubbing through the section (via the `run` skill / browser), checking: heading-first sequencing, circular arc + rotation feel on convergence, smoothness of easing, and that continued scroll produces the row-swap in phase 3 before the section unpins.
