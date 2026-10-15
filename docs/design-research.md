# educateU Business: homepage design research

Researched 2026-09-30. The goal is to lift the homepage to Awwwards Site of the Day level while keeping it credible for HR managers and compliance leads.

**How this was researched.** I fetched these pages directly: Awwwards Sites of the Day (Sep 2026), the Education and Business & Corporate category pages, and the Awwwards detail pages for Why Zero, Moto Finance, Cerebrium, L.I.S.A., Squarespace Foundations, USAvionix and Butter. I also fetched the homepages of Linear, Mercury, Attio, Maven, Brilliant, 360Learning, Stripe, Resend and Family, and checked every URL below with an HTTP request (all return 200 unless noted). WebFetch returns text rather than pixels, so the visual descriptions combine the fetched structure and copy, the Awwwards jury tags and colour data, and prior first-hand knowledge of the sites. Before copying a pattern exactly, open the live site, because these pages change often.

Not usable: **diagram.com** no longer resolves (Diagram was absorbed into Figma), and **maven.com/business** returns 404 (the "Maven for Business" link now lives in the header).

---

## Part 1: Reference sites (15)

### 1. Linear — https://linear.app
- **Hero:** Left-aligned headline ("The product development system for teams and agents") set in a tight, medium-weight grotesk at about 64–80px with negative tracking. A short subline sits underneath. Below the fold line is a large, slightly perspective-tilted product UI that fades into the background at its lower edge. Motion is restrained: the text fades up, the UI lifts in, and hairline borders glint.
- **Signature device:** The product UI is the illustration. Each feature section (Intake, Plan, Build, Monitor) shows a real, cropped fragment of the interface with one element animating, such as an issue moving between columns or a roadmap bar growing.
- **Colour/type:** Near-black with a very slight colour cast and grey text levels. There is almost no colour except small status dots. Inter Display/Variable is used with large size contrast, and body text stays small.
- **Product/pricing:** Pricing is not on the homepage. Features are presented as numbered chapters ("1.0 Intake", "2.0 Plan"...), which reads like a manual.
- **Why premium:** Nothing is decorative, and every pixel is product. Spacing is extremely consistent, borders are one pixel, and the page shows total confidence without shouting.

### 2. Stripe — https://stripe.com
- **Hero:** A left headline ("Financial infrastructure to grow your revenue") over the animated mesh-gradient "wave" canvas that runs diagonally behind the top of the page. A scrolling logo wall sits directly under the CTAs.
- **Signature device:** The animated WebGL gradient band, cut at an angle. It is widely copied and still recognisably Stripe's.
- **Colour/type:** A white page with deep navy text and a saturated gradient used only in the hero band. Sohne is used in weights 300–500. The large stats block ("US$1.9tn", "99.999% uptime") uses tabular figures.
- **Product/pricing:** A product grid with small live UI snippets, then use-case sections (Enterprise / Startup / Platform) each built around one customer story.
- **Why premium:** Big numbers, real customer names, very fine micro-UI illustrations, and precise vertical rhythm.

### 3. Stripe Press — https://press.stripe.com
- **Hero:** Book covers rendered as 3D objects on a dark shelf. You scroll or drag through the catalogue, and each book is a physical object with its own spine, cover art and colour.
- **Signature device:** A catalogue presented as tangible objects on a shelf.
- **Colour/type:** Dark warm backgrounds, with each book carrying its own palette. Serif-led, literary typography.
- **Product/pricing:** Each book gets an editorial detail page with a price and "Buy" button, and the catalogue is the hero.
- **Why premium:** It treats each product as an artefact rather than a card. **This is directly relevant to 18 courses at £15, which are a small, finite, collectable catalogue.**

### 4. Mercury — https://mercury.com
- **Hero:** "Radically different banking". A very large, soft serif-meets-grotesk headline sits centred over a full-width cinematic image of an interface sequence (the fetch shows start and end frames of an animated hero). There are two CTAs, "Open account" and "Launch demo". **The "Launch demo" CTA maps exactly onto our "Watch Demo".**
- **Signature device:** A calm, atmospheric hero image with product UI floating in light. It feels like a luxury print ad for a bank.
- **Colour/type:** Muted, low-contrast palette of deep indigo and warm greys, with generous whitespace. A custom display face is paired with a quiet sans.
- **Product/pricing:** Four product pillars, each with an illustration and a CTA. Numbers are prominent ("1.5% cashback", "3.96% yield"). The trust block has stats (300K+, 1 in 3 startups, 4.9 rating) and security features.
- **Why premium:** Restraint, photographic light, and a slow, confident rhythm.

