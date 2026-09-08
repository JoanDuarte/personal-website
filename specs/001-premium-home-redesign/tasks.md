---

description: "Task list for the premium home page redesign"
---

# Tasks: Premium Home Page Redesign

**Input**: Design documents from `/specs/001-premium-home-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tokens.md, contracts/ui-sections.md, quickstart.md

**Tests**: No test framework exists and none was requested. The gates are `bun run check`, `bun run design:contrast`, `bun run chess:verify`, `bun run build`, and the browser drive in quickstart.md (Principle II). Tasks that run those are listed explicitly.

**Organization**: Grouped by user story from spec.md. US1 delivers the new look on the existing content; US2 replaces and adds content; US3 verifies what must survive.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3 from spec.md
- File paths are exact and relative to the repository root

## Path Conventions

Single Next.js project: `src/app/`, `src/components/`, `src/lib/`, `src/data/`, `scripts/`, with `DESIGN.md` and `joan-kb.md` at the root.

---

## Phase 1: Setup

**Purpose**: The four shadcn components, the new script, and knip's view of it.

- [X] T001 Add the shadcn base-nova components with `bunx shadcn@latest add card badge accordion separator` and confirm they land in `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/accordion.tsx`, `src/components/ui/separator.tsx`; do not accept any change to `src/components/ui/button.tsx`
- [X] T002 [P] Widen the knip entry glob from `scripts/chess/*.ts` to `scripts/**/*.ts` in `knip.jsonc` (keep the comment; update its wording to say "verification and design scripts")
- [X] T003 [P] Add `"design:contrast": "bun run scripts/design/check-contrast.ts"` to the scripts block in `package.json`, after `knip`

---

## Phase 2: Foundational

**Purpose**: Tokens, fonts, motion provider and the contrast gate. Every story renders on top of these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Replace the warm `:root` token values in `src/app/globals.css` with the set in `specs/001-premium-home-redesign/contracts/tokens.md` (background, surface, muted, border, border-hover, input, foreground, muted-foreground, text-secondary, text-tertiary, ring, orb-glow, orb-glow-active, primary-foreground; shadcn aliases point at surface/foreground); leave `--primary`, `--destructive`, `--radius` and every `--chess-*` token byte-identical
- [X] T005 In the `@theme inline` block of `src/app/globals.css`, set `--font-sans: var(--font-geist)`, add `--font-display: var(--font-space-grotesk)`, keep `--font-mono: var(--font-geist-mono)`, and remove `--font-heading`
- [X] T006 Replace the `body::after` warm radial in `src/app/globals.css` with a faint amber radial at `50% 0%` using `oklch(0.837 0.128 66.29 / 0.10)` fading to transparent by 55%, keeping `gradient-breathe` but with opacity between 0.4 and 0.7; leave `body::before` (grain) as is
- [X] T007 Add a `[data-reveal]` no-JavaScript rule to `src/app/globals.css` (documented as the fallback for Motion's server-rendered `opacity: 0`), and keep the existing `prefers-reduced-motion` block
- [X] T008 In `src/app/layout.tsx`, load `Geist` (weights 400, 500, variable `--font-geist`), `Geist_Mono` (400, `--font-geist-mono`) and `Space_Grotesk` (600 only, `--font-space-grotesk`) from `next/font/google`; put all three variables on `<html>`; add `<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>` inside `<head>`; correct the metadata `description` to "Currently building Verelyn, Flare and Privé."
- [X] T009 [P] Create `src/components/motion/motion-provider.tsx` as a `"use client"` component that wraps children in `<MotionConfig reducedMotion="user">` from `motion/react`, and use it around `{children}` in `src/app/layout.tsx`
- [X] T010 [P] Create `scripts/design/check-contrast.ts`: parse the `:root` block of `src/app/globals.css`, convert each oklch token (including the `/ alpha` form, composited over `--background`) to sRGB, compute WCAG relative luminance and contrast, print the pairs table from `contracts/tokens.md` with a PASS/FAIL per row against its minimum, and exit 1 on any failure; comment the conversion steps
- [X] T011 Run `bun run design:contrast` and adjust any token in `src/app/globals.css` that falls under its minimum (change lightness only, keep chroma and hue); record the final ratios in `specs/001-premium-home-redesign/quickstart.md` under "Expected from design:contrast"
- [X] T012 Run `bun run check` and `bun run build`; confirm `/` still prints as `○ (Static)` and both exit 0

**Checkpoint**: The site renders on the new base with Geist, nothing else changed yet. Open `http://localhost:3000` once to see it.

