# Feature Specification: Premium Home Page Redesign

**Feature Branch**: `001-premium-home-redesign`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Premium redesign prototype of the home page. The site should read as unmistakably high-quality at first glance — the reference feeling is Linear and Vercel: near-black neutral surfaces, restrained opaque borders, precise typography, generous but disciplined spacing, and one or two accent colors used sparingly as details rather than everywhere. This is a deliberate departure from the current warm-amber palette; DESIGN.md is binding, so wherever the new direction contradicts it (for example "warm, not cold") DESIGN.md must be amended on purpose, not silently ignored. Build it with what the repo already has: shadcn components (base-nova style is configured, only button and orb exist so far), the `motion` package from `motion/react` for animation (installed, not yet used), and the `design-taste-frontend` skill as design guidance — with DESIGN.md winning any disagreement. Enrich the page with more of Joan's story and work using only content that already exists in joan-kb.md, flare-product-kb.md, src/data/bio.json and src/data/projects.json; nothing may be invented. The ElevenLabs voice orb stays the signature element. Scope is the home page as a prototype on a feature branch with a Vercel preview; /chess and the blog are untouched. Open points to clarify: whether to replace the amber accent entirely or keep a warm accent inside the neutral palette; whether typography changes from Space Grotesk; how much additional content to surface and in which sections; whether the hero keeps the orb above the name."

## Clarifications

### Session 2026-09-08 (second, after Joan saw the first preview)

- Joan's review: "es muy simple, es un front muy simple y malo; necesitamos más
  cosas, más llamativo". The first build read Linear/Vercel as restraint and set
  motion low; the quality has to be visible, not just correct. → Raise intensity:
  scroll-linked hero, a kinetic entrance for the name, an animated amber aurora,
  cursor-tracked spotlight borders on the project panels with one sourced number
  each, a scroll-drawn timeline of all nine projects, a logo marquee for the stack,
  the Messi photo visible instead of collapsed, and a magnetic email button. Every
  addition still uses only existing content; every animation still states its
  reason. FR-008 amended below.

### Session 2026-09-08

- Q: Keep the amber accent inside the neutral palette, switch to a cool accent, or
  go near-monochrome? → A: Keep the amber as the single accent.
- Q: Keep Space Grotesk, move to a neutral grotesque, or a hybrid? → A: Hybrid —
  neutral grotesque for all text, Space Grotesk only for the name.
- Q: How much more content — hero and work only, plus "How I think" and "What I
  build with", or everything always visible? → A: Hero, work, "How I think" and
  "What I build with". Reading, chess and Messi stay collapsed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A first-time visitor reads quality at a glance (Priority: P1)

Someone lands on the home page — an investor, an accelerator reviewer, a founder
Joan just met — and before reading a word gets the impression of a site that was
made with care: calm near-black surfaces, precise type, disciplined spacing, one
accent used as a detail rather than a wash. The voice orb draws the eye and reads
as an invitation to talk, not a widget.

**Why this priority**: This is the entire point of the feature. The current page
reads as competent; it has to read as premium, and it has to do so within the
first seconds, before anyone scrolls.

**Independent Test**: Show the page above the fold, then the full scroll, to
someone who has not seen it, for ten seconds. They describe it with words like
"clean", "premium", "deliberate" rather than "template" or "default".

**Acceptance Scenarios**:

1. **Given** a first visit on a desktop viewport, **When** the page loads,
   **Then** the hero is visible with the orb, the name and the positioning line,
   arriving as a short staged reveal, with no layout shift while the orb loads.
2. **Given** the same visit, **When** the visitor scrolls, **Then** each section
   arrives with restrained motion — opacity, a short rise — never a bounce or a
   parallax, and every section is fully readable with motion disabled.
3. **Given** a full-page screenshot, **When** compared with the current site,
   **Then** it is distinguishable at a glance by its palette (neutral, near-black,
   not warm charcoal), by an accent that appears in a handful of places rather
   than everywhere, and by a clearer typographic hierarchy.

---

### User Story 2 - The visitor learns what Joan has built and how he thinks (Priority: P2)

Past the hero, the visitor finds Joan's work laid out so that what is current is
immediately distinguishable from what is past, each project with what it is and
what he did on it, followed by a short account of how he approaches problems and
what he builds with — all of it drawn from what the repository already says about
him, none of it new.

**Why this priority**: Today most of this sits behind collapsed sections and a
three-paragraph hero. A premium page that says less than the old one is a
regression; the redesign has to reveal the story, not hide it better.

