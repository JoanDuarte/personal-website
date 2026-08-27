# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0.0] - 2026-08-26

### Added
- A live Stockfish engine (`stockfish-18-lite-single`, ~7MB, no COOP/COEP
  headers needed) running in the browser via a Web Worker, layered on top of the
  existing SEE safety net. It picks up exactly where the fixed book used to say
  "pensá vos" and stop — once the book is exhausted or the opponent deviates, the
  trainer now shows the engine's own best move and evaluation, continuously,
  through the middlegame and endgame instead of going silent. It's a strict
  progressive enhancement: if it fails to load, the trainer works exactly as it
  did before this existed
- A phase indicator (Apertura / Medio juego / Final) on the trainer, independent
  of book status — apertura by move count, final once both queens are off the
  board — so the transition Joan asked to see is visible
- `src/lib/chess/phase.ts`: `gamePhase()`, plus `moveQuality()`/`winPercent()`/
  `accuracy()` implementing Lichess's public win%-based accuracy formula, so a
  move's cost is graded by the change in win probability rather than raw
  centipawns lost — losing 300cp in an equal position and losing 300cp in a
  position already won by a rook aren't the same mistake

### Changed
- White's primary repertoire is now the Italian Game (Giuoco Pianissimo) instead
  of the London System. Unlike the London, it isn't a universal "system" — it only
  applies once Black actually plays `1...e5` — so when they don't, the book falls
  back to the London setup automatically, kept around internally exactly for that:
  a generic, already-audited "develop with sense" plan, not a dedicated answer to
  the Sicilian or French
- The trainer dropped the Practicar/Explorar toggle. It's a single free-play
  sandbox now — both sides always yours, nothing blocked — since the scripted
  opponent mode wasn't adding anything and the toggle machinery it needed is gone
  with it
- Move quality/phase grading aside, the repertoire's own safety mechanics are
  unchanged: `moveRisk`, the "something is already hanging" rescue, the recapture
  rule. One exception was removed as genuinely dead code once written for the
  Italian (`b5` attacking the c4 bishop) — the generic rescue always fires first
  and already finds a safe retreat, so the hand-written one never ran
- Being in check now overrides every other branch in `consultBook`, checked
  immediately rather than as a late fallback. A check that's also resolved by a
  capture used to get framed as "hay material gratis" instead of "te dan jaque" —
  true, but not the point, and worse coaching than naming the actual situation

### Notes
- Re-running the full Stockfish audit after the swap: blunder rate moved from
  0.8% to 1.4% (still ~5× cleaner than his own 7.4%). This is a real, measured,
  and understood trade-off, not a regression to chase down — an open e4/e5
  structure produces sharper middlegame branches than a closed one, even from a
  "plausible" opponent, and SEE's blind spot to forks and deeper tactics shows up
  more often as a result. Full numbers and the follow-up this points to
  (extending live engine commentary to `tactic`/`move` recommendations, not just
  `done`/`out`) are in README.md and TODOS.md

## [0.3.7.0] - 2026-08-22

### Fixed
- Explore mode wouldn't let you pick White's first move against the Indian setup.
  Playing Black means the opponent opens, and that move was auto-played from the
  bot's plan at mount regardless of mode — so exploring started from a position
  with a move on it you never chose, and always the same one. The bot only opens
  in practice mode now, and switching modes before playing anything starts the
  round fresh so Explore hands over the whole board from move one. Switching
  mid-position still keeps the position, which is the reason the toggle exists

## [0.3.5.0] - 2026-08-21

### Fixed
- Being in check ended the round. The book had nothing to say, the trainer turned
  that into the "round over" panel and locked the board, and it read as
  checkmate-start-again. `...Qa4+` against the Indian setup — one of the most
  common checks at this level — hit it every time. The board now only locks when
  the game is genuinely over; the book running out ends the guidance, not the
  position
- The book now answers checks instead of shrugging at them. When no setup move
  resolves the check it plays the reply that loses least, preferring to block
  rather than move the king so castling survives

### Added
- Six check positions in `verify-book-safety.ts`, asserting the book always
  returns a move when in check

