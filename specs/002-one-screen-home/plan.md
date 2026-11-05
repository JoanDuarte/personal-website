# Implementation Plan: One-Screen Home

**Branch**: `002-one-screen-home` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-one-screen-home/spec.md`

## Summary

Replace the nine-section home page with one screen: a centered header (the
ElevenLabs orb at 56px with a state label, the name, one line), five dated fact
rows with links from `projects.json`, and three social links, all in Geist Mono
over a faint wireframe grid rendered with the three.js stack the orb already
ships. The grid loops seamlessly, follows the pointer a little, and ripples with
the orb's output volume. Elements stagger in with `motion`. Everything that
nothing renders any more is deleted, and the documents that describe the page
(`DESIGN.md`, the constitution, README, AGENTS) are rewritten to match. The
approach is the mockup at `mockup.html`, rebuilt in the app's own components.

## Technical Context

**Language/Version**: TypeScript strict, React 19, Next.js 16 App Router on Turbopack

**Primary Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei` (already
present, used by `src/components/ui/orb.tsx`); `motion` from `motion/react`
(present, first use); `@elevenlabs/client` (present). No dependency is added.
`lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `shadcn`,
`@base-ui/react` and `tw-animate-css` are expected to lose their last caller on
the home page; `/chess` does not import any of them, so knip decides which go.

**Storage**: none. `src/data/projects.json` is read at build time; `bio.json`
shrinks to the fields the page still renders.

**Testing**: `bun run check` (eslint, tsc, knip), `bun run build`,
`bun run design:contrast` with its pair list updated, and a browser pass at the
three viewports in the spec through Orca's browser, recorded as screenshots.

**Target Platform**: Vercel, Node runtime, evergreen browsers; WebGL optional.

**Project Type**: Next.js web app, single route changed.

**Performance Goals**: grid at 60fps on an M-series laptop with one 80×80 plane
(6,561 vertices updated on the CPU per frame, as the mockup does); first paint
unchanged by the canvas, which mounts client-side after hydration.

**Constraints**: no scroll at 1440×900, 1280×720, 390×844; `prefers-reduced-motion`
freezes grid and entrance; the page must read identically without WebGL and
without the voice service; no COOP/COEP; tokens only, opaque borders.

**Scale/Scope**: one page, ~6 new or rewritten source files, ~25 deleted files,
5 documents rewritten.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Measured, not asserted.** The palette change is gated by
`scripts/design/check-contrast.ts`; its pair list is rewritten for the new
tokens (see `contracts/tokens.md`) and the numbers go in the PR. "Fits one
viewport" is measured by `document.documentElement.scrollHeight <= innerHeight`
at the three sizes, run from the browser and recorded. Pass.

**II. Drive the real thing.** The page is driven in Orca's browser at the three
viewports, the orb is clicked with a live microphone, and the grid is watched
for a minute. `quickstart.md` is the script. Pass.

**III. An enhancement never becomes a requirement.** The grid mounts only when
`WebGLRenderingContext` exists and is wrapped in the existing `ErrorBoundary`
with a null fallback; the page's layout does not depend on it (the canvas is
`position: fixed; z-index: -1`). The orb keeps its dynamic import, skeleton and
error boundary; the label under it is rendered by the page, not the orb, so it
shows "Talk to me" even if the orb's module never arrives. No COOP/COEP. Pass.

**IV. Tokens, contrast, motion budget.** Three new tokens at most (none if the
existing greys suffice); the amber stays as `--primary`. The grid's line color
and the vignette are derived from tokens via CSS variables read at mount, not
literals. Motion: entrance (opacity, y), grid (slide, wave, parallax, ripple),
orb. All three honor reduced motion; `MotionConfig reducedMotion="user"` covers
the entrance, `useReducedMotion` gates the grid. Animated properties are named.
The "What This Site Is NOT" list is rewritten in `DESIGN.md` and the
constitution's references to the old list are amended through
`/speckit-constitution`. Pass, with the amendment as a task.

**V. One document per subject, decisions carry reasoning.** `DESIGN.md` is
rewritten in place; no second design doc. `CHANGELOG.md` 1.0.0 entry says what
went and why. The spec's opening section carries the reasoning already. Pass.

**Technology and content constraints.** English only: yes. Measure: the 640px
rule is replaced by "one column of 560px, no breakout" in the amendment.
Metadata routes: the OG card drops the Messi photo and Space Grotesk, reads a
Geist Mono TTF off disk, and `outputFileTracingIncludes` is updated. Pass.

**Quality gates.** `bun run check`, `bun run build`, browser pass, contrast run.
Pass.

**Interaction with the unmerged branch.** `joanduarte-com-and-retire-chess` (3
commits on top of an older `main`) touches `globals.css`, `AGENTS.md`,
`README.md`, `CHANGELOG.md`, `VERSION`, `knip.jsonc` and the constitution. This
feature touches all of them. Recommendation: merge that branch first (rebase it
onto `main`, open its PR), then rebase this one. If it ships second, the
conflicts are in prose and in `globals.css`'s `--chess-*` block, which this
feature leaves untouched precisely so the removal stays a one-sided diff.

## Project Structure

### Documentation (this feature)

```text
specs/002-one-screen-home/
├── plan.md              # This file
├── spec.md
├── mockup.html          # The approved throwaway prototype, visual reference only
├── research.md          # Phase 0: decisions with alternatives
├── data-model.md        # Phase 1: fact rows, project lookup, session state
├── quickstart.md        # Phase 1: how to verify in a browser
├── contracts/
│   ├── tokens.md        # The palette and the contrast pairs the script checks
│   └── page.md          # What the page shows, in what state, with what label
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/app/
├── page.tsx                 # Server component: renders <Home />
├── layout.tsx               # Geist Mono only; metadata updated; MotionProvider kept
├── globals.css              # Trimmed tokens; grain kept; amber radial, marquee,
│                            #   fade-in-up, orb keyframes removed; --chess-* kept
├── og-card.tsx              # Text-only dark card in Geist Mono
├── opengraph-image.tsx      # alt text updated
├── twitter-image.tsx
├── apple-icon.tsx           # unchanged
└── fonts/GeistMono-Regular.ttf   # replaces SpaceGrotesk-SemiBold.ttf (OG card only)