### 5. Attio — https://attio.com
- **Hero:** "Welcome to agentic revenue." A centred headline with a white, airy layout and a large product frame underneath playing a real workflow (a meeting transcript turning into CRM records).
- **Signature device:** A five-tab platform switcher (Build pipeline / Convert leads / Run motions / Forecast / Retain). Each tab swaps a realistic UI mockup, and a progress bar on the active tab auto-advances.
- **Colour/type:** White with near-black text and one or two accents used only inside product UI. Inter-style grotesk.
- **Product/pricing:** Mockups built from real data (ICP scores, deal boards), not lorem ipsum. A changelog feed on the homepage signals momentum.
- **Why premium:** The mockups look like screenshots but are built in code, so they stay crisp and animated. The auto-advancing tabs are calm rather than a carousel.

### 6. Ramp — https://ramp.com
- **Hero:** A large headline about saving time and money, then a single email field with a CTA, plus a bold incentive ("$3,100" offer). Proof comes immediately with "Trusted by 70,000+ businesses" and logos.
- **Signature device:** Big quantified proof ("27M+ hours saved", "close books 75% faster") set in giant numerals. Ramp's yellow-lime accent on off-white is distinctive.
- **Colour/type:** Warm off-white, black, and one acid accent. A Söhne-like grotesk.
- **Product/pricing:** Outcome-first: every section leads with a number, then the UI.
- **Why premium:** One accent colour applied with discipline. That is directly transferable to mint on deep green.

### 7. Maven — https://maven.com
- **Hero:** "Unlock your career growth" with three offer-type tiles (Cohort courses / Workshops / Free Lightning Lessons), each with a one-line promise.
- **Signature device:** Course cards led by people, showing instructor portraits, credentials ("ML engineer | Ex-Airbnb") and start dates. An instructor carousel follows.
- **Colour/type:** Clean white with coloured category chips.
- **Catalogue:** Trending courses, then experts, then eight category tiles. Prices are hidden until the detail page.
- **Why premium:** Credibility comes from people and credentials. **Lesson for us: a flat £15 price is a strength, so show it, where Maven hides it.**

### 8. Brilliant — https://brilliant.org
- **Hero:** "Your personal tutor for math and coding", with role-split CTAs ("I'm a learner" / "I'm a parent or teacher").
- **Signature device:** Interactive lesson fragments you can actually play in-page (sliders, puzzles). The product is demonstrated by doing, not showing.
- **Colour/type:** Bright white with playful, saturated illustrations. A friendly rounded sans.
- **Catalogue:** Subject categories expand to course lists ("+28 additional courses").
- **Why premium:** Interactivity with a purpose. **Lesson for us: a 20-second "try a question" micro-quiz from a real course (e.g. Fire Safety) beats any animation.**

### 9. 360Learning — https://360learning.com
- **Hero:** "The AI-driven LMS built to drive proprietary expertise" with "I want a demo" and "See how it works", followed by a logo carousel (Cisco, Michelin, Dior, LVMH).
- **Signature device:** Animated AI companion characters and a dense trust stack (G2 4.6, Capterra 4.7, ISO 27001, SOC 2, GDPR badges).
- **Relevance:** This is the closest direct competitor. **Compliance training is a named use case ("Automate mandatory training and re-certification").** The site is competent but template-looking: stock gradients and a generic card grid. This is the look we must beat, not copy.
- **Why it matters:** The HR buyer expects certifications, integrations and rating badges. We must include trust signals of that kind, designed better.

