# Changelog

All notable changes to this project will be documented in this file.

## [0.4.2.0] - 2026-09-03

### Fixed
- **The book could walk you into checkmate.** Reproduced exactly:
  `1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qh4 4.Bc4?? Qxf2#`. The repertoire's safety net is
  static exchange evaluation, and SEE is blind to mate by construction: it
  prices `...Qxf2#` as "wins a pawn, loses the queen to the recapture", which
  nets zero and reads as perfectly safe. So the book answered a mate threat
  with the developing move that happened to be next in the setup. `consultBook`
  now (a) never recommends a move that allows mate in one, in any of its
  branches — setup step, exception, "free material" capture, getting out of
  check, or rescuing a hanging piece — and (b) treats a mate threat as the
  highest-priority branch after check itself, above free material, above the
  recapture rule and above a hanging piece, because it is the only thing on
  that list that ends the game. Detecting it costs one move generation
  (~0.08ms): chess.js already marks mate in the SAN it generates, so no search
  of its own is needed
- When several moves stop the mate, the one that is also a step of the setup
  wins the tie. Against `4.Ng5` threatening `Qxf7#` that turns "put the rook on
  f8" into "castle" — same defence, and it's the move the plan wanted anyway
- **The recapture rule was never safety-checked.** "They took, take back with
  your least valuable piece" ran on `moveNetValue`, which resolves the exchange
  on the captured square and is blind to what the recapturing piece leaves
  behind. The audit caught it recommending `Nxd4` with the knight pinned to the
  queen by a bishop on g4: -629cp, and a queen. Recaptures now go through
  `moveRisk` like every other candidate
- **The recapture rule never ran in the page at all.** The panel rebuilds the
  position from a FEN, which carries no history, so `consultBook` could not see
  that the opponent had just captured — the whole "te capturó en X, tomá de
  vuelta" branch has been dead in the UI since it was written, and only ever
  fired in the verification scripts, which pass a live game object. The trainer
  already tracked the last move for the board highlight; it now hands it over
- **"Free material" outranked "your queen is hanging".** By design `moveRisk`
  subtracts the threat that already existed, so a move is never blamed for a
  problem it did not create — the right rule for ordering the setup, the wrong
  one for deciding to grab material. The book took a pawn with `Bxe5` while the
  queen hung to `fxg4`, and the safety check passed it, correctly, because the
  queen was already hanging before. New `captureBalance` asks the question that
  actually matters — what does this capture net once they answer, anywhere on
  the board — and both greedy branches (free material, recapture) now fall
  through to the rescue when the answer is negative. **Measured across 2268
  recommendations in played-out games, recommendations that leave material
  hanging went from 29 to 0**

### Changed
- **The engine is the authority now, not the book.** This was the open follow-up
  the post-Italian audit left in `TODOS.md`, taken further than it asked.
  Stockfish runs from move one and names the move in every position; it
  evaluates two per move — the one on the board and the one the setup's move
  would produce — and the difference is what following the plan costs, shown to
  him rather than acted on
- **The plan does not get a vote.** A middle version let the engine take over
  only once the *plan's* move had also been searched, so its cost could be
  compared against a threshold — which handed the panel to the book almost
  always, because the second search lands well after the first and until it does
  there is no cost to compare. The engine's answer was sitting right there,
  unused. Its move is now the recommendation the moment its own search resolves.
  The plan's cost is an annotation that fills in a beat later: it names what the
  setup wanted and how far off it was, so staying inside the repertoire is a
  choice he makes with a number in front of him — `1...e5` over `1...d6` is 30cp
  and also his worst-scoring move in his own 94-game sample, and that is his
  call to make, not the page's
- **The explanation described a different move than the one on screen.** Found
  by driving the actual page: it said "jugá d4" and, underneath, "ésta lo para
  y es la que menos material entrega" — which was about `Cg4`, the move the book
  wanted. Right move, wrong reason under it, which is worse than no reason.
  New `explainMove` derives a short reason for *whatever* move is being shown,
  from the position and nothing else: what it takes, what mate it stops, what it
  threatens, what it saves, whether it develops or castles. Capped at two
  clauses. It returns nothing rather than inventing strategy — Stockfish gives a
  number and no words, and a made-up plan is the failure being fixed
