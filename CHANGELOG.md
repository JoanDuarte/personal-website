# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