**Independent Test**: Without clicking anything, a reader can name Joan's active
projects and say one thing about how he works.

**Acceptance Scenarios**:

1. **Given** the work section, **When** it renders, **Then** active projects
   (Verelyn, Flare, Privé, Inception) are visually separated from past ones, and
   each shows name, tagline, period, description, tags, and a link when one exists.
2. **Given** the whole page, **When** every sentence is checked, **Then** each one
   traces to a line in `joan-kb.md`, `flare-product-kb.md`, `src/data/bio.json`
   or `src/data/projects.json`. Nothing is invented, rounded up, or paraphrased
   into a claim the sources do not make.
3. **Given** that `bio.json` and `joan-kb.md` disagree — `bio.json`'s third story
   paragraph still presents Flare and Stevay as the current work, while
   `joan-kb.md` names Verelyn as where most of the time goes and Stevay as stopped
   — **When** content is prepared, **Then** `joan-kb.md` wins and `bio.json` is
   corrected to match it. This is a fix to a stale copy, not new content.

---

### User Story 3 - The visitor talks to the orb or reaches out (Priority: P3)

The visitor taps the orb and a voice conversation starts. Or they reach the
footer and open a social profile or copy the email address.

**Why this priority**: These already work. The redesign must carry them through
intact; they are listed so nobody treats them as optional polish.

**Independent Test**: Tap the orb; a session starts. Copy the email; the label
confirms. Open `/chess`; it is exactly as before.

**Acceptance Scenarios**:

1. **Given** the hero, **When** the orb is tapped, **Then** the voice session
   starts as it does today. **Given** the voice service fails to load, **Then**
   the page still renders, the orb's placeholder is shown in its place, and
   nothing else on the page depends on it.
2. **Given** the footer, **When** the visitor copies the email, **Then** the label
   confirms for a moment and reverts; without clipboard access, a mail link opens.
3. **Given** `/chess` and the blog, **When** visited after this feature, **Then**
   their code and behavior are unchanged and they read correctly on the new base.

---

### Edge Cases

- The visitor's system has motion reduced: every section is visible on load and
  no content depends on an entrance animation having run.
- The voice service is blocked or slow: the orb placeholder holds its space, so
  the name and text below do not jump.
- A project logo fails to load: the initial-letter fallback that exists today
  keeps working.
- A 320px-wide viewport: single column throughout, tap targets at least 44px,
  nothing clipped.
- JavaScript disabled: all text content is visible and readable.
- A long project description: the layout holds without truncating away meaning.
- A visitor with high-contrast needs: text on the new near-black surfaces stays
  legible; the accent is never the only carrier of meaning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home page MUST move to a neutral, near-black palette with
  restrained opaque borders and muted secondary text, in the spirit of Linear and
  Vercel, replacing the warm charcoal base that the site uses today.
- **FR-002**: An accent color MUST be used sparingly — as a detail on a few
  elements, never as a wash or a gradient across surfaces. The accent is the
  existing amber, kept as the single chromatic accent inside the neutral palette.
  It preserves continuity with the orb's glow, and it is what keeps the page
  Joan's rather than a Linear clone.
- **FR-003**: Typography MUST establish a clear hierarchy between the name, the
  positioning line, section labels, body and metadata. Body, labels and metadata
  move to a neutral grotesque of the kind Linear and Vercel use; Space Grotesk is
  kept for the name only, as a signature — the one place the site's original
  voice stays in the letterforms.
- **FR-004**: The page MUST surface more of Joan's story than today, drawn only
  from existing sources: a fuller hero story, an expanded work section, and two
  sections that do not exist on the page today, both taken from `joan-kb.md` —
  "How I think" and "What I build with". Reading, chess and the Messi story stay
  as they are today, collapsed.
- **FR-005**: The voice orb MUST remain the signature element, in the hero, above
  the name, at its current size unless design work finds a reason to change it
  and records that reason.
- **FR-006**: The work section MUST distinguish active projects from past ones and
  MUST show, for each, the name, tagline, period, description, tags and the link
  when one exists, exactly as they appear in `src/data/projects.json`.
- **FR-007**: Every piece of copy on the page MUST trace to `joan-kb.md`,
  `flare-product-kb.md`, `src/data/bio.json` or `src/data/projects.json`. Where
  those sources conflict, `joan-kb.md` is the source of truth and the other file
  is corrected to match. No claim, number, or date may be introduced that is not
  already in one of them.
