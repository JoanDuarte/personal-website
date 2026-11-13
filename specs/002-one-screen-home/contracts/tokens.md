# Contract: Tokens and Contrast Pairs

The palette after this feature, and the pairs `scripts/design/check-contrast.ts`
measures. The script's `pairs` array is rewritten to this table; the previous
list (from `specs/001-premium-home-redesign/contracts/tokens.md`) named
`surface` and `muted-foreground`, which no longer exist.

## Tokens (`:root` in `src/app/globals.css`)

| Token | Value | Job |
|---|---|---|
| `--background` | `oklch(0.145 0.004 260)` | page |
| `--foreground` | `oklch(0.93 0.004 260)` | name, active project links, fact text |
| `--text-secondary` | `oklch(0.70 0.006 260)` | positioning line, past project links, fact prose |
| `--text-tertiary` | `oklch(0.60 0.006 260)` | date column, idle label, social links |
| `--border` | `oklch(0.27 0.004 260)` | the only hairline (orb focus ring base) |
| `--primary` | `oklch(0.8370 0.1280 66.2900)` | orb colors, label while a session is open |
| `--primary-foreground` | `oklch(0.145 0.004 260)` | kept for the ring/outline utilities |
| `--ring` | `oklch(0.75 0.13 66)` | focus ring |
| `--chess-*` | unchanged | `/chess`, out of scope |

Removed: `--surface`, `--muted`, `--muted-foreground`, `--border-hover`,
`--input`, `--spot`, `--orb-glow`, `--orb-glow-active`, `--secondary*`,
`--accent*`, `--popover*`, `--card*`, `--radius*` (if no shadcn component
survives), `--font-sans`, `--font-display`. `--font-mono` becomes the only font
token and `html` uses it.

Derived, not tokens: the grid line color is `--foreground` read from the
computed style at mount; the vignette behind the text is
`radial-gradient(ellipse at center, <--background at 0.92>, <--background at 0.6> 55%, transparent 75%)`
written with `oklch(from var(--background) l c h / a)` or a literal copy of the
background oklch with alpha. No `rgba`.

## Pairs the script checks

| fg | bg | min | use |
|---|---|---|---|
| foreground | background | 4.5 | name, fact text, active links |
| text-secondary | background | 4.5 | positioning line, past links |
| text-tertiary | background | 4.5 | dates, idle label, social links |
| primary | background | 4.5 | active label |
| primary-foreground | primary | 4.5 | kept pair |
| border | background | 0 | hairline (reported only) |

The vignette never darkens below `--background`, so page pairs are the worst
case; no panel pairs remain.
