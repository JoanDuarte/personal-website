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
another, not just whether it hangs material. It names the move in the trainer —
see [Who decides](#who-decides-the-engine-always).
It was picked specifically because it needs
no COOP/COEP cross-origin-isolation headers — the multi-threaded build
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

**Mate is checked separately, because SEE structurally cannot see it.** Static
exchange evaluation prices `...Qxf2#` as "wins a pawn, loses the queen to the
recapture" — net zero, perfectly safe — so a material safety net, however
careful, is blind to the one reply that ends the game. It missed
`1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qh4 4.Bc4?? Qxf2#`: a mate threat answered with a
developing move. Two rules close it, and neither needs the engine. No branch may
recommend a move that allows mate in one — not a setup step, not an exception,
not a "free material" capture, not a way out of check, not a rescue. And a mate
threat (found by the same null-move flip used for material: hand them the move,
see if mate appears) ranks directly below check itself, above free material,
above the recapture rule, above a hanging piece — it is the only item on that
list that ends the game. Both cost one move generation each, about 0.08ms,
because chess.js already marks mate in the SAN it generates. When more than one
move stops the mate, a step of the setup wins the tie: against `Ng5` threatening
`Qxf7#` that turns "put the rook on f8" into "castle".

**Grabbing material is a separate question from making a safe move.** `moveRisk`
measures the *increase* in what the opponent can win, so a move is never blamed
for a threat that predates it. That is right for ordering the setup and wrong
for deciding to capture: taking a free pawn while your queen hangs is still
losing a queen, and the pawn was never free. `captureBalance` asks the other
question — what does this capture net once they answer, anywhere on the board —
and both greedy branches, "free material" and the recapture rule, fall through to
the rescue when the answer comes back negative. The recapture rule also runs
through `moveRisk` now, which it never did: "take back with your least valuable
piece" was picking a knight pinned to the queen.

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

Latest run (Italian + Indian) — 2268 recommendations, 1934 in still-open
positions, depth 16:

| | 0.4.0 | Now |
|---|---|---|
| Median cost of a recommendation | 16 cp | **14 cp** |
| Inaccuracy (≥150 cp) | 6.5% | 6.2% |
| Blunder (≥300 cp) | 1.4% | **1.0%** |
| Allows mate / misses a forced mate | 0% / 0% | 0% / 0% |
| Leaves material hanging | 0.9% | **0.0%** |

**Read those two columns carefully.** The 0.4.0 numbers were produced by an audit
that replayed a `tactic` answer as "the least valuable attacker on that square"
rather than the move the book actually named — so the blunder figures are only
roughly comparable, and the old one was, if anything, pessimistic. The hanging
figure is the solid one: it is now 0.0% here *and* 0 of 2268 under
`verify-no-hanging.ts`, which is an independent, engine-free measurement using
the book's own move. That is the number this repertoire exists to move, since
48% of his own serious errors are material given to a one-move capture.

**What the remaining 1.0% is, mechanically.** Almost entirely *missed
opportunities*, not losses: a solid, sound move where the engine had something
sharper. Every survivor in the worst-twelve list is one of two shapes — a
fallback developing move (`c3`, `Bd3`, `Bf4`) that misses a pawn break or an
`Ng5` shot, or the mate-parry branch picking the least material-losing defence
where Stockfish had a much better one. SEE resolves capture sequences on one
square and is blind to forks, pins, discovered attacks and skewers; it cannot be
otherwise without actual search. The failure mode is "the book was unambitious",
not "the book hung your queen" — and in the trainer the engine now overrules
exactly that class before he ever sees it (see [Who decides](#who-decides-the-engine-always)).

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

The live Stockfish engine (`use-engine.ts`) runs from move one and names the move
in every position, including past the point where the book runs out — which is
what replaced the old dead end where the trainer said "pensá vos" and stopped.

### Who decides: the engine, always

`useEngine` takes a list of positions, and the trainer hands it two on every move
of his: the one on the board, and the one the setup's own move would produce.
Stockfish is consulted from move one, not only once the book runs out, and **its
move is the recommendation as soon as its own search resolves.** It does not wait
on the second evaluation.

That "does not wait" is load-bearing, and was got wrong once. An earlier version
let the engine take over only past a cost threshold — which required the plan's
move to have been searched too. The second search lands well after the first, and
until it does there is no cost to compare, so the plan kept the panel by default
and the engine's answer sat there unused. If a future change reintroduces a
threshold, it has to survive that: the engine's move must never be gated on a
search that hasn't happened yet.

The plan's cost is an *annotation*. Once the second evaluation lands, the panel
names what the setup wanted and how far off it was, so staying in the repertoire
is a choice he makes with a number in front of him. That matters because at
depth 12 Stockfish prefers `d4` to `Bc4` by 28cp on move 3 of the Italian and
`1...e5` to `1...d6` by 30cp against the Indian — and `1...e5` is his
worst-scoring move in his own 94-game sample. The page shows the gap; it does not
decide for him.

**The reason has to be about the move on screen.** This is the other thing that
went wrong, and was only visible by driving the real page: the panel paired the
engine's move with the setup's prose, so it read "jugá d4" over "ésta lo para" —
which described `Cg4`. `explainMove` in `repertoire.ts` now derives a reason for
whatever move is being shown, from the position alone: what it captures, what
mate it stops, what it threatens next, what it rescues, whether it develops or
castles, and whether it is a step of the setup (further down the order — saying
"es la que pedía el esquema" contradicted the line naming the step that was
actually due). Two clauses maximum. When there is nothing concrete it says so
rather than inventing strategy; Stockfish supplies a number and no words, and a
fabricated plan is the exact failure this replaced.

Nothing is blocked and nothing is called wrong on the spot. The move he plays is
graded a beat later by the engine, in win-probability terms (`moveQuality` in
`phase.ts`) — most non-best moves are perfectly fine, and a binary
correct/incorrect against a 3000-elo search would mark almost everything wrong.

A move is only blamed for walking into mate when the mate wasn't already there:
otherwise every move of an already-lost game collects a red correction for a
position it didn't cause.

**Why the book still exists**, given the engine outranks it everywhere: it is the
instant answer before a 7MB engine has downloaded and compiled, the only answer
if it never does (the mate and hanging rules above need no engine), the source of
the plan the page is organised around, and — through `explainMove` and the step
ideas — the only source of a *reason*. "Cf3 (+0.2)" teaches a 600 nothing.

Verify any change to the analysis or the book:

```bash
bun run scripts/chess/verify-see.ts             # SEE against hand-checked positions
bun run scripts/chess/verify-repertoire.ts      # both systems vs all 10 opponent plans
bun run scripts/chess/verify-book-safety.ts     # the book never recommends a hanging move
bun run scripts/chess/verify-no-forced-mate.ts  # nobody can force mate against the book
bun run scripts/chess/verify-no-hanging.ts      # no recommendation leaves material hanging
bun run scripts/chess/verify-analysis.ts        # full pipeline against live chess.com data

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