### Changed
- The repertoire-adherence metric only counts departures from the *setup*. The
  reactive rules — answering a check, rescuing a piece, recapturing, taking free
  material — are situational, and blocking a check with the bishop instead of the
  knight is not "leaving the repertoire". It was marking a game where he followed
  the scheme perfectly as a deviation

## [0.3.4.0] - 2026-08-21

### Added
- `scripts/chess/audit-book.ts` — plays hundreds of games with the book on one
  side and grades every recommendation against Stockfish. Excludes already-decided
  positions and clamps evals at ±1000, so a position that was mate-in-4 does not
  score the book at -9500 for developing instead of mating

### Fixed
- The book ignored material that was *already* hanging. The safety check only
  stopped it from creating new threats, so against `...g5` attacking the f4 bishop
  it happily answered `c3` — Stockfish put that at -600cp. Rescuing is now its own
  rule, and it searches for the move that leaves the least on the table
- "Take the free material" was never safety-checked. 8.2% of those recommendations
  left something hanging two plies later; now 0.4%, and 0.0% on setup moves
- Ties in exchange evaluation were broken arbitrarily. Two free pawns look
  identical to SEE, so the central one now wins the tie

### Notes
- Measured over 1941 recommendations in still-open positions at depth 16: median
  cost 18cp, blunders 0.8%, allows-mate 0%, hangs material 0.4%. The residual is
  missed opportunities rather than losses — SEE cannot see forks, pins or mate
  without an engine, so the book is sometimes unambitious rather than unsafe

## [0.3.3.0] - 2026-08-21

### Fixed
- The opening book recommended moves that hang pieces. It walked its setup order
  without ever asking whether the move survives the position in front of it, so
  after `1.d4 d6 2.Nf3 e5` it still said `Bf4` — a bishop to a pawn. Every
  candidate move now runs through a safety check, unsafe steps are skipped, and
  the book explains the reordering instead of doing it silently
- A real hole in the Slav line, found by that check: after `...Bf5`, `Nbd2`
  interposes on the queen's defence of d3 and drops the bishop. Added the
  standard answer, `Bxf5`, as an exception
- The `e3` step's text asserted the c1 bishop was already on f4, which stopped
  being true once the safety check could reorder the setup

### Added
- `scripts/chess/verify-book-safety.ts` — five positions where the naive setup
  order hangs material, asserting the book refuses each one

## [0.3.2.0] - 2026-08-21

### Fixed
- The board's squares were not square. The grid declared `gridTemplateColumns`
  but not `gridTemplateRows`, so rows sized to their content and ranks with no
  pieces collapsed to the height of their coordinate label. `aspect-square` on
  the container hid it by keeping the outer box square while the inside was
  uneven, and the legal-move dots rendered as ovals
- Black pieces disappeared into the dark squares. The lightness gap was 0.18,
  which held up zoomed in and failed at the ~50px squares the board actually
  renders at. Every piece-on-square pair now clears 0.25, and the palette moved
  from grey-taupe to warm sand and walnut

## [0.3.1.0] - 2026-08-21

### Added
- Explore mode in the repertoire trainer. Both sides of the board are movable, so
  a question like "what does the book do against ...Qb6?" gets answered by playing
  it rather than waiting for the drill to deal that plan
- Undo, and a move counter showing whose turn it is

### Changed
- Explore mode doesn't block wrong moves, it comments on them. Being stopped from
  playing `e3` before `Bf4` only asserts that the bishop gets stuck behind it;
  playing it and seeing the bishop stuck teaches the same thing better. Practice
  mode still takes wrong moves back
- Switching modes keeps the current position rather than resetting, since
  switching to explore mid-drill is the reason to have it
- Notation inside the book's prose is Spanish now (`Dc1`, `Ag3`, `Ce5`), matching
  the notation the rest of the page and chess.com already show him

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
- Incremental sync. The client holds its last result and sends the newest game it
  has as `?since=`, so only games played since then are analyzed and the merged
  window is scored client-side. A repeat sync with nothing new went from 15-20s on
  the preview deployment to milliseconds; archive months are also fetched in
  parallel rather than one serial round trip each

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