---

## Phase 3: User Story 1 - A first-time visitor reads quality at a glance (Priority: P1) 🎯 MVP

**Goal**: The new look and the motion budget on the page as it exists today: hero with staged entrance, every section revealing once, panels and links with hover states.

**Independent Test**: Ten-second first-impression test on the running page (quickstart.md steps 1 to 7). Reduced motion shows everything at once; JavaScript off shows everything.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create `src/components/motion/reveal.tsx`: `"use client"`, `motion.div` with `initial={{ opacity: 0, y: 8 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.2 }}`, `transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}`, `data-reveal` on the element, `className` passthrough, `as` limited to `div`/`section`
- [X] T014 [P] [US1] Create `src/components/motion/stagger.tsx`: `"use client"`, a `Stagger` parent with `variants` (`hidden`/`show`, `staggerChildren: 0.08`) and a `StaggerItem` child that rises 8px and fades over 0.5s with the same ease; both carry `data-reveal`
- [X] T015 [US1] Rewrite `src/components/sections/hero.tsx`: `min-h-[70dvh]`, centered, `pt-24` max; `Stagger` around three `StaggerItem`s in order: the orb (unchanged dynamic import, `OrbSkeleton`, `ErrorBoundary`), the `h1` in `font-display font-semibold text-[34px] md:text-[48px] tracking-[-0.03em] leading-[1.05]`, the positioning line in `text-[17px] md:text-[20px] text-foreground/90 max-w-[520px] text-balance`; move the `bio.story` paragraphs out of the hero (they return in T025)
- [X] T016 [US1] Update `src/app/page.tsx` to wrap `Work`, `BeyondCode`, `Writing` each in `<Reveal>` and add `<Footer />` unwrapped, keeping the `#work` anchor on the Work wrapper
- [X] T017 [US1] Replace the uppercase-tracking section label in `src/components/sections/work.tsx` (`text-[12px] font-medium uppercase tracking-[0.2em]`) with an `h2` in `text-[24px] md:text-[28px] font-medium tracking-[-0.02em]`; change the section padding to `py-20 md:py-28`; change project row hover from `transition-opacity` to `transition-[border-color,transform] duration-200`; leave the row structure alone (it is rewritten in T027)
- [X] T018 [US1] In `src/components/sections/collapsible-section.tsx`, replace the uppercase-tracking trigger label with `text-[13px] font-medium text-text-tertiary` sentence case, and `transition-all` with `transition-[grid-template-rows,opacity]` (this file is deleted in T030; the change keeps US1 testable on its own)
- [X] T019 [US1] In `src/components/sections/footer.tsx`, set the contact line to `text-muted-foreground`, the copyright to `text-text-tertiary`, icon hover to `hover:text-foreground`, and add `focus-visible:ring-2 focus-visible:ring-ring rounded-sm` to each link; `src/components/copy-email-button.tsx` gets the same focus classes and `active:scale-[0.98]`
- [X] T020 [US1] Run `bun dev` and drive quickstart.md steps 1, 2, 3, 4, 5 and 7 at `http://localhost:3000`; fix anything that fails before moving on (Principle II)

**Checkpoint**: The page reads as the new site with the old content. Stop here for a first look if wanted.

---

## Phase 4: User Story 2 - The visitor learns what Joan has built and how he thinks (Priority: P2)

**Goal**: Corrected story under the hero, active projects as a 2x2 panel grid with the past list below, and the two new knowledge-base sections. Every string traceable.

**Independent Test**: Without clicking, name the four active projects and one thing about how Joan works. Content audit in quickstart.md maps every sentence to a source.

### Implementation for User Story 2

