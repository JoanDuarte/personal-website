# Contract: Tokens

The `:root` block in `src/app/globals.css` after this feature. Chess tokens are listed
only to say they do not change.

## Values

| Token | Value | Role |
|---|---|---|
| `--background` | `oklch(0.145 0.004 260)` | page base, near-black neutral |
| `--surface` | `oklch(0.18 0.004 260)` | panels (active project cards), popover, card |
| `--muted` | `oklch(0.21 0.004 260)` | subtle fills, badge for past, hover fill |
| `--border` | `oklch(0.27 0.004 260)` | opaque hairline |
| `--border-hover` | `oklch(0.36 0.005 260)` | panel hover |
| `--input` | `oklch(0.36 0.005 260)` | same as border-hover |
| `--foreground` | `oklch(0.93 0.004 260)` | primary text, off-white |
| `--muted-foreground` | `oklch(0.70 0.006 260)` | body/secondary text |
| `--text-secondary` | `oklch(0.70 0.006 260)` | alias kept for existing uses |
| `--text-tertiary` | `oklch(0.56 0.006 260)` | metadata, periods, tags |
| `--primary` | `oklch(0.837 0.128 66.29)` | amber, unchanged |
| `--primary-foreground` | `oklch(0.145 0.004 260)` | text on amber (was pure white; near-black reads better on amber and passes) |
| `--ring` | `oklch(0.75 0.13 66)` | focus |
| `--orb-glow` | `oklch(0.837 0.128 66.29 / 0.12)` | orb idle |
| `--orb-glow-active` | `oklch(0.837 0.128 66.29 / 0.30)` | orb active |
| `--secondary`, `--accent`, `--popover`, `--card` | `= --surface` | shadcn aliases |
| `--secondary-foreground`, `--accent-foreground`, `--popover-foreground`, `--card-foreground` | `= --foreground` | shadcn aliases |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | unchanged |
| `--radius` | `0.625rem` | unchanged; one radius system: surfaces `--radius`, pills only for the orb button and badges |
| `--chess-*` | unchanged | board |

Font variables: `--font-sans: var(--font-geist)`, `--font-display: var(--font-space-grotesk)`,
`--font-mono: var(--font-geist-mono)`.

## Pairs the contrast script measures

| Foreground | Background | Minimum | Used for |
|---|---|---|---|
| `--foreground` | `--background` | 4.5 | body headings |
| `--foreground` | `--surface` | 4.5 | panel titles |
| `--muted-foreground` | `--background` | 4.5 | body text |
| `--muted-foreground` | `--surface` | 4.5 | panel descriptions |
| `--text-tertiary` | `--background` | 4.5 | metadata |
| `--text-tertiary` | `--surface` | 4.5 | periods and tags on panels |
| `--primary` | `--background` | 4.5 | amber links and the Active badge text |
| `--primary` | `--surface` | 4.5 | Active badge on panels |
| `--primary-foreground` | `--primary` | 4.5 | text on amber buttons |
| `--border` | `--background` | 1.5 | visibility only; not a WCAG text pair, reported not enforced |

The script exits non-zero if any pair with a WCAG minimum is under it. The border row is
printed for the record. Expected results are in `quickstart.md`; the values above were
chosen to clear the minimums with margin, and the script is what proves it.
