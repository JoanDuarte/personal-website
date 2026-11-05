<!--
Sync Impact Report
==================
Version change: 1.2.0 → 1.3.0
Bump rationale: MINOR. The home page was rebuilt as one screen on 2026-11-05
(feature 002-one-screen-home) and the layout rules here described the previous
page. No principle is removed or redefined: I, II, III, IV and V say what they
said. What changes is the material inside them that named things which no
longer exist (the 640px measure with its 960px breakout, Space Grotesk, the
aurora, the hero, the sections, the copy-email button) and the examples that
pointed at the old DESIGN.md list. Guidance is materially expanded in two
places: Principle I gains the "fits one viewport" measurement, and the
Technology constraints record why React StrictMode is off.

Modified principles: none renamed or redefined.
  I   — adds the viewport measurement (scrollHeight <= innerHeight in a browser).
  III — the copy-email mailto example is replaced by the grid, which renders
        nothing without WebGL and leaves the page identical.
  IV  — the DESIGN.md prohibitions it cites are the current list; the old
        "centered-everything" item is gone because the header is centered on
        purpose now.
Added sections: none.
Removed sections: none.
Technology and Content Constraints: "Measure" rewritten (one 560px column, no
scroll at three viewports); "Stack" says where motion, three.js and fiber are
used and why StrictMode is off.
Templates reviewed: no change needed; they read the constitution at runtime.

Previous entry (1.2.0):
Version change: 1.1.0 → 1.2.0
Bump rationale: MINOR. The chess trainer was removed from the project on
2026-09-16, and with it every chess-specific constraint in this document. No
principle is removed or redefined. What goes is the material inside them whose
subject no longer exists — the frozen chess baselines and the verify-script
ladder in Principle I, Stockfish as the standing degradation example in
Principle III, the board-squares figure in Principle IV, the `/chess` Spanish
exception, the `/chess` 880px measure exception, the "Chess domain rules"
paragraph, the `public/engine/**` lint exception, and workflow step 4.

Previous entry (1.1.0):
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — materially expanded guidance, no principle removed or
redefined. The quality gates now name `bun run check` (lint + typecheck + knip)
as the single CI gate, add knip with the rule that exceptions live in knip.jsonc
with reasons. Governance points at AGENTS.md as the agent guidance file, with
CLAUDE.md importing it, so Codex and Claude Code read one document.

Previous entry (1.0.0, same day):
Version change: (unversioned template) → 1.0.0
Bump rationale: MAJOR — initial ratification. RATIFICATION_DATE was derived from
the repository's first commit (2026-04-05).
-->

# Personal Website Constitution

The project is Joan Mateo Duarte Politi's personal site at
<https://joanduarte.com> — one screen that fits without scrolling. These
principles describe how work on it is already done; they are written down so
the next change does not quietly undo a lesson that cost something to learn.

## Core Principles

### I. Measured, Not Asserted