### 10. Why Zero (Zero University) — https://why.zero.university — Awwwards SOTD, 7 Sep 2026 (Education, Business & Services Honors)
- **Hero/concept:** An immersive, single-page story about replacing the broken education system with AI-native learning. White page with neon green #01C654.
- **Signature device:** "Hold-to-proceed" mouse interaction and a page-unlock mechanic, plus an origami-folding personalised waitlist form. Built with GSAP, Three.js and Blender. The jury scored Creativity at 8.16.
- **Relevance:** This is the most recent education SOTD, and it proves that **white + one vivid green** can win. The folding-paper form is the kind of single, delightful moment we want, such as a certificate that folds or stamps itself.
- **Caution:** Its game-like navigation and heavy scroll story are too much for HR buyers. Borrow one moment, not the structure.

### 11. Moto Finance — https://moto-card.com — Awwwards SOTD, 24 Sep 2026 (Properly Studio)
- **Hero:** A premium metal card rendered in 3D, floating in a two-colour world of #0B0C07 near-black and #E1E5E5 cool light grey. Big background images and parallax. Built with Webflow, GSAP and Three.js.
- **Signature device:** A single hero object (the card) that turns and catches light as you scroll. "Designed to make the card feel worth carrying before you even apply."
- **Relevance:** Our equivalent object is **the CPD certificate**. Make the certificate feel worth earning before anyone buys.
- **Why premium:** Two colours, one object, lots of air, slow motion.

