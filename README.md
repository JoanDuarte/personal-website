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
- `src/app/chess/` — Chess training page (see [Chess trainer](#chess-trainer))
- `src/lib/chess/` — Analysis engine, opening book, chess.com client
- `src/components/chess/` — Board, piece set, and the three trainer panels

The metadata image routes read their font and photo off disk, so anything they
touch has to be declared in `outputFileTracingIncludes` in `next.config.ts` or it
gets dropped from the deployed bundle. Satori also has no `inset` shorthand:
absolutely positioned elements need explicit `top`/`left`/`width`/`height` or
they silently collapse to zero size.

## Design System

See [DESIGN.md](./DESIGN.md) for the full design system specification (palette, typography, spacing, motion).

## Chess trainer

`/chess` is a training tool built on the public chess.com API, structured around
the loop it is meant to serve: drill the repertoire *before* playing, sync and
review *after*, then work the puzzles that fall out of those games.

**No engine.** Instead of bundling Stockfish, `src/lib/chess/see.ts` implements
static exchange evaluation: it plays out the capture sequence on a square with
least-valuable-attacker ordering and reports the net material. That is enough to
find every piece left to a one-move capture, which is the error class costing the
rating — and it runs in ~0.15s per game instead of needing a WASM build, cross-origin
isolation headers, or a binary in the function bundle. It reproduces the
engine-derived clock and conversion numbers exactly (426s, 88%, 311 games).

Because chess.js only generates *legal* moves, a pinned defender correctly cannot
recapture, which makes this stricter than textbook SEE.

Two classification rules matter and are easy to get wrong:

- A move only *hangs* material if what the opponent wins exceeds what the move
  just captured. Without that offset, every even trade reads as a blunder.
- A capture counts as *taken* by net value, not by matching the exact move SEE
  picked. Winning the same piece with a different attacker is not a miss.

**Sync is incremental.** Analysis is the expensive half and a finished game's
analysis never changes, so the client keeps its last result in `localStorage`,
sends the timestamp of the newest game it holds as `?since=`, and merges what
comes back. The scorecard is recomputed client-side over that merged window,
which is why it lives in `scorecard.ts` rather than `analyze.ts`. A first
backfill of 20 games takes a few seconds; a sync after a session with nothing new
returns in milliseconds. Archive months are fetched in parallel batches, since a
strictly sequential walk cost one round trip per month before any analysis began.

**The repertoire** (`repertoire.ts`) is modelled as an ordered setup plus a short
list of exceptions, not a variation tree — a tree collapses the moment the
opponent leaves it, which at this level is by move 4. A step counts as resolved
when the piece reaches its square *or* leaves its origin, so a bishop chased from
f4 to g3 doesn't leave the book permanently unfinished.

**Every book move is checked for safety before it is recommended.** A setup is a
plan, not a licence to hang pieces: `3.Bf4` is the London's whole point right up
until Black has a pawn on e5, at which point it is a bishop for nothing. Each
candidate step runs through `moveRisk`, which measures the *increase* in what the
opponent can win — comparing against a null-move flip of the position, so a move
is never blamed for a threat that already existed. Unsafe steps are skipped, the
book reorders itself, and it says why ("Af4 es la que tocaba, pero acá te la come
el peón en f4"). When nothing in the setup is safe it says so rather than
recommending a losing move.

This is also how the repertoire gets debugged: the check caught a real hole in
the Slav line, where `Nbd2` interposes on the queen's defence of d3 and drops the
bishop to `...Bxf5`. Run `verify-book-safety.ts` after any change to the book.

The trainer runs in two modes, and they differ in who the board belongs to:

- **Practicar** — the opponent answers from one of five plans and wrong moves are
  taken back. For making the setup automatic.
- **Explorar** — both sides are yours and nothing is blocked. Play the opponent's
  try yourself and read what the book says about it; play your own idea and the
  book comments instead of correcting. Being stopped from playing `e3` before
  `Bf4` only asserts that the bishop gets stuck. Playing it shows you.

Verify any change to the analysis or the book:

```bash
bun run scripts/chess/verify-see.ts          # SEE against hand-checked positions
bun run scripts/chess/verify-repertoire.ts   # both systems vs all 10 opponent plans
bun run scripts/chess/verify-book-safety.ts  # the book never recommends a hanging move
bun run scripts/chess/verify-analysis.ts     # full pipeline against live chess.com data
```

The username is a constant in `src/lib/chess/chesscom.ts`. chess.com rejects
requests without a descriptive `User-Agent`, so the client sets one; the endpoints
are public and take no credentials.

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

The orb answers from two markdown files in the repo root: `joan-kb.md` (who Joan is)
and `flare-product-kb.md` (what Flare is). One document per subject, on purpose —
the earlier split into `joan-founder-kb.md` and `joan-context-v1.md` told the same
story twice and drifted apart.

Editing them changes nothing on its own. They have to be uploaded and linked:

```bash
echo "YOUR_KEY" > ~/.elevenlabs/api_key && chmod 600 ~/.elevenlabs/api_key
./upload-kb.sh
```

Each run creates new documents rather than updating in place, so the previous set
is left unreferenced. The script lists those orphans and prints the delete
commands; it does not remove them for you.

The script does not touch the agent's prompt or settings. Change those in the
ElevenLabs dashboard.