- A related contradiction went with it: `c3` is a step of the Italian and can
  come up long before its turn, so "y es la que pedía el esquema" printed
  directly above "el esquema pedía d3". It now says the honest version — in the
  setup, but further down the order
- Once the setup is finished, its closing paragraph moved out of the per-move
  explanation and under the plan, where it belongs. It was reprinting the same
  eight lines on every move of the middlegame
- **Correct/incorrect is gone.** Nothing is blocked and nothing is called wrong
  on the spot; the move he plays is graded a beat later by the engine in
  win-probability terms (`moveQuality`, already used for the badge next to the
  board). A binary right/wrong against a 3000-elo search marks almost everything
  wrong, which is both false and useless as coaching
- The "Mostrarme la jugada" reveal is gone with it. The recommendation and its
  squares are always visible: this is a coach you consult before playing, not a
  quiz — the fair test is the real game, with the page closed
- `useEngine` takes a list of positions instead of one, which is what makes the
  above possible. It lost its `current` accessor: reading `.current` off a
  memoised object made the React Compiler treat it as a ref and skip optimising
  the whole component, so every caller now uses `get(fen)`
- The tactic branch stopped claiming "material gratis … sin compensación". SEE
  guarantees the capture holds *on that square* and nothing else, and stating it
  with more certainty than that is exactly the error behind `3.Nxe5`
- `useEngine` takes a list of positions instead of one, which is what makes the
  above possible. It lost its `current` accessor: reading `.current` off a
  memoised object made the React Compiler treat it as a ref and skip optimising
  the whole component, so every caller now uses `get(fen)`
- The tactic branch stopped claiming "material gratis … sin compensación". SEE
  guarantees the capture holds *on that square* and nothing else, and stating it
  with more certainty than that is exactly the error behind `3.Nxe5`

### Added
- `scripts/chess/verify-no-forced-mate.ts` — the book is a deterministic
  policy, so "can anyone force mate against someone who follows it?" needs no
  engine and no sampling: try every opponent move, let the book answer, recurse.
  This is the script that found the mate above
- **The audit was grading a move the book never recommended.** `audit-book.ts`
  replayed a `tactic` answer as "the least valuable attacker on that square",
  a proxy from before the answer carried its own `from`/`to`. On the position
  `r1bqk2r/ppp3pp/7n/3QnP2/8/P4N2/P1P2PPP/RNB1KB1R w` the book says `Qxe5+`,
  which hangs nothing; the audit played `Nxe5`, which hangs 600, and then scored
  the book -1148cp for it — the worst finding of the previous run, and not a
  finding at all. It replays `bookMoveOf` now
- `scripts/chess/verify-no-hanging.ts` — the hanging-material figure is the one
  that matters on any book change, and it is a static-exchange number, not an
  engine one. Same playouts the audit uses, seconds instead of an hour, no
  Stockfish binary needed. This is what turned the fix above into a number
- Three mate cases in `verify-book-safety.ts`, including the original line

### Notes
- Full Stockfish audit re-run on the fixed book — 2268 recommendations, 1934 in
  still-open positions, depth 16: median cost **14cp** (was 16), inaccuracy
  **6.2%** (6.5), blunder **1.0%** (1.4), allows mate **0%**, misses a mate
  **0**, leaves material hanging **0.0%** (0.9). Note the old column came from
  the audit *before* the replay bug above was fixed, so the blunder comparison
  is indicative rather than exact; the hanging figure is the solid one, measured
  twice by independent means (0.0% here, 0 of 2268 under `verify-no-hanging.ts`,
  which uses no engine at all)
- The worst survivors are all one of two shapes: a fallback developing move
  (`c3`, `Bd3`, `Bf4`) that misses a pawn break or an `Ng5` shot, or the new
  mate-parry picking the least material-losing defence where Stockfish had a
  much better one. Both are SEE's structural blind spot, both are now caught by
  the engine layer before he sees them, and neither is worth growing the book
  into a variation tree over

## [0.4.1.0] - 2026-08-26

### Fixed
- The trainer showed a prominent "Empezar de nuevo" button the moment the book
  ran out, even mid-game with nothing stopping play from continuing. It read as
  a dead end — "se acabó, reiniciá" — when the actual message right above it was
  "podés seguir moviendo desde acá". That button now only appears once the game
  has genuinely ended (checkmate, stalemate, draw); the small link next to the
  board still resets on purpose any time

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
