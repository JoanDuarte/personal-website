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
- `src/components/voice-orb.tsx` — ElevenLabs widget embed (client, dynamically imported)
- `src/components/reveal-on-scroll.tsx` — IntersectionObserver scroll-reveal wrapper
- `src/components/copy-email-button.tsx` — Clipboard copy with mailto: fallback
- `src/app/globals.css` — oklch color tokens, background grain/gradient, animations

## Design System

See [DESIGN.md](./DESIGN.md) for the full design system specification (palette, typography, spacing, motion).

## Deploy

Designed for Vercel. Push to `main` to deploy.

## Voice Setup

Set these environment variables before deploying the voice widget:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_public_agent_id
NEXT_PUBLIC_SITE_URL=https://jmduarte.com
```

The site now ships with a bundled default portrait at `/images/joan-avatar.jpg`. Set `NEXT_PUBLIC_ELEVENLABS_AVATAR_IMAGE_URL` only if you want to override it.

The widget embed uses the public agent path, so the agent must allow unauthenticated widget access in ElevenLabs. Restrict it there with the website allowlist rather than a server-side token proxy.
