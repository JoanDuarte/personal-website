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
| `--spot` | `oklch(0.837 0.128 66.29 / 0.10)` | The pointer-following highlight on panels |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | Warm red |

**Rule:** No hardcoded `rgba(255,255,255,...)` anywhere. Use tokens.
**Rule:** Borders are opaque oklch, not semi-transparent rgba. By design.
**Rule:** One accent, no second hue. Amber is the only chromatic color on the page
and it may appear where it has a job: the aurora behind the hero, the scroll
progress bar, the orb's glow and pill, the "Active" badge and the timeline's active
dots (real state), the spotlight that follows the pointer on a panel, the large
figures on the project panels, link and button hover, the focus ring, and the email
pill. Headings, labels, body text, borders and metadata stay neutral. Any other hue
is a defect.

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
- **Section padding:** `py-12 md:py-16`, so two neighbours sit 128px apart on
  desktop. The story directly under the hero is `py-8 md:py-10` so the first
  screen flows into it. It was `py-20 md:py-28` for one afternoon: with the
  sections that arrived in the intensity pass the 224px gaps read as empty, and
  Joan said so. Air comes from the hero and the bento, not from the gutters.
- **Dividers:** one `Separator` between Active and Past; accordion items carry
  `border-t`. Lists do not get a hairline under every row.

## Layout

- **Hero:** `min-h-[88dvh]`, centered, `pt-24` at most, the aurora behind it. Three
  things: the orb, the name (`text-[40px] md:text-[60px]`), the positioning line.
  Nothing else.
- **Order:** Hero, Story, Work, How I got here, How I think, What I build with,
  Beyond code, Writing, Footer. "How I think" and "What I build with" are read
  from `joan-kb.md` at build time (see `src/lib/kb.ts`), not copied.
- **Work:** the four active projects as a bento at 960px: Verelyn wide, Flare and
  Privé, Inception wide. Flagship, two products, the engine that funds them. Each
  panel is a `SpotlightCard` (a shadcn `Card` with the pointer highlight), a 44px
  logo with a soft halo, the full description, and one large mono figure taken
  from that description (`07:00`, `29 / 23 / 3`, `0%`, `500k`), counting up on
  first view where counting makes sense.
- **How I got here:** all nine projects in start order from `projects.json`, a
  vertical line that draws as the section is scrolled, amber dots for active,
  each row an accordion item with the description and link inside.
- **What I build with:** one marquee of stack logos (Simple Icons, monochrome in
  the foreground color, names in mono underneath) at 960px, then the definition
  grid, `md:grid-cols-[136px_1fr]`, single column under 768px. One marquee per
  page, and this is it.
- **Beyond code:** visible. The Messi photo in a two-column split with its
  paragraph, then Chess and Reading as two spotlight panels.
- **Footer:** the contact line as a statement, the email as a magnetic amber pill,
  the three social icons beside it, copyright in `--text-tertiary`.

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

Intentional and visible. Every animation earns its place and can say what it is
for. The dials, in the taste-skill's terms: variance 8, motion 7, density 4.

- **Aurora:** three blurred amber radials behind the hero drifting on `transform`
  over 18 to 26 seconds. Atmosphere; it ties the base to the orb.
- **Scroll progress:** a 2px amber line at the top, `scaleX` from scroll progress
  through a spring. Orientation.
- **Name:** enters word by word, 70ms apart, from `blur(10px)` and 14px below to
  sharp. Hierarchy.
- **Hero on scroll:** the block scales to 0.94, drops 48px and fades as it leaves
  (`useScroll` + `useTransform`). Transition to the story. This is not parallax:
  nothing moves at a different speed than the page.
- **Hero entrance:** Motion `staggerChildren: 0.08` for the orb and the line.
- **Section reveal:** `whileInView`, once, opacity, a 16px rise and `blur(6px)` to
  sharp, triggered by a `-64px` viewport margin rather than a fraction of the
  element (a section taller than the viewport can never show 20% of itself).
  Sequence. Every animated wrapper carries `data-reveal`.
- **Spotlight panels:** a 260px amber radial follows the pointer over a panel
  (`useMotionValue` + `useMotionTemplate`), plus border to `--border-hover` and a
  1px rise, `transition-[border-color,transform]`. Feedback.
- **Figures:** count from 0 to their value over 1.4s the first time they are
  seen. Emphasis. The server HTML carries the final value.
- **Timeline:** the line's `scaleY` follows scroll progress through a spring;
  rows reveal as they enter. Story.
- **Marquee:** CSS `transform` over 42s, pauses on hover. Breadth at a glance.
- **Magnetic pill:** the email button follows the pointer up to 18px on a spring
  and snaps back. Feedback on the one action the page asks for.
- **Links:** `underline underline-offset-4`, hover to amber. Buttons scale to
  0.98 on press.
- **No bounce.** No background parallax. No motion that exists only because it
  could. No scroll cues.

### Reduced Motion

- `<MotionConfig reducedMotion="user">` wraps the page, so every Motion animation
  collapses to its final state.
- CSS backs it up: `[data-reveal] { opacity: 1 !important; transform: none !important; filter: none !important; }`
  under `prefers-reduced-motion: reduce`, plus `scroll-behavior: auto` and every
  keyframe cut to 0.01ms, which also freezes the marquee and the aurora.
- The pointer-driven pieces (spotlight, magnetic pill) do not attach their
  listeners at all under reduced motion; the scroll-linked ones are neutralized
  by the CSS rule above.

### No JavaScript

Motion writes its `initial` state (`opacity: 0`) into the server HTML. A
`<noscript><style>` in `layout.tsx` forces `[data-reveal]` visible, so a reader
without JavaScript sees the whole page.

## Background

- **Grain texture:** CSS pseudo-element with base64 SVG noise at 4% opacity. `position: fixed`, `pointer-events: none`.
- **Radial:** faint amber (`oklch(0.837 0.128 66.29 / 0.10)`) at `50% 0%`, transparent by 55%, breathing as above. The aurora sits on top of it inside the hero.
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
- Not decorated with blobs, circles, or wavy dividers drawn as shapes. An
  atmospheric glow behind the hero is not a shape
- Not generic hero copy ("Welcome to..." / "Your all-in-one...")
- Not an uppercase eyebrow above every section
- Not em-dashes as design elements (labels, separators, captions); quoted text keeps its own punctuation
- Not a warm-charcoal page anymore. The warmth is the accent, not the base
- Not quiet. Correct and silent was tried on 2026-09-08 and rejected the same day;
  the quality has to be visible
