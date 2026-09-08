<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — materially expanded guidance, no principle removed or
redefined. The quality gates in "Development Workflow and Quality Gates" now name
`bun run check` (lint + typecheck + knip) as the single CI gate, add knip with the
rule that exceptions live in knip.jsonc with reasons, and split the chess checks
into `chess:verify` / `chess:verify:exhaustive` / `chess:audit` by cost. Governance
now points at AGENTS.md as the agent guidance file, with CLAUDE.md importing it, so
Codex and Claude Code read one document.

Modified principles: none.
Added sections: none.
Removed sections: none.
Templates reviewed: no change needed; they read the constitution at runtime.

Previous entry (1.0.0, same day):
Version change: (unversioned template) → 1.0.0
Bump rationale: MAJOR — initial ratification. The scaffold shipped by `specify init`
contained only placeholder tokens; this is the first constitution with real content,
so there is no prior version to compare principle-by-principle.

Modified principles:
  [PRINCIPLE_1_NAME] → I. Measured, Not Asserted
  [PRINCIPLE_2_NAME] → II. Drive the Real Thing Before Believing It
  [PRINCIPLE_3_NAME] → III. An Enhancement Never Becomes a Requirement
  [PRINCIPLE_4_NAME] → IV. Tokens, Contrast, and a Motion Budget
  [PRINCIPLE_5_NAME] → V. One Document Per Subject, and Decisions Carry Their Reasoning

Added sections:
  [SECTION_2_NAME]   → Technology and Content Constraints
  [SECTION_3_NAME]   → Development Workflow and Quality Gates

Removed sections: none.

Deferred items / TODOs: none. RATIFICATION_DATE was derived from the repository's
first commit (2026-04-05) rather than asked, since the repo history is unambiguous.

Templates reviewed for consistency: plan-template.md, spec-template.md,
tasks-template.md, checklist-template.md — these read the constitution at runtime
and needed no edits.
-->

# Personal Website Constitution

The project is Joan Mateo Duarte Politi's personal site at
<https://joanduarte.vercel.app> — a single-page editorial site plus `/chess`, a
training tool built on the public chess.com API. These principles describe how
work on it is already done; they are written down so the next change does not
quietly undo a lesson that cost something to learn.

## Core Principles

### I. Measured, Not Asserted

Any claim about how good something is MUST carry a number produced by a script in
the repository, not an impression. The chess repertoire has `verify-no-hanging.ts`,
`verify-no-forced-mate.ts`, `verify-book-safety.ts`, `verify-see.ts`,
`verify-repertoire.ts` and `verify-analysis.ts` for exactly this reason.

Two rules govern how those are run. The fast, exhaustive, engine-free checks MUST
run before the slow sampled audit (`audit-book.ts`) — they cover every position
rather than a sample, so a failure there is conclusive and cheap. And the recorded
baselines (426s of unused clock in losses, 88% conversion, 311 games) are **frozen
inputs**. They MUST NOT be recomputed from newer games. The whole point is to
compare against the state the work was meant to change; recomputing the baseline
destroys the measurement.

Rationale: the site's most substantial feature exists to move one number — 48% of
serious errors being material handed to a one-move capture. A feature justified by
a number is only honest if the number is still being taken.

### II. Drive the Real Thing Before Believing It

A passing type check and a passing test suite are NOT evidence that a user-facing
change works. Any change to a rendered page MUST be exercised in a browser before
it is called done.

This is not a preference. Two real bugs shipped past types and tests and were only
visible on the running page: the trainer panel pairing Stockfish's move with the
setup's prose, so the explanation described a different move than the one being
recommended; and the closing paragraph reprinting on every move of the middlegame.
Neither was a type error and neither had a failing test.

### III. An Enhancement Never Becomes a Requirement

Anything that can fail to load MUST leave the feature working as it did before that
thing existed. Stockfish is the standing example: if the worker never loads or its
search never resolves, the trainer still runs on SEE, the book, and its safety net,
which do not know the engine is there.

Two constraints follow and are binding. The single-threaded Stockfish build
(`stockfish-18-lite-single`) was chosen because the multi-threaded one needs
COOP/COEP cross-origin isolation, and those headers break the ElevenLabs voice orb
elsewhere on the site. No change MAY introduce cross-origin isolation. And a
degraded path MUST be a real path, not a spinner that never ends: the copy-email
button falls back to `mailto:`, the orb falls back to the agent ID in `agents.json`.

### IV. Tokens, Contrast, and a Motion Budget

Color MUST come from the oklch tokens defined in `src/app/globals.css` and
documented in `DESIGN.md`. Hardcoded `rgba(255,255,255,…)` is prohibited; borders
are opaque oklch by design, not semi-transparent white.

Contrast MUST be judged at the size the thing actually renders. A piece-on-square
lightness gap of 0.18 survived a zoomed screenshot and disappeared at ~50px squares,
where a knight vanished into its own square. Every such gap MUST clear 0.25, checked
un-zoomed.

Motion is budgeted, not decorative. Every animation MUST earn its place, MUST
respect `prefers-reduced-motion: reduce`, and MUST animate named properties rather
than `all`. The prohibitions in DESIGN.md's "What This Site Is NOT" — SaaS card
grids, centered-everything, purple/blue gradients, blobs and wavy dividers, generic
hero copy — are binding on new work, not aspirational.

### V. One Document Per Subject, and Decisions Carry Their Reasoning

