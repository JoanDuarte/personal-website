# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-04-05

### Added
- Scroll-reveal animations on all content sections using IntersectionObserver
- Copy-to-clipboard email button with mailto: fallback
- Footer component with copyright notice
- DESIGN.md codifying the full design system (oklch palette, typography, spacing, motion)
- Background grain texture and warm gradient animation
- Staggered fade-in-up entrance animations on hero elements
- Scroll-down chevron that fades on scroll
- TODOS.md for tracking deferred work

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
