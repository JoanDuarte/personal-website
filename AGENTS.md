# AGENTS.md

This is Joan Mateo Duarte Politi's personal site, live at
<https://joanduarte.vercel.app>: a single editorial page, and `/chess`, a training
tool he uses himself. This file is the one set of instructions for every coding
agent that works here — Codex, Claude Code, anything else that reads `AGENTS.md`.
`CLAUDE.md` imports it and adds only what is specific to Claude Code.

## Read these before changing anything

- `README.md` — how the site and the chess trainer actually work, with the reasoning.
- `DESIGN.md` — the design system. Binding on new work, not aspirational.
- `.specify/memory/constitution.md` — five principles and the quality gates. Every
  plan is checked against it.
- `CHANGELOG.md` and `VERSION` — release history. `TODOS.md` — open items, and the
  ones that were decided rather than deferred, with the research behind them.
- `joan-kb.md` and `flare-product-kb.md` — what the voice orb knows. One document
  per subject; do not create a second one about either.

## Commands

```bash
bun install
bun dev                           # http://localhost:3000

bun run check                     # lint + typecheck + knip. This is the CI gate.
bun run build                     # what Vercel runs on deploy

bun run chess:verify              # ~5s. Run after touching src/lib/chess at all.
bun run chess:verify:exhaustive   # ~5 min, every position, no engine. After touching
                                  # the book, SEE, or move safety.
bun run chess:verify:live         # full pipeline against live chess.com data
STOCKFISH=/path/to/stockfish bun run chess:audit 60 16   # sampled audit, after the above

bun run kb:upload                 # push the two knowledge-base docs to ElevenLabs.
                                  # Needs ~/.elevenlabs/api_key. Does not touch the agent prompt.
```

Environment variables come from `vercel env pull .env.local`, never typed by hand.

## Stack

Next.js 16 App Router on Turbopack, React 19, Tailwind CSS v4, TypeScript strict,
`bun` for install and scripts. Animation is the `motion` package (the current name
for Framer Motion), imported from `motion/react` — installed, not yet used anywhere.
The voice orb is `@elevenlabs/client` over WebRTC. The trainer runs `chess.js` plus
a single-threaded Stockfish (`stockfish-18-lite-single`) in a Web Worker. Vercel
deploys `main`.

## Where things live

| Path | What it is |
|---|---|
| `src/app/page.tsx` | The site. Sections are in `src/components/sections/`. |
| `src/app/chess/page.tsx` | The trainer. UI in `src/components/chess/`, engine in `src/lib/chess/`. |
| `src/app/globals.css` | oklch tokens, background grain and gradient, keyframes. |
| `src/app/og-card.tsx` | The Satori card behind `opengraph-image` and `twitter-image`. |
| `src/data/` | `bio.json`, `projects.json`. |
| `scripts/chess/` | Verification scripts. They are `entry` in `knip.jsonc`; nothing imports them. |
| `public/engine/` | Vendored Stockfish. Ignored by ESLint and knip on purpose. |
| `agents.json`, `agent_configs/`, `tools.json`, `tests.json` | ElevenLabs agents CLI layout. `voice-orb.tsx` imports `agents.json` as the fallback agent id. Leave them at the root. |
| `.specify/` | spec-kit: templates, scripts, extensions, and the constitution. |
| `.agents/skills/` | Skills every agent sees: spec-kit's core skills and the taste-skill pack. |
| `.claude/skills/` | Claude Code's view: spec-kit's Claude copies, plus symlinks into `.agents/skills/`. |

## Rules that cost something to learn

The reasons are in the constitution and the README; the rules are here so they are
not missed.

- **Drive the real page** in a browser before calling UI work done. Types and tests
  passed on the last two bugs that shipped.
- **Baselines are frozen.** 426s, 88%, 311 games. Never recompute them from newer
  games — the comparison is the experiment.
- **Enhancements degrade, they never become requirements.** Stockfish, the orb, the
  clipboard: each has a real fallback. Never add COOP/COEP headers; the multi-threaded
  Stockfish needs them and they break the orb.
- **Tokens only.** No hardcoded `rgba`. Borders are opaque oklch. Contrast is judged at
  the size the thing renders (~50px board squares), not zoomed. Every animation earns
  its place and respects `prefers-reduced-motion`. The "What This Site Is NOT" list in
  `DESIGN.md` is binding.
- **`/chess` is in Spanish on purpose.** The rest of the site is English. Do not
  unify either direction.
- **One document per subject.** Prose narrates; it does not pitch.
- **Metadata image routes** read files off disk. Anything they touch goes in
  `outputFileTracingIncludes` in `next.config.ts`. Satori has no `inset` shorthand.
- **Stockfish decides from move one.** Its move is the recommendation as soon as its
  own search resolves. Never gate it on a second search that has not landed.

## Workflow

Work is spec-driven with spec-kit. A feature goes `specify → clarify (if the shape
is ambiguous) → plan → tasks → implement`, with `converge` to pick up what
`implement` left. A bug goes `bug-assess → bug-fix → bug-test`. An idea that is not
yet a committed feature goes through `assess-intake → research → define → shape →
decide` first.

How to invoke them depends on the agent:

- Claude Code: slash commands, `/speckit-specify`, `/speckit-plan`, and so on.
- Codex: skills, `$speckit-specify`, `$speckit-plan`, and so on.

spec-kit deploys an extension's commands only to the *default* integration. After
`specify extension add <id>`, run `specify integration use codex` and then
`specify integration use claude` so both `.agents/skills/` and `.claude/skills/`
carry the new commands; switching the default is what triggers the sync, and it
does not remove anything from the other side.

`speckit-specify` creates the feature branch itself (`001-<slug>`, sequential) through
the git extension's `before_specify` hook. Every `auto_commit` in
`.specify/extensions/git/git-config.yml` is `false`: commits are Joan's, never a side
effect of a command.

For visual work, use the `design-taste-frontend` skill. Where it and `DESIGN.md`
disagree, `DESIGN.md` wins — it describes this site, the skill describes sites in
general.

## Commits and pull requests

Branch from `main`, open a PR to `main`. Commit titles are sentences that say what
changed and why, like the existing log ("Let Stockfish decide, and stop the book
walking into mate"). Bodies explain the reasoning, including what was tried and
rejected. A user-visible release bumps `VERSION` and gets a `CHANGELOG.md` entry
written the same way: what changed, what it broke, how it was reproduced.

## Writing

Everything written here — docs, commit messages, comments, UI copy — reads like a
person explaining what happened. No punchlines, no marketing rhythm, no lists of
benefits. Joan has rejected drafts for reading as "muy IA"; that is the failure mode
to avoid.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-premium-home-redesign/plan.md
<!-- SPECKIT END -->