- [X] T021 [P] [US2] Create `src/lib/kb.ts` per `data-model.md`: read `joan-kb.md` from `process.cwd()` with `node:fs`, split on `## ` headings, export `getKbSections(): KbSections` returning `howIThink` (paragraphs under "How I Think"), `buildsWithIntro` and `buildsWith` (bullets under "Technical Identity" split on the first `:` with `**` stripped from the label); throw `Error("joan-kb.md: missing heading \"<name>\"")` when a heading is absent; no `"use client"`
- [X] T022 [P] [US2] Correct `story[2]` in `src/data/bio.json` to: "Today most of my time goes to Verelyn, a newsroom built around one reader. Flare, my social brain, is live on iOS. Privé lets creators sell and get paid without leaving Telegram. Different problems, same bet: software should act before you ask it to."
- [X] T023 [P] [US2] Customize the shadcn output: in `src/components/ui/card.tsx` make the root `bg-surface border border-border rounded-[var(--radius)] transition-[border-color,transform] duration-200 hover:border-border-hover hover:-translate-y-px`; in `src/components/ui/badge.tsx` add an `active` variant (`bg-primary/10 text-primary`) and a `past` variant (`bg-muted text-text-tertiary`), both `rounded-full text-[11px] font-medium px-2 py-0.5`, no uppercase
- [X] T024 [P] [US2] Customize `src/components/ui/accordion.tsx`: trigger in `text-[13px] font-medium text-text-tertiary` sentence case with `py-4` and the chevron from `lucide-react`; item `border-t border-border`; content `pb-6`
- [X] T025 [US2] Create `src/components/sections/story.tsx`: server component, `max-w-[640px]`, the three `bio.story` paragraphs in `text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground`, `py-12 md:py-16`; add it to `src/app/page.tsx` directly after `Hero`, wrapped in `<Reveal>`
- [X] T026 [US2] Create `src/components/sections/how-i-think.tsx`: server component calling `getKbSections()`, `h2` "How I think" in the T017 heading style, paragraphs verbatim in the story text style, `max-w-[640px]`, `py-20 md:py-28`
- [X] T027 [US2] Rewrite `src/components/sections/work.tsx` per `contracts/ui-sections.md`: `h2` "Work"; `h3` "Active" then a `grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[960px]` of `Card`s for `status === "active"` (logo with the existing initial fallback, name, `Badge variant="active"`, tagline, period and tags in `font-mono text-[12px] text-text-tertiary`, full description, link as `underline underline-offset-4 hover:text-primary`); `h3` "Past" then a `max-w-[640px]` list of `status === "inactive"` rows (name, tagline, period) using `Accordion` for the description and link, with a single `Separator` between the two groups; no per-row hairlines
- [X] T028 [US2] Create `src/components/sections/builds-with.tsx`: server component, `h2` "What I build with", `buildsWithIntro` verbatim, then a `grid grid-cols-1 md:grid-cols-[160px_1fr] gap-x-8 gap-y-4 max-w-[760px]` of label (`font-mono text-[12px] text-text-tertiary`) and value (`text-[15px] text-muted-foreground leading-[1.6]`) pairs
- [X] T029 [US2] Rewrite `src/components/sections/beyond-code.tsx` and `src/components/sections/writing.tsx` to use `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` with the existing content unchanged; triggers "Beyond code" and "Writing"
- [X] T030 [US2] Delete `src/components/sections/collapsible-section.tsx` and update `src/app/page.tsx` to the final order: `Hero`, `Reveal(Story)`, `Reveal(Work)` with `#work`, `Reveal(HowIThink)`, `Reveal(BuildsWith)`, `Reveal(BeyondCode)`, `Reveal(Writing)`, `Footer`
- [X] T031 [US2] Run `bun run check` and `bun run build`; confirm `/` is still `○ (Static)` and that a deliberately misspelled heading in `src/lib/kb.ts` fails the build with the heading name in the message, then restore it
- [X] T032 [US2] Drive quickstart.md steps 1, 2, 3 and 6 again, then do the content audit: every rendered string maps to a row in the `data-model.md` origins table; the metadata `description` and `story[2]` name Verelyn, Flare and Privé

**Checkpoint**: A reader can name the active projects and one thing about how Joan works without clicking.

---

## Phase 5: User Story 3 - The visitor talks to the orb or reaches out (Priority: P3)

**Goal**: What already worked still works, and the pages that were not edited read correctly on the new base.

**Independent Test**: Tap the orb; copy the email; open `/chess` and the blog post.

### Implementation for User Story 3