- **FR-008**: Motion MUST be purposeful and visible. The page MUST move in ways a
  visitor notices: a kinetic hero entrance, a hero that responds to scroll, section
  reveals, cursor-tracked highlights on the project panels, a timeline that draws
  itself as it is scrolled, a stack marquee, and tactile hover on buttons. Each
  animation MUST be able to state its reason in one sentence (hierarchy, story,
  feedback, or state). No bounce, no background parallax, no motion that exists
  only because it could. All of it MUST respect the visitor's reduced-motion
  preference and collapse to a static page. *(Amended after Joan's review of the
  first preview.)*
- **FR-009**: `DESIGN.md` MUST be amended wherever the new direction contradicts
  its current text — at minimum the aesthetic direction ("Warm, not cold"), the
  palette table, the orb glow, and any rule that names amber — so that the
  document remains binding and true after the change. The chess board tokens
  stay, since they are scoped to `/chess`.
- **FR-010**: The feature MUST NOT edit `/chess`, the blog, the generated link
  preview images, or the behavior of the voice orb. `/chess` and the blog inherit the
  site-wide tokens (they read the same `--background`, `--foreground` and `--border`
  as the home page, and scoping a second palette would split the site into two looks),
  so they will look different on the new base; their code, and the chess board's own
  tokens, do not change. *(Amended during planning; see plan.md and research.md §8.)*
- **FR-011**: The page MUST remain accessible: tap targets of at least 44px,
  visible focus states, text contrast meeting WCAG AA on every text/background
  pair in the new palette, and all content visible without JavaScript.
- **FR-012**: The prototype MUST be viewable from a preview deployment of the
  feature branch so it can be compared with the live site side by side before
  anything is merged.

### Key Entities *(include if feature involves data)*

- **Project**: a thing Joan built or is building — name, tagline, description,
  status (active or inactive), period, logo, link, tags. Nine exist today in
  `src/data/projects.json`; four are active.
- **Bio**: name, positioning line, story paragraphs, chess note, reading note and
  favorite books, in `src/data/bio.json`. Subordinate to `joan-kb.md` where they
  disagree.
- **Knowledge base**: `joan-kb.md`, the single document about who Joan is (his
  journey, what he is building, how he thinks, what he builds with, what he reads
  and why, hobbies), and `flare-product-kb.md` about Flare. These are the source of
  truth for any content the page adds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a ten-second first-impression test with people who have not seen
  the site, at least 8 of 10 describe it with a word in the family of "premium",
  "clean" or "deliberate", and none with "template" or "default".
- **SC-002**: Without clicking anything, 5 of 5 readers can name the active
  projects and state one thing about how Joan works.
- **SC-003**: A content audit maps every sentence on the page to a source line;
  zero sentences are unsourced.
- **SC-004**: With motion reduced at the system level, every section is fully
  visible on load; zero content requires an animation to have played.
- **SC-005**: Every text/background pair in the new palette passes WCAG AA when
  measured, not estimated.
- **SC-006**: No file under `src/app/chess`, `src/components/chess`, `src/lib/chess`
  or `src/app/blog` changes, the `--chess-*` tokens are byte-identical, and a browser
  check of `/chess` on the new base shows every piece legible on both square colors at
  the rendered size and every text/background pair readable. *(Amended during
  planning.)*
- **SC-007**: The hero has no visible layout shift while the orb goes from
  placeholder to loaded.

## Assumptions

- "Prototype" means the real home page rewritten on the feature branch and seen
  through its preview deployment — not a second route living beside the current
  page. The live site does not change until the branch is merged.
- The site stays dark-only.
- The orb stays where it is, above the name, at its current size; the hero keeps
  its centered composition unless design work argues otherwise and the reason is
  recorded in `DESIGN.md`.
- `/chess` keeps its warm-wood board tokens and is not edited. It inherits the new
  site-wide base, which is the one visible consequence of this feature outside the home
  page; it is checked in the browser rather than pretended away.
- The writing section keeps its one existing post. No new writing is produced.
- The footer keeps its current line and links.
- The 640px reading measure remains the default. If the design work widens the
  hero or the work section, the new measure and its reason go in `DESIGN.md`.
- `bio.json` is corrected to agree with `joan-kb.md`; `joan-kb.md` itself does not
  change, so the voice agent's knowledge base does not need re-uploading.
