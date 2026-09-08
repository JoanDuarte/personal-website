# Implementation Plan: Premium Home Page Redesign

**Branch**: `001-premium-home-redesign` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-premium-home-redesign/spec.md`

## Summary

Rebuild the home page's look on a neutral near-black token set, keeping the existing
amber as the only chromatic accent and spending it in five places. Geist for all text,
Space Grotesk for the name only, Geist Mono for metadata. shadcn base-nova panels,
badges and an accordion, customized through the tokens. Motion for a staged hero
entrance and once-only section reveals, with reduced-motion and no-JavaScript paths
that show everything. Surface more of the knowledge base: a corrected story, the four
active projects as a 2x2 panel grid with the five past ones as a compact list, and two
new sections ("How I think", "What I build with") read from `joan-kb.md` at build time
so there is still one source for who Joan is. `DESIGN.md` is amended to match. `/chess`
is untouched in code and inherits the global tokens, which is a deliberate deviation
from the spec's "identical render" wording, recorded below and in `research.md`.

## Design Read

Following the `design-taste-frontend` skill's protocol, with `DESIGN.md` winning any
disagreement:

> Reading this as: a founder's personal site for investors, accelerator reviewers and
> people Joan meets, with a Linear/Vercel minimalist-premium language, leaning toward
> Tailwind v4 tokens + shadcn base-nova (customized, never default) + Geist + Motion at
> low intensity. Redesign mode: overhaul on visuals, preserve content, routes, anchors,
> the orb and the copy voice.

Dials: `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 3`. Variance is
capped by DESIGN.md's centered hero; motion by its "every animation earns its place";
density is the one place the current DESIGN.md ("compact, py-8 to py-16") is amended,
because the brief asks for generous, disciplined spacing and that is most of what
"premium" is made of.

Where the skill and DESIGN.md disagree, DESIGN.md wins: centered hero with the orb
above the name (the skill's anti-center bias), dark-only (the skill's dual-mode rule),
lucide-react (already a dependency; the skill allows it then), and the site's own accent.
The full list, with what was taken from the skill, is in `research.md` §4.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.2 App Router on Turbopack

**Primary Dependencies**: Tailwind CSS v4 with `@theme inline` tokens; shadcn base-nova on
`@base-ui/react` (`button` and `orb` exist; add `card`, `badge`, `accordion`, `separator`);
`motion` 13.2 imported from `motion/react` (installed, unused until now); `next/font/google`
for Geist, Geist Mono and Space Grotesk; `lucide-react` (existing); `@elevenlabs/client`
(orb, unchanged)

**Storage**: none. Content is `src/data/bio.json`, `src/data/projects.json`, and
`joan-kb.md` read from disk at build time for the two new sections

**Testing**: `bun run check` (eslint, tsc, knip); `bun run chess:verify`; `bun run build`;
a new `scripts/design/check-contrast.ts` that measures the WCAG ratio of every
text/background token pair (Principle I: measured, not estimated); a browser drive of `/`
and `/chess` at 1440px and 390px, with reduced motion on and off, and with JavaScript
disabled (Principle II)

**Target Platform**: Vercel; `/` prerendered static; modern desktop browsers and iOS Safari

**Project Type**: web app, single Next.js project

**Performance Goals**: hero LCP under 2.5s; CLS near zero while the orb goes from
placeholder to loaded; reveals animate only `transform` and `opacity`

**Constraints**: dark-only; every color from an oklch token; no COOP/COEP headers; every
sentence traceable to a source; no edits under `src/app/chess`, `src/components/chess`,
`src/lib/chess`, `src/app/blog`, or the metadata image routes

**Scale/Scope**: one page, seven sections, nine projects, two new content sections, one
design-document amendment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan satisfies it | Status |
|---|---|---|
| I. Measured, Not Asserted | Contrast is measured by `scripts/design/check-contrast.ts` over every token pair (SC-005), not eyeballed. Chess baselines are not touched. `bun run chess:verify` runs even though `src/lib/chess` is not edited, because `globals.css` is shared. | PASS |
| II. Drive the Real Thing Before Believing It | The task list ends with a browser drive of `/` (1440 and 390, reduced motion on/off, JS off) and of `/chess`, before the work is called done. Types and lint are not the evidence. | PASS |
| III. An Enhancement Never Becomes a Requirement | The orb keeps its dynamic import, skeleton and error boundary. Motion is used only for entrance and reveals; a `<noscript>` style forces every revealed element visible, so the page reads with JavaScript off. No cross-origin isolation is introduced. | PASS |
| IV. Tokens, Contrast, and a Motion Budget | All new colors are oklch tokens in `globals.css`; no `rgba`. Borders stay opaque. Motion budget: hero stagger, one reveal per section, hover states; nothing infinite except the existing background breathe and orb states. `MotionConfig reducedMotion="user"` plus the existing CSS media query. | PASS |
| V. One Document Per Subject, Decisions Carry Reasoning | The two new sections are read from `joan-kb.md` rather than copied into a second file that would drift the way `bio.json` did. `bio.json` is corrected, not duplicated. `DESIGN.md` is amended in place, with the reason for each change. | PASS |
| Technology constraints | Stack unchanged. `outputFileTracingIncludes` is not needed for `joan-kb.md` because `/` is prerendered at build; this is verified by checking the route stays `○ (Static)` in the build output. | PASS |
| Language constraint | `/chess` stays Spanish and is not edited. | PASS |

**Spec deviation, recorded here and flagged to Joan**: FR-010 and SC-006 say `/chess`
renders identically. It cannot, because `/chess` reads the same `--background`,
`--foreground`, `--border` tokens as the rest of the site; scoping the new palette to
the home page would leave the site with two looks and a fixed grain/gradient layer that
belongs to neither. The plan changes the global tokens, leaves every chess file untouched
(board tokens included), and adds a browser check of `/chess` on the new base. The spec
is amended to say exactly that (see `research.md` §8).

## Project Structure

### Documentation (this feature)

```text
specs/001-premium-home-redesign/
├── plan.md              # This file
├── research.md          # Phase 0: decisions with rationale and rejected alternatives
├── data-model.md        # Phase 1: Project, Bio, KB sections
├── quickstart.md        # Phase 1: how to validate the feature end to end
├── contracts/
│   ├── tokens.md        # the token set and the pairs the contrast script measures
│   └── ui-sections.md   # per-section contract: source, layout family, motion, mobile
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/app/
├── layout.tsx                 # fonts: Geist, Geist Mono, Space Grotesk 600; MotionConfig; metadata description corrected
├── globals.css                # new :root tokens, font variables, faint amber radial, reveal + noscript rules
└── page.tsx                   # section order

