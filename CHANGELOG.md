# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0.0] - 2026-08-21

### Added
- `/chess`, a training page built on the public chess.com API, structured as the
  loop it serves: drill the repertoire before playing, sync and review after, then
  work the puzzles those games produce
- Static exchange evaluation in `src/lib/chess/see.ts`, which finds hanging material
  without an engine. It reproduces the Stockfish-derived clock and conversion figures
  exactly (426s median in losses, 88% of losses with half the clock unused, over the
  same 311 rapid games) at ~0.15s per game
- Opening book for the London System and the Indian setup, modelled as an ordered
  setup plus exceptions rather than a variation tree, with recapture and
  tactics-outrank-the-book rules
- Puzzle generation from his own blunders. Two drills — what the opponent could have
  played, and what he could have taken — mixed with positions where nothing is
  hanging, so the answer can't be guessed from the fact that a puzzle was posed
- Rolling scorecard against the 2026 baseline: unused clock in losses, share of won
  positions thrown away, hangs per game, repertoire adherence
- Hand-drawn SVG piece set and a board using the site's own tokens
  (`src/components/chess/pieces.tsx`, `board.tsx`)
- Verification scripts under `scripts/chess/` covering SEE against hand-checked
  positions, both systems against all ten opponent plans, and the full pipeline
  against live data

### Notes
- The repertoire trainer is deliberately a pre-game drill, not a live reference.
  chess.com's fair play policy allows opening books in Daily chess only, not in
  live play, and these are ten-minute games

## [0.2.0.0] - 2026-07-28

### Added
- Stevay and Privé to the work list, the hero bio and the voice agent's knowledge base
- Present-tense paragraph in the hero, so it says what Joan is building now
- `joan-context-v1.md` to the knowledge base upload; it was maintained but never shipped to the agent
- `src/app/og-card.tsx`, shared by `opengraph-image` and `twitter-image`, which were byte-identical files
- Space Grotesk committed to the repo, replacing a version-pinned Google Fonts URL

### Fixed
- Link previews returned 500. The font URL 404'd and the `catch` around it could not
  recover, because Satori requires at least one font
- `NEXT_PUBLIC_SITE_URL` was set in no environment and fell back to a dead preview
  deployment, so `metadataBase` resolved to a URL that returned 307
- The dark overlay behind the name never painted. It positioned with the `inset`
  shorthand, which Satori does not support, collapsing the div to zero size
- Explicit `openGraph.images` overrode the generated card, so shared links previewed a
  bare photo instead
- Collapsed sections kept their links in the tab order while invisible
- Flare's architecture numbers, which disagreed across two knowledge base docs and were
  wrong in both (now 29 tables, 23 Edge Functions, counted against `flare-ios`)
- `upload-kb.sh` could not run. It shelled out to an `elevenlabs` CLI that is not
  installed, and its first step would have pushed local config over the live agent

### Changed
- Metadata image routes dropped `runtime = "edge"` and now prerender as static
- Active badge moved from a hardcoded `emerald-400` to the `primary` token
- Project logos resized from 2000×2000 to 256px: 9.8 MB → 268 KB across six files

## [0.1.0.0] - 2026-04-05

### Added
- Scroll-reveal animations on all content sections using IntersectionObserver
- Copy-to-clipboard email button with mailto: fallback
- Footer component with dynamic copyright year
- DESIGN.md codifying the full design system (oklch palette, typography, spacing, motion)
- Background grain texture and warm gradient animation
- Staggered fade-in-up entrance animations on hero elements
- Scroll-down chevron that fades on scroll
- TODOS.md for tracking deferred work
- ElevenLabs voice agent configuration with hardened security defaults

### Changed
- Migrated entire color system from hex/rgba to oklch color space
- Moved `bg-background` from body to html element to fix CSS stacking context
- Unified voice orb to single instance (was duplicated for mobile/desktop)
- Enlarged voice orb from 48/120px to 80/160px with amber oklch glow
- Replaced JS hover handlers with CSS-only Tailwind hover classes in selected work cards
- Tightened section padding from py-24 to py-16 across all content sections
- Narrowed content max-width from 768px to 640px for better readability
- Rewrote connect section with inline SVG social icons and consistent token usage
- Added border-t dividers between all content sections
- Reduced hero height from 100dvh to 60dvh

### Fixed
- Register `--color-border-hover` in Tailwind @theme inline (hover states were silently broken)
- Fix timezone-dependent date rendering in writing section (off-by-one for UTC- users)
- Remove unused Next.js boilerplate SVGs from public/