Any claim about how good something is MUST carry a number produced by a script in
the repository or a measurement taken in a real browser, not an impression.
`scripts/design/check-contrast.ts` is the standing example: it measures the WCAG
ratio of every text-on-background token pair and is the gate for any palette
change, because "looks like enough contrast" is not a measurement. "Fits one
viewport" is the second: it is `document.documentElement.scrollHeight <=
window.innerHeight` evaluated in a browser at each target size, not eyeballed.

Where a claim has a baseline, that baseline is a **frozen input**. It MUST NOT be
recomputed from newer data. The point of a baseline is to compare against the state
the work was meant to change; recomputing it destroys the measurement.

Rationale: a claim justified by a number is only honest while the number is still
being taken. This is also what makes a feature's removal legible — the chess
trainer had six verification scripts and a frozen baseline, and when it went, the
scripts and the baseline went with it rather than staying as decoration.

### II. Drive the Real Thing Before Believing It

A passing type check and a passing test suite are NOT evidence that a user-facing
change works. Any change to a rendered page MUST be exercised in a browser before
it is called done.

This is not a preference. Two real bugs shipped past types and tests and were only
visible on the running page. Both were in the chess trainer, which has since been
removed; they are kept here because they are why the rule exists. The trainer panel
paired the engine's move with the setup's prose, so the explanation described a
different move than the one being recommended; and the closing paragraph
reprinting on every move of the middlegame. Neither was a type error and neither
had a failing test. The one-screen rebuild added a third: the orb rendered black
in development and fine in production, which no gate could see.

### III. An Enhancement Never Becomes a Requirement

Anything that can fail to load MUST leave the feature working as it did before that
thing existed. The voice orb is the standing example: if the ElevenLabs session
never opens, the page reads exactly as it does with the orb silent, and nothing
below it waits on the session. The grid behind the page is the second: without
WebGL it renders nothing, and the page is identical minus the lines.

Two constraints follow and are binding. No change MAY introduce COOP/COEP
cross-origin isolation — those headers break the ElevenLabs voice orb, and nothing
in the project needs them since the Stockfish worker that once did was removed with
the chess trainer. And a degraded path MUST be a real path, not a spinner that never
ends: the orb falls back to a static disc and the agent ID in `agents.json`, the
grid falls back to the plain background.

### IV. Tokens, Contrast, and a Motion Budget

Color MUST come from the oklch tokens defined in `src/app/globals.css` and
documented in `DESIGN.md`. Hardcoded `rgba(255,255,255,…)` is prohibited; borders
are opaque oklch by design, not semi-transparent white. A color derived from a
token uses relative color syntax, not a second literal.

Contrast MUST be judged at the size the thing actually renders, un-zoomed. A
lightness gap of 0.18 between a shape and its background survived a zoomed
screenshot and disappeared at the size it shipped at, which is how it got past
review in the first place. Zooming in to check contrast is how you approve
something nobody can read.

Motion is budgeted, not decorative. Every animation MUST earn its place, MUST
respect `prefers-reduced-motion: reduce`, and MUST animate named properties rather
than `all`. The prohibitions in DESIGN.md's "What This Site Is NOT" — not
scrollable, not a card grid or bento or timeline or marquee, not two typefaces,
not decorated beyond the grid, not a second hue, not lifeless — are binding on new
work, not aspirational.

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
in strict mode, `bun` as package manager and runtime. The page's entrance uses the
`motion` package, imported from `motion/react`. The grid behind the page is plain
three.js; the orb is react-three-fiber. React StrictMode is off in
`next.config.ts` for the reason recorded there: under StrictMode's simulated
remount, fiber 9.5 marks the orb's root inactive and force-loses its WebGL context
while the remount reuses that root, so the orb renders black in development.
Production is unaffected. Turning it back on is a one-line change once fiber
handles the remount; the check is to run dev and look at the orb. Deployment is
Vercel: pushing to `main` deploys.

**Environment.** `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` are
set in all three Vercel environments and MUST be pulled with `vercel env pull
.env.local` rather than written by hand. `NEXT_PUBLIC_SITE_URL` is the
`metadataBase` behind every link preview; if it points anywhere that does not
return 200, crawlers get broken previews.

**Asset tracing.** The metadata image routes (`opengraph-image`, `twitter-image`,
`apple-icon`) read fonts and the avatar off disk. Any file they touch MUST be
declared in `outputFileTracingIncludes` in `next.config.ts` or it is dropped from
the deployed bundle. Satori has no `inset` shorthand: absolutely positioned elements
need explicit `top`/`left`/`width`/`height` or they collapse to zero size.

**Language.** The site is in English throughout. It had one deliberate exception,
`/chess` in Spanish, and that page no longer exists; a new exception MUST be a
decision with a reason, not a drift.

**Measure.** One column of 560px, centered. The page MUST fit one viewport with no
document scroll at 1440×900, 1280×720 and 390×844, checked in a browser before a
change ships. Nothing breaks out of the column. If something does not fit, it does
not go on the page; the orb can say it.

## Development Workflow and Quality Gates

**Before any change is done:**

1. `bun run check` MUST exit clean. It runs `lint`, `typecheck` and `knip` in
   sequence, and it is exactly what CI runs on every push and pull request
   (`.github/workflows/ci.yml`).
   - `lint` — zero errors, zero warnings. Nothing is ignored beyond the defaults of
     `eslint-config-next`.
   - `typecheck` — `tsc --noEmit`, strict.
   - `knip` — no unused files, exports, or dependencies. Every exception lives in
     `knip.jsonc` with its reason beside it. An exception MUST NOT be added to
     silence a real finding; the code gets deleted instead. That is what happened to
     the scroll-reveal wrapper, `PIECE_LETTER_ES` and `accuracy()`, each of which sat
     in the tree for months after its last caller left, and to five shadcn
     components and seven dependencies when the page became one screen.
2. `bun run build` MUST pass. Vercel runs it on every deploy; run it locally for
   anything touching `next.config.ts`, the metadata image routes, or MDX. Do not
   run it while `bun dev` is running: the two fight over `.next` and the build
   fails on a font lookup that has nothing to do with fonts.
3. If a rendered page changed, it MUST be opened in a browser and exercised
   (Principle II), at the three viewport sizes if the layout changed.
4. If a color token changed, `bun run design:contrast` MUST be run and its numbers
   MUST be the evidence the change is safe (Principle I).

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

**Version**: 1.3.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-11-05