### 12. Cerebrium — https://cerebrium.ai — Awwwards SOTD, 10 Sep 2026
- **Hero:** An interactive WebGL globe with force-field effects on a deep blue (#172B76) and purple (#902177) base.
- **Signature device:** **A transparent pricing calculator on the marketing page** (listed in the jury's notable elements), plus Lottie feature animations. It is a B2B infrastructure site that won SOTD because its technical content is presented with craft.
- **Relevance:** Proof that a pricing calculator can be an award-winning element. For us: "18 courses × your team size × £15 = total", computed live.
- **Avoid:** The globe, because the sister site owns the globe footer.

### 13. Squarespace Foundations — https://brand.squarespace.com — Awwwards SOTD, 1 Sep 2026 (Resn)
- **Hero:** An editorial, type-led brand book in white and #292929 charcoal only. Very large typographic specimens, with video-driven photography framed like magazine plates.
- **Signature device:** Editorial scrolling transitions where type and image swap places with crisp masks. There are no gimmicks; typography is the spectacle.
- **Relevance:** The model for an **editorial/print** direction. Monochrome plus one brand colour, with the grid used as design.

### 14. Raycast — https://raycast.com
- **Hero:** A dark stage with a glowing, glassy 3D key or command bar and a centred headline. The product window sits on a light-leak gradient.
- **Signature device:** **The ⌘K command palette** as a brand symbol. The site's own UI echoes it, with keyboard hints and "type to search".
- **Colour/type:** Near-black with a red-orange glow and Inter at tight tracking. Glass surfaces with inner borders.
- **Catalogue:** The extension store is a catalogue of hundreds of items presented as searchable, dense tiles with icons. **This is the right pattern for "18 courses you can filter in one keystroke".**

### 15. Lusion — https://lusion.co
- **Hero:** A full-screen real-time 3D scene that reacts to the cursor, with minimal UI chrome and large sans type overlaid. Sound is optional.
- **Signature device:** Cinematic transitions between projects, where a video or 3D frame expands from a card into the full viewport.
- **Relevance:** The model for a cinematic direction. The **card-expands-to-fullscreen video** transition fits our workplace montage well.
- **Caution:** Full WebGL is overkill here. Reproduce the feeling with `clip-path` and a `<video>`, not a 3D scene.

**Also checked and worth a glance:**
- **Clerk** (https://clerk.com): a light and dark hybrid with an obsessively crafted component "specimen" (the sign-in box shown as a physical object with shadows and glints).
- **Resend** (https://resend.com): monochrome black, with a 3D-rendered envelope or cube hero and a developer-first layout.
- **Family** (https://family.co): phone-mockup storytelling and "Fun" micro-interactions as a value proposition.
- **Butter** (https://butter.video): SOTD 28 Sep 2026. A #1E1E1E/#F7F7F7 duotone with the video-timeline UI as the hero.
- **L.I.S.A. by Locomotive** (https://lisa.locomotive.ca): SOTD 16 Sep 2026. A conversational assistant as the homepage.
- **USAvionix by basement.studio** (https://usavionix.com): SOTD 9 Sep 2026. Black/white Next.js + WebGL storytelling.
- **Cosmos** (https://cosmos.so), **Rauno** (https://rauno.me), **Active Theory** (https://activetheory.net), **Arc** (https://arc.net), **Superhuman** (https://superhuman.com), **Duolingo for Business** (https://www.duolingo.com/business), **Coursera for Business** (https://www.coursera.org/business).

### Patterns across the September 2026 SOTD list
Of the 30 recent Sites of the Day, the large majority declare **a two-colour palette** (black/white, or black plus one accent). Nearly all use GSAP, and many use Three.js, but the B2B winners (Cerebrium, Moto, Butter, USAvionix) keep the 3D to **one hero object or one scene** and make the rest of the page precise, UI-led content. The jury tags that recur are Storytelling, Microinteractions, UI Design, Big Background Images and Transitions.

---

## Part 2: The 10 most transferable techniques

Target stack: Next.js + Tailwind + Framer Motion/GSAP, with three.js or ogl only where essential.

1. **Two colours plus one accent, used with discipline.** Take deep green #06180b and a paper or white tone for everything, and reserve mint #1ee9b5 for one thing per screen (the CTA, a highlight, a live number).
   *Implementation:* define `--ink`, `--paper` and `--accent` in `@theme`, lint by design review so mint appears at most once per viewport, and use `color-mix()` for tints instead of new hues.

2. **Oversized, tightly tracked display type as the hero image.** Headlines at 9–14vw with −0.04em tracking and line-height 0.9, where the words themselves are the composition.
   *Implementation:* `text-[clamp(3.5rem,11vw,11rem)] leading-[0.9] tracking-[-0.045em]`. Split into words with a tiny utility (no SplitText licence needed) and stagger `y: "110%" → 0` inside `overflow-hidden` line wrappers using Framer `staggerChildren: 0.06`.

3. **Product UI built in code instead of screenshots** (Linear, Attio). A living "team training dashboard" fragment: seats being assigned, progress bars filling, a certificate issued.
   *Implementation:* a real React component with fake data and a Framer `useAnimate` timeline looped every 6s. Pause it with `useInView` and fall back to a static frame under `prefers-reduced-motion`.

4. **One hero object that carries the brand** (Moto's card, Stripe Press's books). For us it is **the CPD certificate**, which tilts toward the cursor, catches a light sweep, and gets stamped.
   *Implementation:* CSS 3D (`perspective: 1200px`, `rotateX/Y` from pointer via Framer `useSpring`) and a moving `linear-gradient` specular sheen layer. No three.js is needed.

5. **Catalogue as a collectable set, not a card grid.** Eighteen is a small, finite number, so present it as an index, a shelf or a register ("01–18"), with the price visible.
   *Implementation:* a semantic `<ol>` or `<table>` in a CSS grid, `font-variant-numeric: tabular-nums`, and row hover that reveals a thumbnail following the cursor via a `motion.div` using `useMotionValue` and `useSpring`.

6. **Instant filter in the style of a command palette** (Raycast). Typing filters the 18 courses in place, and ⌘K or "/" opens it.
   *Implementation:* reuse `src/lib/courses/search.ts`. Client-side `useDeferredValue` filtering, `layout` and `AnimatePresence` on items so they reflow smoothly, and `cmdk` for the palette.

7. **Live pricing calculator** (Cerebrium SOTD). "Team size [ 25 ] × courses [ 3 ] × £15 = £1,125, certificates included."
   *Implementation:* a range input plus a stepper. Animate the total with a rolling-digit component (per-digit `motion.span` `y` transitions) and make the result CTA deep-link to checkout with query params.

8. **Masked video reveals instead of plain embeds** (Lusion, Mercury). The workplace montage appears through a shape (a rounded rect growing from a CTA, a word mask, or a frame) rather than in a 16:9 box.
   *Implementation:* animate `clip-path: inset(... round 24px)` with Framer `useScroll` over one viewport height only (no pinning), and use a `<video muted playsInline loop preload="metadata">` with a poster. Reuse `public/aw/hero.mp4`.

9. **Proof as big, quantified numerals** (Ramp, Stripe, Mercury). Examples: "18 CPD-certified courses", "£15 each", "Certificate included", plus review rating and count.
   *Implementation:* count up once on `useInView({ once: true })` with tabular figures. Keep the count-up under 800ms, and with reduced motion render the final value.

10. **Micro-interactions with purpose, not decoration.** Magnetic CTAs, a hover that draws the underline, an FAQ whose row height is animated with a spring, and a cursor-following label on video ("Play demo").
    *Implementation:* for magnetic buttons, pointer delta × 0.25 through `useSpring({ stiffness: 300, damping: 20 })`. Animate FAQ height with `motion.div layout` or `height: auto`. Wrap all motion in `MotionConfig reducedMotion="user"`.

**Performance and accessibility guardrails.** These score on the Awwwards Dev award and matter for HR buyers on corporate laptops:
- Hero LCP should be text, not video, with the poster image preloaded.
- Lazy-mount any WebGL after idle.
- Keep main-thread animation to `transform` and `opacity`.
- Aim for Lighthouse 90+ on mobile.
- Keep focus-visible states styled in brand mint.

---

## Part 3: Three art directions

All three use only existing copy:
- Headline: "Online courses and certification made simple for everyone"
- CTAs: "Explore Our Courses" / "Watch Demo"
- The trusted-by logos
- "Everything you need to build real workplace skills. One-off priced, with your certificate included…"
- The three reasons: UK Recognised Qualifications / Flexible Learning / Learner Support
- Reviews and the FAQ

None of them uses:
- The sister site's dark petrol/teal ground
- A photo wall
- Accordion panels with vertical labels
- The heading "Questions, answered."
- A globe

None uses scroll-jacking or long horizontal pins.

---

### Direction A: "The Register" (editorial / print)

**Mood.** A beautifully typeset annual report crossed with a Stripe Press book. Calm, authoritative and literate. It feels like a respected institution and speaks to compliance leads who read policy documents for a living.

**Palette.**
| Role | Hex |
|---|---|
| Paper (page) | #F3F0E7 |
| Ink (text, rules) | #06180B |
| Mint (highlighter, CTA) | #1EE9B5 |
| Soft ink (secondary text) | #4A5A4E |
| Hairline | #D9D4C4 |
| Deep green panel (footer, one feature band) | #06180B with paper text |

**Typography.** **Instrument Serif** for display (Google Fonts, used large in regular and italic). **Stack Sans Text** for body and UI, which keeps continuity with the current site. Italic serif carries emphasis ("made *simple*").

**Hero (first screen).**
- A 12-column grid with visible one-pixel hairline rules, like a broadsheet front page.
- Top strip: a thin masthead rule with the date line "Est. UK · CPD-certified · 18 courses", in normal sentence case at body size, not small caps or a mono kicker.
- The headline "Online courses and certification made simple for everyone" is set in Instrument Serif at about 10vw across two-thirds of the width. "made simple" is in italic, and a **mint highlighter stroke draws itself under it** (SVG path, `pathLength 0 → 1`, 900ms, easing out) after the lines rise into place.
- In the right third is the workplace video in a **tall "plate"**: a 4:5 crop with a thin ink border and a caption underneath in the style of a figure caption ("Fig. 1. Training that fits the working day"). Clicking "Watch Demo" expands the plate to a centred lightbox with a `clip-path` transition.
- Under the headline: "Explore Our Courses" as a solid ink pill with a mint arrow, and "Watch Demo" as a text link with an animated underline.
- The trusted-by logos sit in a single ruled row at the foot of the screen, monochrome ink at 60% opacity, like a list of subscribers.

**Course catalogue: "The Index".**
- The 18 courses are set as a **numbered table of contents**, with columns No. / Course / Duration / CPD / Price. The price reads "£15" in every row, deliberately repeated, because the repetition is the message.
- Hovering a row turns the ink to deep green, slides a mint dot in, and shows a **small cursor-following thumbnail** of that course's cover.
- A category filter (Health & Safety, HR, Care, and so on) sits above the table as plain underlined words.
- On mobile it collapses to a stacked list with the price aligned right.

**Other sections.**
- "Everything you need…" becomes a long-form paragraph set at 32px serif with a drop cap.
- The three reasons are laid out as numbered footnotes (1, 2, 3) in three columns separated by vertical rules.
- Reviews are pull quotes with large serif quotation marks.
- The FAQ is headed "Frequently asked" and styled as a numbered Q&A column. Each answer opens beneath a hairline with a spring height animation, with no vertical labels.

**Signature interaction.** **The certificate specimen.**
- A full-width deep-green band shows a real CPD certificate rendered as a paper object.
- It tilts gently toward the cursor (CSS 3D), and a light sheen passes across it.
- When it scrolls into view, a mint "CPD Certified" seal **stamps** onto it with a scale 1.3 → 1 spring, a slight overshoot and a soft shadow.
- The line beside it reads "…with your certificate included".

**Borrows from.** Squarespace Foundations (editorial type as spectacle), Stripe Press (catalogue as artefacts), Maven (credentials up front, with the price shown here).

---

### Direction B: "Control Room" (product UI / SaaS precise)

**Mood.** Linear-grade precision in daylight. It says "we are a serious platform, and your team's training will be managed, not just bought." It speaks to HR managers who need to assign, track and prove completion.

**Palette.**
| Role | Hex |
|---|---|
| Canvas | #FAFBF9 |
| Surface | #FFFFFF |
| Hairline | #E2E7E3 |
| Ink | #06180B |
| Muted | #5C6B60 |
| Mint (live/active states, CTA) | #1EE9B5 |
| Mint tint (selection backgrounds) | #D7FBF1 |
| Product-window chrome (the one dark element) | #06180B with #0F2A18 panels |

**Typography.**
- **Stack Sans Notch** for display. Its notched cuts give the "precise instrument" feel, set tight at −0.04em.
- **Stack Sans Text** for UI.
- **Geist Mono** for **numerals only** (prices, counts, progress). It is never used for eyebrow labels.

**Hero (first screen).**
- A split layout. On the left is the headline at about 88px in Notch with the subline and the two CTAs.
- On the right, taking about 55% of the width and bleeding off the edge, is a **live product window** built in React. It shows a "Team training" dashboard for a fictional company with rows of employees, course chips (Fire Safety, GDPR, Manual Handling), progress bars and a mint "Certified" pill.
- On a six-second loop, one row's progress bar fills, a toast slides in reading "Certificate issued · Manual Handling", and the completion counter at the top rolls up by one.
- "Watch Demo" morphs the product window into the video player with a Framer `layoutId` shared-element transition, and the montage plays inside the same window chrome.
- A faint one-pixel dot grid on the canvas fades out radially from the window.
- The trusted-by logos sit beneath in a quiet marquee row with an edge fade mask.

**Course catalogue: "The Library".**
- A **searchable, filterable grid of 18 compact tiles** in 3–4 columns. Each tile shows an icon glyph, title, duration, "CPD" badge and "£15" in mono.
- A search field sits above, with a "/" shortcut hint, and category segmented controls. Typing filters in place with `layout` animations.
- Each tile has a checkbox, and ticking it adds the course to a **sticky "Team basket" bar** at the bottom: "3 courses · 25 learners · £1,125 · Checkout".

**Other sections.**
- "Everything you need…" becomes a bento of three UI fragments: the certificate PDF preview, a learner's mobile lesson view, and a support chat bubble.
- The three reasons each get a small UI illustration in a bordered card.
- Reviews appear as a masonry of real review cards with star rows and dates.
- The FAQ is a two-column layout, with a sticky "Still stuck? Talk to support" card on the left and the questions on the right.

**Signature interaction.** **The team calculator.**
- A slider for team size (1–500) and the tiles you've ticked drive a total rendered in huge mono numerals.
- The total uses a per-digit rolling animation, and the per-learner cost stays fixed at "£15" beside it.
- The CTA underneath updates live ("Train 25 people for £375") and deep-links to checkout.
- It is exactly the kind of transparent pricing calculator that helped Cerebrium win SOTD, and it answers the buyer's first question instantly.

**Borrows from.** Linear (UI as illustration, hairline precision), Attio (live code-built mockups, auto-advancing states), Cerebrium (pricing calculator as a centrepiece), plus Raycast's search-first catalogue.

---

### Direction C: "Daylight" (cinematic / immersive)

**Mood.** A premium brand film. It is warm, human and confident, and shows real workplaces and real people learning. The feeling is Moto-card luxury applied to everyday work. It is the most emotive of the three and suits a board-level "we invest in our people" message.

**Palette.**
| Role | Hex |
|---|---|
| Deep green (stage) | #06180B |
| Forest (gradients, overlays) | #0D3320 |
| Mint (light, accents, CTA) | #1EE9B5 |
| Bone (type on dark, light sections) | #F2EFE6 |
| Warm grey | #A8B0A6 |

This is green-black, clearly not the sister site's petrol/teal. It alternates between dark stage sections and bone-white daylight sections.

**Typography.** **Stack Sans Notch** at massive sizes (13–16vw) for the hero word mask. **Inter Tight** or Stack Sans Text for body. Numbers are set in Notch.

**Hero (first screen).**
- The screen opens on deep green. The headline is set enormous, and **the workplace montage video plays *through* the letterforms** of "made simple": `background-clip: text` on a canvas, or an SVG `<mask>` over the `<video>`. The rest of the headline sits above and below in bone.
- A soft mint light bloom (a radial gradient animated with ogl, or plain CSS) breathes behind the type.
- Over the next viewport of normal scroll (no pin, no hijack), the masked word **scales up and the mask opens**. A `clip-path` goes from the text shape to a rounded full-bleed rectangle, and the video becomes a full-width cinematic frame with rounded 28px corners and the two CTAs overlaid bottom-left.
- "Watch Demo" unmutes and plays from the beginning with a cursor label reading "Play".
- The trusted-by logos in bone slide in under the frame.

**Course catalogue: "The Reel".**
- The 18 courses are **tall portrait cards like film frames** in a standard, non-pinned grid: 3 columns on desktop, 1.2-card peek on mobile.
- Each card has a cover still and title in Notch. Hovering plays a 3-second muted clip or a slow Ken Burns move on the still.
- A mint "£15 · CPD · Certificate" line slides up from the bottom of the card.
- Clicking expands the card into a course detail sheet with a `layoutId` shared-element transition, which is the Lusion "card-to-fullscreen" move.

**Other sections.**
- "Everything you need…" is set as a single giant sentence over a bone background, and **words brighten from grey to ink as the reader scrolls past**. This uses word-level opacity tied to `useScroll` progress and is not scroll-jacked.
- The three reasons are three large numerals (01, 02, 03) with short video loops or stills.
- Reviews appear as quote cards on deep green, with the reviewer's company logo.
- The FAQ is headed "Frequently asked" on a bone ground in a single wide column.
- The footer is a final full-bleed video still with "Explore Our Courses" and no globe.

**Signature interaction.** **Video through the headline.** The montage is revealed inside the words "made simple", then the mask opens into a full cinematic frame over a single, natural scroll. It is memorable in the first two seconds, uses the asset the client already has, and needs no WebGL: an SVG mask plus a `clip-path` driven by Framer `useScroll`, with ogl optional for the bloom only.

**Borrows from.** Moto Finance (one hero object in a two-colour world, slow luxurious motion), Lusion (card-to-fullscreen cinematic transitions), Mercury (calm atmospheric hero with "Launch demo" logic), plus the white-and-vivid-green confidence of Why Zero.

---

## Part 4: How to choose, and next steps

| | A: The Register | B: Control Room | C: Daylight |
|---|---|---|---|
| Feels like | An institution | A platform | A brand film |
| Best for | Compliance leads, trust | HR managers buying for teams | Board-level emotive sell |
| Risk | Could read as too literary | Needs dashboard mock data to look real | Depends on video quality; heaviest page |
| Build effort | Low–medium | Medium (calculator, basket) | Medium (masking, video optimisation) |
| Distance from sister site | Very far (light paper) | Very far (light, UI-led) | Far (green-black, not petrol; no photo wall) |

**Recommendation.** Build all three hero screens as live concepts (e.g. `/concepts/a|b|c`) before iterating. Hybrids are likely to win, such as B's calculator and basket placed inside A's editorial frame, or C's video-through-type hero on top of B's catalogue.

**Asset checklist.**
- 18 course cover stills (consistent art direction: duotone deep green/mint photography or a single illustration style)
- A real certificate PDF rendered to high-res PNG
- A 6–8s cut-down of the montage for the hero, H.264 + WebM, under 3 MB
- Trusted-by logos as monochrome SVG
