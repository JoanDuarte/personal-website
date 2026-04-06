# TODOS

## OG Image Generation
**Priority:** P2 | **Effort:** S (human: ~2h / CC: ~15min)
**What:** Generate a custom Open Graph image for social sharing previews.
**Why:** When someone shares jmduarte.com on Twitter/LinkedIn/Slack, the link preview currently shows a generic fallback. A branded OG image with the warm amber palette, Joan's name, and the orb silhouette makes shared links look intentional.
**Context:** Next.js supports dynamic OG image generation via `next/og` (uses Satori under the hood). Create `src/app/opengraph-image.tsx` that renders a 1200x630 image using the oklch warm amber palette from the tweakcn theme. Include name, subtitle, and orb graphic. The oklch colors may need conversion to hex/rgb for Satori compatibility (Satori doesn't support oklch as of 2026).
**Depends on:** Design polish PR must land first (establishes the color palette and visual identity).
