# Course Purchase Flow — Course Details → Stripe Checkout → Payment Confirmed

Reference doc for implementing checkout. Modeled on the sibling `educateu`
project's working Prismic + Stripe + Moodle pipeline (see
`/Users/sadika.r/Desktop/educateu`), adapted to this project's course data
source and pricing model (see [Pricing model](#pricing-model-3-stripe-prices-1-per-tier--3-cached-display-prices)
below — deliberately *not* a straight copy of `educateu`'s single-price-plus-
multiplier approach).

Three systems are involved end-to-end:

- **CMS** (`pen-websites-cms.vercel.app`) — course content, via
  `GET /api/pages/by-template?website_id=48&template_id=29` (the "Course
  Preview Page" template). Replaces the earlier REST courses API
  (`http://3.8.193.16`) as the source for course copy/content. Bundles are
  **not** part of this migration — `/api/bundles` on the REST API stays as-is
  until told otherwise.
- **Stripe** — pricing (source of truth for the charged amount) and payment.
  Confirmed (by diffing `.env` files) to be the **exact same Stripe account**
  `educateu` uses — same live/test key pairs, same webhook secret.
- **Moodle** (`https://my.educateu.com`) — enrolment/accounts, via
  `src/lib/moodle.ts`. Also confirmed shared with `educateu`: the
  `MOODLE_TOKEN`/`MOODLE_TOKEN_USER_REGISTRATION` values in this project's
  `.env` are identical to theirs. This is a **real, live, external system**
  this project now calls directly — not a mock. See
  [Moodle integration](#moodle-integration-real-not-a-reference-backend)
  below.

Status legend used throughout: ✅ already built · ⚠️ needs a decision/backend
work · 🧩 our own code (not a backend ask).

> **Constraint: the user must never leave this website.** No redirect to a
> `checkout.stripe.com` URL, or any other external URL, at any point in the
> flow. **This is already built** using Stripe's Payment Element + PaymentIntent
> (`redirect: "if_required"`) — see [Step 4](#step-4--start-checkout-in-page-no-redirect).

---

## 0. Data prerequisites (CMS fields the course-preview template needs)

The CMS's "Course Preview Page" template (id `29`) currently only has content
sections (Title, Overview, Course Details, Course Content, FAQ, Related
Courses) — it's missing everything the UI needs for commerce/listing. Fields
to add per course:

| Field | Purpose | Status |
|---|---|---|
| `short_description` | card/hero blurb, distinct from the long Overview `description` | ⚠️ missing |
| `stripe_price_id_personal` | the real Stripe Price for a 1-seat purchase | ⚠️ missing |
| `stripe_price_id_group` | the real Stripe Price for a 2–5 seat purchase | ⚠️ missing |
| `stripe_price_id_enterprise` | the real Stripe Price for a 6+ seat purchase | ⚠️ missing |
| `stripe_product_id` | required — this is how `moodle_course_id` gets resolved (see below), not just organizational | ✅ added |
| `price_personal` / `price_group` / `price_enterprise` | cached display price per tier, so cards/sidebar don't need a live Stripe call — see [Pricing model](#pricing-model-3-stripe-prices-1-per-tier--3-cached-display-prices) | ⚠️ missing |
| `compare_at_price` | optional "was £X" strikethrough, shown against `price_personal` only — **display only**, never read by checkout | ⚠️ missing (optional — add only when the Personal tier is on sale) |
| `category` (name + slug) | listing-page filter badge | ⚠️ missing |
| `duration_label` | e.g. `"3 hours"` | ⚠️ missing |
| `delivery_mode` | e.g. `"Online, self-paced"` (short, distinct from the long `format` text) | ⚠️ missing |
| `certificate_type` | short label, e.g. `"CPD Certificate"` | ⚠️ missing |
| `flexible_learning_text` | "At a Glance" blurb | ⚠️ missing |
| `dedicated_support_text` | "At a Glance" blurb | ⚠️ missing |
| `highlights` (ordered list) | sidebar "Key Highlights" checklist | ⚠️ missing |
| `hero_image` | course details page hero | ✅ added |
| `thumbnail_image` | course card image | ✅ added |
| Related Courses section | currently free-text course **names** (`course_info[].ids`) — needs to store real **slugs** instead, so related courses can be linked/rendered properly | ⚠️ structural fix needed |

**Not a CMS field:** `moodle_course_id` — matching exactly how `educateu` does
this (confirmed by reading its actual code, not just its docs), the Moodle
course ID is **not** a CMS/Prismic field at all. It's read from the course's
own **Stripe Product metadata**, via `stripe_product_id` above. See
[Moodle integration](#moodle-integration-real-not-a-reference-backend) below.

Until the 3 `stripe_price_id_*` fields exist per course, checkout has nothing
safe to charge — never construct a Stripe amount from CMS content on the fly.

---

## Pricing model: 3 Stripe Prices (1 per tier) + 3 cached display prices

Settled after checking exactly what `educateu` does, then deciding against
copying its one-price-plus-code-multiplier approach in favor of a real,
independent Stripe Price per tier — no percentage math to maintain in code.

**What `educateu` does (for context, not what we're doing):** one
`stripe_price_id` per course, plus a code-side percentage multiplier for
bulk/group pricing (`src/utils/pricing.ts` there: `≥50 seats → 30% off, ≥25 →
20% off, ≥10 → 10% off`) applied to that one base price at session-creation
time — no separate Stripe Price per tier.

**What we do instead:** each course gets **3 real Stripe Prices** — one per
seat-count tier (`1` seat = Personal / `2–5` seats = Group / `6+` seats =
Enterprise, per the earlier decision) — referenced by `stripe_price_id_personal`
/ `_group` / `_enterprise`. Checkout picks the tier from the selected seat
count, then charges exactly that tier's real Stripe Price — no multiplier, no
business-percentage logic to keep correct in code:

```ts
// 🧩 our code — src/app/api/checkout/route.ts (to be updated once the CMS fields exist)
function getTierPriceId(course: Course, seatCount: number): string {
  if (seatCount >= 6) return course.stripePriceIdEnterprise;
  if (seatCount >= 2) return course.stripePriceIdGroup;
  return course.stripePriceIdPersonal;
}

const price = await stripe.prices.retrieve(getTierPriceId(course, seatCount));
const amount = price.unit_amount! * seatCount;
```

**Why 3 *display* prices too (`price_personal`/`_group`/`_enterprise`):**
avoids a live Stripe API call just to show a number on a card or in the
sidebar before a tier is even selected. This mirrors `educateu`'s
`tuition_fee` pattern (a cached plain-text display copy) — same tradeoff:
these numbers must be kept in sync by hand with the real Stripe Price for
that tier, since nothing in code cross-checks them (this is the one part of
`educateu`'s pattern worth keeping, since it's a display-only convenience,
not the actual charge path — the charge always resolves from Stripe
directly, per the code above).

`compare_at_price` (Data prerequisites, above) is unrelated to any of this —
a single, manually-entered "was £X" strikethrough shown against
`price_personal` only, not tied to what's actually charged. Leave blank when
the Personal tier isn't on sale.

---

## Step 1 — Browse courses ✅ built

- `GET /api/pages/by-template?website_id=48&template_id=29` ✅ wired up in
  `getCourses()` (`src/lib/courses/loaders.ts`). Feeds `/courses`
  (`ExploreCourses.tsx`) and the home page's "latest 3" section.
- Returns `{ success, template, data: Page[], count }` — each `Page` has
  `id`, `title`, `slug`, `is_published`, and a `sections[]` array (Title,
  Overview, Course Details, Course Content, FAQ, Related Courses, Pricing).
  Unpublished pages are filtered out before reaching the UI. Fields not yet
  added to the CMS (see [Data prerequisites](#0-data-prerequisites-cms-fields-the-course-preview-template-needs))
  map to `""`/`null`/`"0"` rather than a synthesized fallback, so gaps are
  visible instead of silently papered over.

## Step 2 — View a course ✅ built

- Resolved: there's no per-slug CMS endpoint — `getCourseBySlug()` fetches
  the same cached by-template list and finds the matching page by `slug` in
  memory (same `unstable_cache` entry `getCourses()` uses, so this costs no
  extra network round-trip).
- Feeds `/courses/[slug]` (`CourseHero.tsx`, `CourseSidebar.tsx`,
  `CourseFAQ.tsx`). This is where the 3 `stripe_price_id_*` fields (and
  `stripe_product_id`, used to resolve `moodle_course_id` — see
  [Moodle integration](#moodle-integration-real-not-a-reference-backend))
  get read from for [Step 4](#step-4--start-checkout-in-page-no-redirect).

## Step 3 — Add to Cart

- **No API call.** Client-only: Zustand + `localStorage`
  (`src/store/cart-store.ts`) ✅ already built.
- A cart line carries `course.slug`, `title`, `price` (display estimate for
  whichever tier is selected), `quantity` (seat count), `purchaseType`
  (Personal/Group/Enterprise — driven by seat count per the
  [Pricing model](#pricing-model-3-stripe-prices-1-per-tier--3-cached-display-prices)
  above, which selects one of the 3 real Stripe Prices).

## Step 3b — Your Details + seat allocation (Group/Enterprise only) ✅ built

Runs on `/checkout`, before the payment step — mirrors `educateu`'s own
`/checkout` page (per-seat name/email collection), extended with a small
"Your Details" step `educateu`'s flow doesn't have (needed because our
Payment Element form has no equivalent to Stripe Checkout's built-in
custom fields/billing collection):

- **Your Details** (`buyerName`/`buyerEmail`) — always collected, required
  for every purchase (Personal included). Feeds `registerUser()`/
  `updateBulkOrderStatus()` in Step 7 via PaymentIntent `metadata`
  (`buyer_name`/`buyer_email`).
- **Seat allocation** (`src/app/checkout/SeatAllocation.tsx` +
  `seat-allocation.ts`) — only shown for cart lines with `quantity > 1`
  (Group/Enterprise). Collects first name / last name / email per seat, up
  to 5; beyond that (`CSV_THRESHOLD`), the buyer can opt into "provide a
  spreadsheet after purchase" instead — same threshold and same
  human/manual-process shape as `educateu`'s CSV path.
- The Payment Element doesn't render until this step is complete
  (`canContinue` gates a "Continue to Payment" button) — matching
  `educateu`'s "allocate before Stripe" ordering.

## Step 4 — Start checkout (in-page, no redirect) ✅ built

Already implemented with **Payment Intents + Stripe Elements** (Payment
Element), not Stripe Checkout's embedded mode — this is the fully-custom-form
option, chosen so the payment form could be themed to match the site's dark
UI (Stripe's embedded Checkout only allows Dashboard-level branding, not full
CSS control).

- `src/app/api/checkout/route.ts` ✅ — creates a PaymentIntent server-side:
  ```ts
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // ⚠️ currently summed from client-sent cart prices (TEST-ONLY,
            // see comment in the route) — must become the getTierPriceId()
            // + stripe.prices.retrieve() calculation above, re-validated
            // server-side once the 3 stripe_price_id_* fields exist
    currency: "gbp",
    payment_method_types: ["card"], // Revolut Pay / other automatic methods
                                      // deliberately excluded per decision
    metadata: { slugs: ..., buyer_name: ..., buyer_email: ... },
  });
  ```
- **Then**, for any cart line with `quantity > 1` (Group/Enterprise) ✅ —
  mirrors `educateu`'s own order exactly (Stripe object created *first*,
  then the Moodle call references its real id, so there's something real
  to undo if Moodle fails):
  ```ts
  // src/app/api/checkout/route.ts, after the PaymentIntent above
  await createBulkOrder({
    orderId,                              // generated here, e.g. ORD-20260814120000-A1B2C3
    stripeSessionId: paymentIntent.id,     // the PaymentIntent, not a Checkout Session — same slot
    items: moodleItems,                    // one MoodleBulkOrderItem per bulk cart line
    ...
  });
  await stripe.paymentIntents.update(paymentIntent.id, {
    metadata: { ...paymentIntent.metadata, order_id: orderId },
  });
  ```
  On failure: `stripe.paymentIntents.cancel(paymentIntent.id)` — the same
  "expire the session if the Moodle pre-create fails" guard as `educateu`,
  adapted from `sessions.expire()` to `paymentIntents.cancel()` since this
  flow doesn't use Checkout Sessions.
- ⚠️ **Guard, not yet live**: `resolveMoodleCourseId()` (`src/lib/moodle.ts`)
  resolves to `null` for every course today, since no course's Stripe
  Product has `moodle_course_id` set as metadata yet (see Moodle
  integration, below). Sending `null` to the real `my.educateu.com` instance
  would create bad data there, so `createBulkOrder` is **skipped** (with a
  console warning) whenever any bulk cart line resolves to `null` — payment
  still succeeds, just untracked in Moodle, until that metadata is set.
- `src/app/checkout/page.tsx` + `src/app/checkout/CheckoutForm.tsx` ✅ —
  fetches the `client_secret` once, renders `<Elements>` with a dark
  `appearance` config matching the site's tokens, `<PaymentElement>`, and
  calls `stripe.confirmPayment({ elements, confirmParams: { return_url },
  redirect: "if_required" })`. Card payments resolve in-page; the promise
  never navigates away. Two-column layout: payment form left, order summary
  (cart items + total) right.
- For Personal (1-seat) purchases specifically: no pending-order call at
  all here, matching how `educateu` handles its Personal-plan purchases —
  info is stashed in the PaymentIntent's own `metadata` and enrolment
  happens entirely in the webhook (Step 8) after payment succeeds.

## Step 5 — User pays ✅ built

- Inside `<PaymentElement>` on our own `/checkout` page. No navigation away
  from the site at any point.

## Step 6 — Payment resolves, still in-page ✅ built

- `stripe.confirmPayment(...)` (with `redirect: "if_required"`) resolves with
  the `paymentIntent` object directly in `CheckoutForm.tsx`'s submit handler
  — on success, `router.push(`/checkout/return?payment_intent=${id}`)` (a
  Next.js client-side route change, not a Stripe-issued redirect).
- `src/app/checkout/return/page.tsx` ✅ re-verifies server-side via
  `stripe.paymentIntents.retrieve()` (never trusts the client-side result
  alone), checks `status === "succeeded"`, clears the cart
  (`ClearCartOnSuccess.tsx`) on success.
- This client-side "it looks done" state is still provisional UX only — the
  **authoritative** confirmation is the webhook in Step 7, independent of
  whether this step's UI update ever runs (e.g. if the tab closes right
  after paying).

## Step 7 — Stripe calls our webhook ✅ built

- `src/app/api/webhook/route.ts` ✅ — verifies `stripe-signature` against
  `STRIPE_WEBHOOK_SECRET` (`stripe.webhooks.constructEvent(...)`), same as
  `educateu`'s `src/app/api/webhook/route.ts`.
- Handles `payment_intent.succeeded` (not `checkout.session.completed` —
  that event is specific to Checkout Sessions, which this flow doesn't use)
  and `payment_intent.payment_failed`.

## Step 8 — Real Moodle enrolment ✅ built

The old plan here (`POST/PATCH /api/orders`, `/api/users` on the courses
REST backend) is **superseded** — those endpoints were never confirmed
(401, unknown contract) and course *content* has already moved off that
backend to the CMS. Enrolment now goes directly to the same Moodle instance
`educateu` uses, via `src/lib/moodle.ts` — see
[Moodle integration](#moodle-integration-real-not-a-reference-backend)
below for the full picture, including what this does and doesn't verify.

In `src/app/api/webhook/route.ts`, on `payment_intent.succeeded`:

- **`paymentIntent.metadata.order_id` present** (Group/Enterprise) →
  `updateBulkOrderStatus({ ..., status: "PAID" })`. Flips the Moodle order
  to `PAID` only — does **not** itself enrol the allocated seat-holders,
  mirroring `educateu`'s own documented gap (see below).
- **No `order_id`** (Personal) → `registerUser({...})`, batching every
  personal course in the cart into one call's `courses[]` array. This is
  the one call that **synchronously, confirmedly creates a real Moodle
  account + enrolment**.
- Either path is skipped (with a console warning, not a thrown error) if
  `resolveMoodleCourseId()` returns `null` for any involved course — same
  guard as Step 4, so a webhook retry storm can't happen over Stripe
  Product metadata that simply hasn't been set yet.
- On `payment_intent.payment_failed`: `updateBulkOrderStatus({ ...,
  status: "FAILED" })` if an `order_id` exists — the nearest equivalent to
  `educateu`'s `checkout.session.expired` → `CANCELLED`, adapted since this
  flow has no Checkout Session to expire.

---

## Moodle integration: real, not a reference backend

Confirmed by diffing `.env` files between this project and `educateu`: the
`MOODLE_TOKEN`/`MOODLE_TOKEN_USER_REGISTRATION` values are byte-for-byte
identical. This is the **same live Moodle instance** at
`https://my.educateu.com` — every call from `src/lib/moodle.ts` creates
real data there, not a sandbox scoped to this project.

**Where `moodle_course_id` comes from — confirmed by reading `educateu`'s
actual code AND real Stripe Product metadata, not just its own docs:** it
is **not** a Prismic/CMS field there either. Both its Personal path
(`create-checkout-session/route.ts`) and its bulk path read
`product.metadata.moodle_course_id || product.metadata.course_id` off the
course's own **Stripe Product** — reusing the Product that already has to
exist for Group/Company pricing, rather than adding a new CMS field.
**In practice, `moodle_course_id` is never actually set** — real Products
only carry `course_id` (the course's Moodle ID, just under a different key
name), plus `course_category` and `lms` (both purely informational, copied
into Stripe session/PaymentIntent metadata for record-keeping — confirmed
nothing else in `educateu` branches on them). `resolveMoodleCourseId()`
(`src/lib/moodle.ts`) mirrors the exact same fallback:
`stripe.products.retrieve(stripe_product_id)`, then
`metadata.moodle_course_id || metadata.course_id`. **Practical step per
course:** in the Stripe Dashboard, open the Product matching that course's
`stripe_product_id` and add a `course_id` metadata key with the course's
real numeric Moodle ID (optionally also `course_category`/`lms` to match
`educateu`'s convention, though nothing here reads them).

**What's confirmed to work, verifiable from code alone:**
- `registerUser()` → `POST /webservice/rest/server.php`
  (`local_educateu_enroll_user`) — creates a real, working Moodle account +
  enrolment, synchronously, for Personal purchases.
- `createBulkOrder()` / `updateBulkOrderStatus()` → `POST`/`PUT
  /local/multibuy/order.php` — reliably tracks a Group/Enterprise order's
  status (`PENDING` → `PAID`/`CANCELLED`/`FAILED`) inside Moodle.

**What's NOT verifiable from either codebase:** whether flipping a bulk
order to `PAID` causes Moodle's own `local_multibuy` plugin to actually
create/enrol accounts for the named seat-holders. That logic (if it
exists) lives inside Moodle itself, outside both Next.js repos. Confirm
with whoever administers `my.educateu.com`/that plugin before relying on
it for a real launch.

**Known gap, carried forward deliberately (matches `educateu`, not a bug
introduced here):** a Personal purchase inside the *same cart* as a bulk
item never gets its own `registerUser()` call — once any cart line has
`quantity > 1`, the whole checkout is treated as one bulk order. Fine for a
cart of all-Personal or all-bulk items; a mixed cart's Personal line(s)
would need explicit handling if that scenario matters in practice.

---

## Summary table

| # | Step | Endpoint / call | Source |
|---|---|---|---|
| 1 | Browse courses | `GET /api/pages/by-template?website_id=48&template_id=29` | ✅ done |
| 2 | View course | CMS by-template list, filtered by slug in memory | ✅ done |
| 3 | Add to cart | — (local state only) | ✅ done |
| 3b | Your Details + seat allocation | `src/app/checkout/SeatAllocation.tsx` | ✅ done |
| 4 | Create PaymentIntent + Moodle bulk order (if any) | `src/app/api/checkout/route.ts` | ✅ done (test-only pricing; Moodle call skipped until `moodle_course_id` metadata exists) |
| 5 | Pay | `<PaymentElement>` — **no redirect** | ✅ done |
| 6 | Payment resolves in-page | `confirmPayment()` result → `/checkout/return` | ✅ done |
| 7 | Webhook fires | `src/app/api/webhook/route.ts` | ✅ done |
| 8a | Mark Moodle order PAID/FAILED (bulk) | `updateBulkOrderStatus()` → `my.educateu.com` | ✅ done (skipped without `moodle_course_id` metadata) |
| 8b | Enrol learner (personal) | `registerUser()` → `my.educateu.com` | ✅ done (skipped without `moodle_course_id` metadata) |
| 8c | Enrol individual seat-holders (bulk) | *(depends on Moodle's own `local_multibuy` plugin — unverifiable from code)* | ⚠️ unconfirmed, external to both repos |

---

## Open questions — now for whoever owns `my.educateu.com` Moodle, not a backend team

The `/api/orders`/`/api/users` questions this section used to list are
moot — those REST-backend endpoints are no longer part of the plan.
What's actually open now:

1. **Does the `local_multibuy` plugin enrol seat-holders automatically**
   when an order flips to `PAID` via `updateBulkOrderStatus()`? (Step 8c,
   above — the one thing neither codebase can confirm.)
2. **Is Moodle course creation self-serve**, or does someone need to
   register each course in Moodle before its numeric ID can be added as
   `moodle_course_id` metadata on that course's Stripe Product?
3. **`purchaseType`/`subType` values `createBulkOrder()` expects** — this
   project passes `"GROUP"`/`"ENTERPRISE"` (its own tier names, uppercased)
   for `purchaseType` and `""` for `subType`, guessed from the doc's
   `"INDIVIDUAL"|"COMPANY"` example for a *different* project's tiers.
   Confirm the plugin actually accepts these values.
4. Is `LoginForm.tsx`/`RegisterForm.tsx` (currently unwired, client-state
   only) meant to authenticate against this same Moodle instance?

---

## Things intentionally not covered here

- Bundle offers (multiple courses under one Stripe Product) — still sourced
  from the REST API (`/api/bundles`), not part of this CMS migration. Would
  add `metadata.course_ids` on the bundle's Stripe Product and branch the
  webhook's enrollment loop accordingly. Bundle purchases don't yet call
  Moodle at all.
- Stripe-native promotion codes (`allow_promotion_codes`) — a separate
  mechanism from `compare_at_price`/seat-tier pricing above.
- Refunds/cancellations after payment.
- The full `User`/`Organization`/`Membership`/`Seat`/`Invitation` model from
  the "let seats be claimed after purchase" design — explicitly out of
  scope until a database is chosen for one of these projects; neither
  `educateu` nor this project has one today.
- Learner-facing dashboard / "my courses" access-gating.
- Mixed-cart Personal + bulk lines both being enrolled correctly (see the
  known gap noted under Step 8, above).