- [X] T033 [US3] Confirm with `git diff --stat` that nothing under `src/components/voice-orb.tsx`, `src/components/ui/orb.tsx`, `src/app/chess/`, `src/components/chess/`, `src/lib/chess/`, `src/app/blog/`, `src/app/og-card.tsx`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`, `src/app/apple-icon.tsx` changed, and that the `--chess-*` lines in `src/app/globals.css` are byte-identical to `main`
- [X] T034 [US3] Run `bun run chess:verify` (globals.css is shared) and confirm exit 0
- [X] T035 [US3] Drive quickstart.md steps 8, 9 and 10: tap the orb (session starts, or the placeholder holds), copy the email (label confirms and reverts), open `/chess` (pieces legible on both square colors at rendered size, panels readable on the new base), open `/blog/building-with-conviction`

**Checkpoint**: All three stories hold on the running site.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: The binding document, the gates, and the preview.

- [X] T036 Amend `DESIGN.md` per `research.md` §10: Aesthetic Direction, the palette table (values from `contracts/tokens.md`, amber row unchanged), Typography (Geist / Space Grotesk 600 for the name / Geist Mono; new scale), section headings replacing the uppercase label rule, Spacing (`py-20 md:py-28`; 640px prose, 960px project grid), Layout (hero `min-h-[70dvh]`), Motion Budget (Motion stagger and once-only reveal with the no-JS rule; chevron line removed), Background (faint amber radial at `50% 0%`), "What This Site Is NOT" (+ eyebrows, + em-dashes as design), and a one-line note under Chess Board Tokens that the board now sits on a neutral base; each changed rule keeps or gains its reason
- [X] T037 [P] Update the architecture list in `README.md`: add `src/components/motion/`, `src/lib/kb.ts`, `src/components/sections/story.tsx`, `how-i-think.tsx`, `builds-with.tsx`; remove `collapsible-section`; one sentence on the build-time KB read and why
- [X] T038 Run every gate in quickstart.md: `bun run check`, `bun run design:contrast`, `bun run chess:verify`, `bun run build`; all exit 0
- [X] T039 Run the full browser drive in quickstart.md (steps 1 to 10) one final time on the finished page, including the accent count (exactly five places) and the eyebrow count (zero). Done in the Orca browser: at rest the only amber on the page is the orb pill and the four Active badges (the other three uses are hover, focus and the two gradients); eyebrows 0; 390px measured (no overflow, grids collapse to one column); reduced motion emulated (everything visible on load); /chess board at 51px squares legible on the neutral base; blog reads; orb starts a session; copy email fell through to its mailto: fallback because the embedded browser has no clipboard, which is the designed degradation.
- [X] T040 Push the branch and open the Vercel preview next to `https://joanduarte.vercel.app` for the side-by-side. Committed as f5fe9c2 and pushed; the preview is the `001-premium-home-redesign` branch deployment on Vercel. The commit itself was deliberate, not an auto-commit hook: a preview needs a push and a push needs a commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none; T002 and T003 in parallel with T001
- **Foundational (Phase 2)**: after Setup; T009 and T010 in parallel with T004 to T008; T011 after T010 and T004; T012 last
- **US1 (Phase 3)**: after Foundational; T013 and T014 in parallel, then T015 to T019, then T020
- **US2 (Phase 4)**: after US1 (it replaces sections US1 restyled); T021 to T024 in parallel, then T025 to T030 in order (T027 and T028 need T023/T024 and T021), then T031, T032
- **US3 (Phase 5)**: after US2; T033 and T034 in parallel, then T035
- **Polish (Phase 6)**: after US3; T036 and T037 in parallel, then T038, T039, T040

### User Story Dependencies

- **US1**: independent once Foundational is done; testable with today's content
- **US2**: builds on US1's `Reveal`/`Stagger` and the restyled heading; independently testable by the content audit
- **US3**: verification only; depends on both

### Parallel Opportunities

- Phase 1: T002 ∥ T003 ∥ T001
- Phase 2: T009 ∥ T010 ∥ (T004 → T005 → T006 → T007 → T008)
- Phase 3: T013 ∥ T014
- Phase 4: T021 ∥ T022 ∥ T023 ∥ T024
- Phase 5: T033 ∥ T034
- Phase 6: T036 ∥ T037

---

## Parallel Example: User Story 2

```bash
# All four can start together; none touches another's file:
Task: "Create src/lib/kb.ts"
Task: "Correct story[2] in src/data/bio.json"
Task: "Customize src/components/ui/card.tsx and badge.tsx"
Task: "Customize src/components/ui/accordion.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 and Phase 2: tokens, fonts, provider, contrast gate
2. Phase 3: the new look on the existing content, with motion
3. Stop at the checkpoint: open the page. If the direction is wrong, this is the cheap moment to change it

### Incremental Delivery

1. US1 → first look, Vercel preview if wanted
2. US2 → content in place; content audit
3. US3 → nothing broke
4. Polish → DESIGN.md true again, gates green, preview

---

## Notes

- Every color through a token. Every animation with a reason. No `transition-all`.
- Zero uppercase-tracking eyebrows. Zero em-dashes in anything designed; quoted KB text keeps its punctuation.
- Amber in five places: orb glow, Active badge, link/button hover, focus ring, top radial.
- Do not edit `joan-kb.md`; `kb:upload` is not needed.
- Commits are Joan's; do not run `/speckit-git-commit` unless asked.
