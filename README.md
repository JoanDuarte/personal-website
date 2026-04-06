# jmduarte.com

Personal website for Joan Mateo Duarte Politi. Built with Next.js 16, Tailwind CSS v4, and an oklch warm amber color system.

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `src/app/page.tsx` — Single-page layout with section components
- `src/components/sections/` — Server components for each content section
- `src/components/voice-orb.tsx` — ElevenLabs voice conversation (client, dynamically imported)
- `src/components/reveal-on-scroll.tsx` — IntersectionObserver scroll-reveal wrapper
- `src/components/copy-email-button.tsx` — Clipboard copy with mailto: fallback
- `src/app/api/conversation-token/route.ts` — Proxies ElevenLabs signed URL with rate limiting
- `src/app/globals.css` — oklch color tokens, background grain/gradient, animations

## Design System

See [DESIGN.md](./DESIGN.md) for the full design system specification (palette, typography, spacing, motion).

## Deploy

Designed for Vercel. Push to `main` to deploy.