src/components/
├── motion/
│   ├── motion-provider.tsx    # "use client": <MotionConfig reducedMotion="user">
│   ├── reveal.tsx             # "use client": whileInView once, opacity + 8px rise, data-reveal for noscript
│   └── stagger.tsx            # "use client": hero children in sequence
├── sections/
│   ├── hero.tsx               # orb, name (Space Grotesk), positioning
│   ├── story.tsx              # NEW: bio.story, corrected, directly under the hero
│   ├── work.tsx               # REWRITTEN: active 2x2 panel grid + past compact list
│   ├── how-i-think.tsx        # NEW: prose from joan-kb.md "How I Think"
│   ├── builds-with.tsx        # NEW: definition grid from joan-kb.md "Technical Identity"
│   ├── beyond-code.tsx        # accordion instead of the hand-rolled collapsible
│   ├── writing.tsx            # accordion
│   ├── footer.tsx             # content unchanged, tokens applied
│   └── collapsible-section.tsx  # REMOVED once beyond-code and writing use the accordion
└── ui/
    ├── button.tsx             # exists
    ├── card.tsx               # shadcn add, customized through tokens
    ├── badge.tsx              # shadcn add
    ├── accordion.tsx          # shadcn add
    └── separator.tsx          # shadcn add

src/lib/kb.ts                  # NEW: reads joan-kb.md at build time; throws if a heading is missing
src/data/bio.json              # story[2] corrected to agree with joan-kb.md

scripts/design/check-contrast.ts   # NEW: WCAG ratio for every token pair
knip.jsonc                     # entry widened to scripts/**/*.ts
package.json                   # design:contrast script
DESIGN.md                      # amended (see research.md §10)
```

**Structure Decision**: single Next.js project, existing layout. New client-only leaves
under `src/components/motion/` so Server Components keep rendering the static layout and
only the animated wrappers carry `"use client"`. Chess, blog and metadata routes are not
in the tree above because they are not touched.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `src/lib/kb.ts` reads a markdown file at build time instead of importing JSON | Two new sections need text that lives in `joan-kb.md`; a second copy would be a second document about Joan | Copying the paragraphs into `src/data/about.json` is simpler, and it is exactly how `bio.json` drifted (it still names Stevay as current). Principle V names that failure. The reader is ~30 lines and fails the build loudly if a heading moves. |
| `scripts/design/check-contrast.ts` | SC-005 says contrast is measured, and Principle I says numbers come from scripts | Reading values off a contrast website is faster once and worthless the next time a token changes. |
