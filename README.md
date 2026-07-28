# Personal website

Personal website for Joan Mateo Duarte Politi. Built with Next.js 16, Tailwind CSS v4, and an oklch warm amber color system.

Production: <https://joanduarte.vercel.app>. There is no `jmduarte.com` on the Vercel account yet; if that domain gets attached, update `NEXT_PUBLIC_SITE_URL` (see [Voice and metadata setup](#voice-and-metadata-setup)) along with the references here.

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `src/app/page.tsx` — Single-page layout with section components
- `src/components/sections/` — Server components for each content section
- `src/components/voice-orb.tsx` — Official ElevenLabs Orb driven by a live voice session
- `src/components/ui/orb.tsx` — ElevenLabs UI Orb component code
- `src/components/reveal-on-scroll.tsx` — IntersectionObserver scroll-reveal wrapper
- `src/components/copy-email-button.tsx` — Clipboard copy with mailto: fallback
- `src/app/globals.css` — oklch color tokens, background grain/gradient, animations
- `src/app/og-card.tsx` — Shared Satori card behind `opengraph-image` and `twitter-image`

The metadata image routes read their font and photo off disk, so anything they
touch has to be declared in `outputFileTracingIncludes` in `next.config.ts` or it
gets dropped from the deployed bundle. Satori also has no `inset` shorthand:
absolutely positioned elements need explicit `top`/`left`/`width`/`height` or
they silently collapse to zero size.

## Design System

See [DESIGN.md](./DESIGN.md) for the full design system specification (palette, typography, spacing, motion).

## Deploy

Designed for Vercel. Push to `main` to deploy.

## Voice and metadata setup

Both variables are already set in all three Vercel environments. Pull them with
`vercel env pull .env.local` rather than writing them by hand.

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_public_agent_id
NEXT_PUBLIC_SITE_URL=https://joanduarte.vercel.app
```

`NEXT_PUBLIC_SITE_URL` is the `metadataBase` for every generated link preview. If
it points anywhere that does not serve a 200, crawlers get broken preview URLs.

The site now ships with a bundled default portrait at `/images/joan-avatar.jpg`. Set `NEXT_PUBLIC_ELEVENLABS_AVATAR_IMAGE_URL` only if you want to override it.

For local/dev convenience, the voice orb also falls back to the agent ID recorded in `agents.json` if `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is not set. Use the env var in deployed environments so the frontend always points at the intended public agent.

The orb uses the public agent path over WebRTC, so the agent must allow unauthenticated website access in ElevenLabs. Restrict it there with the website allowlist rather than a server-side token proxy.

## Knowledge base

The orb answers from three markdown files in the repo root: `flare-product-kb.md`,
`joan-founder-kb.md` and `joan-context-v1.md`. Editing them changes nothing on its
own — they have to be uploaded and linked to the agent:

```bash
echo "YOUR_KEY" > ~/.elevenlabs/api_key && chmod 600 ~/.elevenlabs/api_key
./upload-kb.sh
```

Each run creates new documents rather than updating in place, so the previous set
is left unreferenced. The script lists those orphans and prints the delete
commands; it does not remove them for you.

The script does not touch the agent's prompt or settings. Change those in the
ElevenLabs dashboard.
