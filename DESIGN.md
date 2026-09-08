# Design System — joanduarte.vercel.app

Single-page personal website. Dark mode only. A neutral near-black base with one
warm accent.

## Aesthetic Direction

Editorial, narrative-driven, personality-forward. References: zuhair.io for the
voice; Linear and Vercel for the surfaces, the type and the restraint. Not a
template. Not a SaaS landing page. A personal site that's recognizable from a
screenshot.

The voice orb is the signature element (like Stripe's gradient or Linear's icons).

The base used to be warm charcoal ("warm, not cold"). On 2026-09-08 it went
neutral and the amber stayed, so the warmth is the accent rather than the wash.
The reasoning, and the alternatives that were rejected, are in
`specs/001-premium-home-redesign/research.md`.

## Color Palette (oklch)

All colors use oklch. Chroma on the greys is held at or under 0.006 so they read
as neither blue nor brown. Every text/background pair is measured by
`bun run design:contrast`; the values below clear WCAG AA with margin, and
`--text-tertiary` is the tightest pair (5.02 on the page, 4.77 on a panel), which
is why its lightness is 0.60 and should not go lower.

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.145 0.004 260)` | Page base, near-black, not pure |
| `--surface` | `oklch(0.18 0.004 260)` | Panels (active project cards) |
| `--muted` | `oklch(0.21 0.004 260)` | Subtle fills, the Past badge |
| `--border` | `oklch(0.27 0.004 260)` | Opaque hairline |
| `--border-hover` | `oklch(0.36 0.005 260)` | Panel hover, inputs |
| `--foreground` | `oklch(0.93 0.004 260)` | Primary text, off-white |
| `--muted-foreground` | `oklch(0.70 0.006 260)` | Body and secondary text |
| `--text-tertiary` | `oklch(0.60 0.006 260)` | Metadata, periods, tags, group labels |
| `--primary` | `oklch(0.8370 0.1280 66.2900)` | Golden amber accent, unchanged |
| `--primary-foreground` | `oklch(0.145 0.004 260)` | Near-black on amber |
| `--ring` | `oklch(0.75 0.13 66)` | Amber focus ring |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | Warm red |

**Rule:** No hardcoded `rgba(255,255,255,...)` anywhere. Use tokens.
**Rule:** Borders are opaque oklch, not semi-transparent rgba. By design.
**Rule:** The accent has a budget. Amber appears in exactly five places, each with
a job: the orb's glow, the "Active" badge (real state, not decoration), link and
button hover, the focus ring, and the faint radial at the top of the page.
Headings, labels, body text, borders and the footer stay neutral. A sixth use is a
defect.

### Chess Board Tokens

The `/chess` board uses warm woods rather than the usual green/beige, so it reads
as part of the page instead of an embedded widget.

| Token | Value | Description |
|-------|-------|-------------|
| `--chess-light` | `oklch(0.76 0.038 76)` | Light square, warm sand |
| `--chess-dark` | `oklch(0.45 0.042 58)` | Dark square, warm walnut |
| `--chess-piece-light` | `oklch(0.97 0.012 90)` | White pieces, cream |
| `--chess-piece-dark` | `oklch(0.19 0.01 60)` | Black pieces, warm near-black |
| `--chess-selected` | `oklch(0.837 0.128 66.29 / 0.55)` | Selected square + move dots |
| `--chess-last` | `oklch(0.837 0.128 66.29 / 0.25)` | Last move trail |
| `--chess-focus` | `oklch(0.837 0.128 66.29 / 0.4)` | Revealed book move |
| `--chess-danger` | `oklch(0.6368 0.2078 25.3313 / 0.45)` | Hanging piece, check |

**Rule:** Every piece-on-square lightness gap clears **0.25**. The first pass sat
a 0.205 black piece on a 0.385 dark square — a gap of 0.18 that survived a zoomed
screenshot and fell apart at the size the board actually renders, where a knight
on b8 vanished into its own square. Judge board contrast at ~50px squares, never
zoomed in.

**Rule:** Pieces are filled with one token and stroked with the other, so both
colors stay legible on both square colors. The piece set is hand-drawn SVG in
`src/components/chess/pieces.tsx` — no chess library, no licensing question, and
it matches the site's weight.

**Rule:** The board grid declares **both** `gridTemplateColumns` and
`gridTemplateRows` as `repeat(8, 1fr)`. Columns alone leaves rows implicit, so
they size to their content and empty ranks collapse to the height of their
coordinate label — the squares stop being square and the move dots render as
ovals. `aspect-square` on the container hides this by keeping the outer box
square while the inside is uneven.

The board now sits on the neutral base instead of the warm charcoal. Its own rule
is about pieces on squares, not squares on the page, so nothing above changes; the
warm woods read as a warm object on a neutral page, which is fine.

## Typography

- **Text:** Geist 400 and 500 (`--font-sans`). Neutral on purpose; most of the
  Linear/Vercel feel is this.
- **Name only:** Space Grotesk 600 (`--font-display`). The one place the site's
  original letterforms stay, as a signature.
- **Metadata:** Geist Mono 400 (`--font-mono`) for periods, tags and the labels of
  the definition grid.
- **Name:** `font-display font-semibold text-[34px] md:text-[48px] tracking-[-0.03em] leading-[1.05]`
- **Positioning line:** `text-[17px] md:text-[20px] text-foreground/90`
- **Section headings (`h2`):** `text-[24px] md:text-[28px] font-medium tracking-[-0.02em]`, sentence case
- **Group labels (`h3`, accordion triggers):** `text-[13px] font-medium text-text-tertiary`, sentence case
- **Body:** `text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground`; inside panels `text-[14px] leading-[1.65]`
- **Metadata:** `font-mono text-[12px] text-text-tertiary`

**Rule:** No uppercase, wide-tracking eyebrows. The old
`text-[12px] uppercase tracking-[0.2em]` label above every section was the
template rhythm this redesign left behind; a section's position on the page and
its heading are enough.

## Spacing

- **Reading measure:** 640px (`max-w-[640px]`) for every prose section.
- **Breakout:** the active-project grid is 960px, centered, so it extends past the
  prose column by the same amount on both sides. Nothing else breaks out.
- **Exception — `/chess`:** 880px, because a board beside its explanation panel
  does not fit in 640. Prose inside that page stays at 640px.
- **Section padding:** `py-20 md:py-28`. The story directly under the hero is
  `py-12 md:py-16` so the first screen flows into it. This replaced "compact,
  py-8 to py-16": generous, disciplined space is most of what premium is made of.
- **Dividers:** one `Separator` between Active and Past; accordion items carry
  `border-t`. Lists do not get a hairline under every row.

## Layout

- **Hero:** `min-h-[70dvh]`, centered, `pt-24` at most. Three things: the orb, the
  name, the positioning line. Nothing else.
- **Order:** Hero, Story, Work, How I think, What I build with, Beyond code,
  Writing, Footer. "How I think" and "What I build with" are read from
  `joan-kb.md` at build time (see `src/lib/kb.ts`), not copied.
- **Work:** Active projects as a 2x2 panel grid (`Card`), each with its full
  description; past projects as a compact list with an accordion for detail.
- **What I build with:** definition grid, `md:grid-cols-[136px_1fr]`, label in
  mono, value in Geist; single column under 768px.
- **Footer:** Single line, `text-[14px]`, icon row, copyright in `--text-tertiary`.

## Voice Orb (Signature Element)

- **Position:** Always above the name, all screen sizes. Single instance.
- **Glow:** Amber radial gradient derived from `--primary` (not white rgba).
- **Skeleton:** Matches orb glow color (no white-to-amber flash on hydration).
- **Fallback:** dynamic import with the skeleton as loading state and an error
  boundary around it. If the voice service never loads, the hero still reads.
- The component owns its idle layout and its pill button; this document does not
  restyle it. The pill is 40px tall, under the 44px rule below; it predates the
  rule and is noted here rather than hidden.

## Motion Budget

Intentional, minimal. Every animation earns its place and can say what it is for.

- **Hero entrance:** Motion `staggerChildren: 0.08`; each child rises 8px and
  fades in over 0.5s with `ease: [0.16, 1, 0.3, 1]`. Reason: hierarchy. Orb, then
  name, then line.
- **Section reveal:** Motion `whileInView`, once, opacity and an 8px rise, same
  duration and ease, triggered by a `-64px` viewport margin rather than a fraction
  of the element (a section taller than the viewport can never show 20% of itself).
  Reason: sequence. Every animated wrapper carries `data-reveal`. An earlier
  IntersectionObserver version of this was deleted as dead code; this one is used
  by every section.
- **Panel hover:** border to `--border-hover` and `-translate-y-px`, 200ms,
  `transition-[border-color,transform]`. No amber glow on hover; the accent budget
  does not include it.
- **Links:** `underline underline-offset-4`, hover to amber.
- **Background gradient:** opacity between 0.4 and 0.7 over 25s. GPU-friendly.
- **No bounce animations.** No parallax. No decorative motion. No scroll cues.

### Reduced Motion

- `<MotionConfig reducedMotion="user">` wraps the page, so every Motion animation
  collapses to its final state.
- CSS backs it up: `[data-reveal] { opacity: 1 !important; transform: none !important; }`
  under `prefers-reduced-motion: reduce`, plus `scroll-behavior: auto` and every
  keyframe cut to 0.01ms.

### No JavaScript

Motion writes its `initial` state (`opacity: 0`) into the server HTML. A
`<noscript><style>` in `layout.tsx` forces `[data-reveal]` visible, so a reader
without JavaScript sees the whole page.

## Background

- **Grain texture:** CSS pseudo-element with base64 SVG noise at 4% opacity. `position: fixed`, `pointer-events: none`.
- **Radial:** faint amber (`oklch(0.837 0.128 66.29 / 0.10)`) at `50% 0%`, transparent by 55%, breathing as above. One of the five accent uses.
- **Stacking:** `bg-background` on `<html>` (not `<body>`). Pseudo-elements on body with negative z-index.

## Interactive States

- **Copy email button:** Label swaps to "Copied!" in `text-primary` for 2s, then reverts. No toast. Fallback: mailto: if clipboard unavailable.
- **Panels:** hover as in the motion budget. Radius is `--radius` everywhere; badges and the orb pill are the only full-round shapes.
- **Social links and copy button:** `size-11` hit areas (44px) around 16px icons. `hover:text-foreground`.
- **Focus:** Amber ring via `--ring` token, on `focus-visible`.

## Social Icons

Inline SVGs for GitHub, LinkedIn, X, Email. 16px size inside 44px targets. No icon
library dependency for these four; they are brand marks, not icons.

## Accessibility

- **Touch targets:** 44px minimum on all interactive elements (the orb pill is the
  one known exception, above).
- **Focus ring:** Amber (`--ring`), visible on `focus-visible`.
- **Color contrast:** measured, not estimated. `bun run design:contrast` fails on any
  pair under 4.5:1.
- **JS-disabled:** every section visible (the `<noscript>` rule).
- **Reduced motion:** everything static; smooth scroll off.

## What This Site Is NOT

- Not a SaaS template with card grids
- Not centered-everything layout
- Not purple/blue gradient territory
- Not decorated with blobs, circles, or wavy dividers
- Not generic hero copy ("Welcome to..." / "Your all-in-one...")
- Not an uppercase eyebrow above every section
- Not em-dashes as design elements (labels, separators, captions); quoted text keeps its own punctuation
- Not a warm-charcoal page anymore. The warmth is the accent, not the base