src/components/
├── home.tsx                 # "use client": owns session status + output-volume ref,
│                            #   renders GridBackground, VoiceOrb, the text, the entrance
├── grid-background.tsx      # "use client": R3F Canvas, wireframe plane, loop, parallax,
│                            #   ripple from a ref; null without WebGL / inside ErrorBoundary
├── voice-orb.tsx            # Rewritten: 56px orb as a <button>, reports status and
│                            #   exposes getOutputVolume; no pill, no avatar, no copy
├── facts.tsx                # The five rows; links resolved from projects.json
├── error-boundary.tsx       # kept
├── motion/motion-provider.tsx   # kept
└── ui/orb.tsx               # kept (ElevenLabs renderer)

src/data/
├── projects.json            # unchanged shape; `logo` and `tags` may stay (knip ignores JSON fields)
└── bio.json                 # name + positioning only

src/lib/utils.ts             # kept only if something still imports cn()

scripts/design/check-contrast.ts   # pair list rewritten

Deleted: src/components/sections/* (10), src/components/motion/{aurora,kinetic-text,
magnetic,reveal,scroll-progress,spotlight-card,stagger,timeline-frame}.tsx,
src/components/{copy-email-button,project-link}.tsx, src/lib/kb.ts,
src/components/ui/{accordion,badge,button,card,separator}.tsx (knip decides),
src/app/fonts/SpaceGrotesk-SemiBold.ttf, public/images/messi-og.jpg,
public/images/messi.png, public/logos/* (nothing renders them), the
`images.remotePatterns` entry for Simple Icons in next.config.ts.
Untouched: src/app/chess/**, src/lib/chess/**, src/components/chess/**,
scripts/chess/**, public/engine/**, src/app/blog/**, src/app/api/chess/**.
```

**Structure Decision**: one client component (`home.tsx`) owns the only shared
state on the page, the orb's status and an output-volume ref, and hands it down
to the grid and the label. No context, no store: two consumers, one owner.

## Complexity Tracking

No constitution violations to justify. The one judgement call, keeping the
grid's vertex update on the CPU rather than in a vertex shader, is recorded in
`research.md` with the ceiling at which it should move.