Each subject gets exactly one document. `joan-kb.md` is who Joan is,
`flare-product-kb.md` is what Flare is, `DESIGN.md` is the design system. A second
document about the same subject MUST NOT be created — `joan-context-v1.md` and
`joan-founder-kb.md` told the same story twice, drifted apart on details, and were
merged for that reason.

Written records MUST state the reasoning, not just the outcome. `CHANGELOG.md`
entries say what broke and why, with the reproduction where one exists. `TODOS.md`
distinguishes "decided" from "deferred" and keeps the research behind the decision.

Prose in this repository narrates; it does not pitch. Documentation MUST read as a
person explaining what happened, not as marketing copy or a list of punchlines.

## Technology and Content Constraints

**Stack.** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript
in strict mode, `bun` as package manager and runtime. Animation uses the `motion`
package, imported from `motion/react`. Deployment is Vercel: pushing to `main`
deploys.

**Environment.** `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` are
set in all three Vercel environments and MUST be pulled with `vercel env pull
.env.local` rather than written by hand. `NEXT_PUBLIC_SITE_URL` is the
`metadataBase` behind every link preview; if it points anywhere that does not
return 200, crawlers get broken previews.

**Asset tracing.** The metadata image routes (`opengraph-image`, `twitter-image`,
`apple-icon`) read fonts and photos off disk. Any file they touch MUST be declared in
`outputFileTracingIncludes` in `next.config.ts` or it is dropped from the deployed
bundle. Satori has no `inset` shorthand: absolutely positioned elements need explicit
`top`/`left`/`width`/`height` or they collapse to zero size.

**Language.** The site is in English. `/chess` is in Spanish **on purpose**, because
it is a tool Joan uses himself. The two MUST NOT be unified in either direction.

**Measure.** Content is capped at 640px. `/chess` is the single exception at 880px,
and only for its two-column tool areas — prose inside that page stays at 640px.

**Chess domain rules.** White plays the Italian Game (Giuoco Pianissimo), with the
London setup kept internally only as the fallback when Black does not reply `1...e5`.
Stockfish decides outright from move one and its move is the recommendation as soon
as its own search resolves — it MUST NOT be gated on a second search that has not
landed yet. The repertoire plan annotates; it does not vote.

## Development Workflow and Quality Gates

**Before any change is done:**

1. `bun run check` MUST exit clean. It runs `lint`, `typecheck` and `knip` in
   sequence, and it is exactly what CI runs on every push and pull request
   (`.github/workflows/ci.yml`).
   - `lint` — zero errors, zero warnings. `public/engine/**` is ignored because the
     vendored, minified Stockfish build was the only thing in the project producing
     problems, and it is third-party output, not ours to fix. Nothing else is ignored.
   - `typecheck` — `tsc --noEmit`, strict.
   - `knip` — no unused files, exports, or dependencies. Every exception lives in
     `knip.jsonc` with its reason beside it. An exception MUST NOT be added to
     silence a real finding; the code gets deleted instead. That is what happened to
     the scroll-reveal wrapper, `PIECE_LETTER_ES` and `accuracy()`, each of which sat
     in the tree for months after its last caller left.
2. `bun run build` MUST pass. Vercel runs it on every deploy; run it locally for
   anything touching `next.config.ts`, the metadata image routes, or MDX.
3. If a rendered page changed, it MUST be opened in a browser and exercised
   (Principle II).
4. If `src/lib/chess/` changed: `bun run chess:verify` (seconds) always, and
   `bun run chess:verify:exhaustive` (about five minutes; every position, no engine)
   for any change to the book, SEE, or move safety. `bun run chess:audit` — sampled,
   needs a Stockfish binary — runs after those, never instead of them (Principle I).

**Feature work** goes through the Spec Kit flow (slash commands in Claude Code,
`$speckit-…` skills in Codex): `/speckit-specify` →
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, with `/speckit-clarify`
before planning when the shape is ambiguous. Bugs go through the `bug` extension
(`/speckit-bug-assess` → `/speckit-bug-fix` → `/speckit-bug-test`). An idea that is
not yet a committed feature goes through the `assess` extension before it becomes a
spec.

**Releases** bump `VERSION` and add a `CHANGELOG.md` entry written to Principle V —
what changed, what it broke, and how it was reproduced.

**Auto-commit is off.** The `git` extension's `auto_commit` settings are all `false`
and MUST stay that way unless deliberately changed: commits are Joan's call, not a
side effect of running a command.

## Governance

This constitution supersedes ad-hoc practice. Where a principle here and a habit in
the code disagree, the principle wins or the principle gets amended — not silently
ignored.

**Amendment procedure.** Amendments are made by running `/speckit-constitution` with
the proposed change, which rewrites this file and its Sync Impact Report. An
amendment MUST state its rationale; a principle removed or redefined MUST say what
replaced it.

**Versioning policy.** Semantic versioning on this document:
- MAJOR — a principle is removed or redefined in a way that invalidates prior work.
- MINOR — a principle or section is added, or guidance materially expanded.
- PATCH — clarifications, wording, typos, nothing semantic.

**Compliance.** Every plan produced by `/speckit-plan` is checked against these
principles before implementation begins, and `/speckit-analyze` reports drift across
spec, plan, and tasks. Complexity MUST be justified against Principle III and
Principle IV; "it was easier" is not a justification. Runtime development guidance
for coding agents lives in `AGENTS.md`; `CLAUDE.md` imports it and adds only what is
specific to Claude Code.

**Version**: 1.1.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-09-08
