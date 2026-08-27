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

**Two engines, doing two different jobs.** `src/lib/chess/see.ts` implements
static exchange evaluation: it plays out the capture sequence on a square with
least-valuable-attacker ordering and reports the net material. That is enough to
find every piece left to a one-move capture, which is the error class costing the
rating — and it runs in ~0.15s per game, synchronously, no download, no worker.
It reproduces the original engine-derived clock and conversion numbers exactly
(426s, 88%, 311 games), and it is what grades every past game on the Repaso tab.

The live trainer additionally runs real Stockfish (`stockfish-18-lite-single`,
~7MB) in the browser via a Web Worker (`src/lib/chess/engine.ts`), for the one
thing SEE structurally cannot do: say whether a move is simply *better* than
another, not just whether it hangs material. It was picked specifically because
it needs no COOP/COEP cross-origin-isolation headers — the multi-threaded build
does, and those headers would break the ElevenLabs voice widget elsewhere on
this site, which loads cross-origin resources the isolation policy blocks. The
engine is a progressive enhancement, never a requirement: if it fails to load or
never resolves, the trainer works exactly as it did before this existed —
SEE, the book, and its safety net don't know it's there.

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

White's primary system is the Italian Game (Giuoco Pianissimo: `e4 Nf3 Bc4 d3
O-O c3`, never `Ng5`, so the sharp Fried Liver theory is out by construction, not
by exception). It is not a "system" the way the London was — it only applies
once Black actually replies `1...e5`. When they don't, `ITALIAN.setup` delegates
straight into `LONDON.setup`, kept around internally as exactly that fallback: a
generic, already-audited "develop with sense" plan, not a dedicated answer to the
Sicilian or the French. The same safety net below wraps whichever one is active,
so the fallback can't recommend anything unsound either — that's not a new
guarantee, it's the existing one applying to a second entry point.

**Every book move is checked for safety before it is recommended.** A setup is a
plan, not a licence to hang pieces: a bishop developed to its book square only
makes sense while nothing hangs once it gets there. Each candidate step runs
through `moveRisk`, which measures the *increase* in what the opponent can win —
comparing against a null-move flip of the position, so a move is never blamed for
a threat that already existed. Unsafe steps are skipped, the book reorders
itself, and it says why ("Af4 es la que tocaba, pero acá te la come el peón en
f4"). When nothing in the setup is safe it says so rather than recommending a
losing move. Being in check overrides all of this: only check-resolving moves
are legal, so it's checked first, before anything about material elsewhere on
the board — a resolving move that also happens to win material used to get
framed as "free material" instead of "you're in check", which was true but beside
the point.

This is also how the repertoire gets debugged, not by anticipating problems by
hand. The safety check itself found a real hole in the Slav line before the
Italian existed (`Nbd2` interposing on the queen's defence of d3, dropping the
bishop to `...Bxf5`); a hand-written "retreat the bishop from a `...b5` attack"
exception for the Italian turned out to be dead code once written, because the
generic "something is already hanging" rescue always fires first and already
finds a safe retreat — same move, no exception needed. Run `verify-book-safety.ts`
after any change to the book.

### How good the book actually is

`audit-book.ts` plays hundreds of games with the book on one side and a random
or plausible opponent on the other, then asks Stockfish what every single
recommendation cost. Positions already decided (|eval| ≥ 900cp) are excluded and
scores clamped at ±1000, the same rule the original study used — otherwise a
position that was already mate-in-4 scores the book at -9500 for developing
instead of mating.

Latest run (Italian + Indian) — 2286 recommendations, 1979 in still-open
positions, depth 16:

| | Result |
|---|---|
| Median cost of a recommendation | **16 cp** |
| Inaccuracy (≥150 cp) | 6.5% |
| Blunder (≥300 cp) | **1.4%** |
| Allows mate / misses a forced mate | **0%** / **0%** |
| Leaves material hanging | 0.9% overall, **0.0%** on setup moves |

For scale, his own play blunders on 7.4% of moves — the book is still roughly
5× cleaner, just not as clean as the closed London/Indian pairing it replaced
(0.8% blunder, measured before this change). That gap is real and explained: an
open e4/e5 structure produces sharper middlegame branches than a closed one does,
even from a "plausible" opponent, and SEE's blind spot to forks and deeper
tactics shows up more often as a result — the worst cases found (`Cxe5` losing
1165cp to a shot only a real search sees, `c3` losing 534cp to a pawn break)
aren't code bugs, they're the honest cost of a livelier opening. `TODOS.md`
tracks the follow-up this points to: the live engine layer described below
currently only speaks once the book runs out, and extending it to grade `tactic`
and `move` recommendations too — not just `done`/`out` — is exactly what would
close this gap, now that the audit has located it precisely.

**What the remaining 1.4% is, mechanically.** Almost entirely *missed
opportunities*, not losses: a solid, sound move where the engine had something
sharper. SEE resolves capture sequences on one square and is blind to forks,
pins, discovered attacks, skewers and mate — it cannot be otherwise without
actual search, which is what the live engine adds on top (see below). The
failure mode is "the book was unambitious", not "the book hung your queen" —
still the right way round for a beginner repertoire, and still why the
hanging-material number, not the blunder number, is the one to watch on any
future change to the book itself.

The trainer is a single free-play sandbox: both sides are yours, nothing is
blocked. Play the opponent's try yourself and read what the book says about it;
play your own idea and the book comments instead of correcting. Being stopped
from playing `e3` before `Bf4` only asserts that the bishop gets stuck — playing
it and watching the bishop get stuck teaches the same thing better. A phase
badge (Apertura / Medio juego / Final) tracks where the game structurally is —
apertura while the position is young by move count, final once both queens are
off the board — independent of whether the book itself still has anything to
say, since those are different questions: a position can be off-book by move 6
and still structurally an opening.

Once the book is exhausted or the opponent deviates, the live Stockfish engine
(`use-engine.ts`) takes over the coaching, showing its own best move and
evaluation in plain terms — this is what replaces the old dead end where the
trainer just said "pensá vos" and stopped. It's deliberately quiet while the book
still has something to say: the common case (the book is fine) doesn't change a
letter, and the audit above is what actually tells you when that stops being
true and this scope should widen.

Verify any change to the analysis or the book:

```bash
bun run scripts/chess/verify-see.ts          # SEE against hand-checked positions
bun run scripts/chess/verify-repertoire.ts   # both systems vs all 10 opponent plans
bun run scripts/chess/verify-book-safety.ts  # the book never recommends a hanging move
bun run scripts/chess/verify-analysis.ts     # full pipeline against live chess.com data

# Grade every book recommendation against a real engine (needs a Stockfish binary)
STOCKFISH=/path/to/stockfish bun run scripts/chess/audit-book.ts 60 16
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
