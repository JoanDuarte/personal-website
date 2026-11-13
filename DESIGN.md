# Design System — joanduarte.com

One screen. Dark. Monospace. A faint wireframe grid behind the text, and the
voice orb as the one thing on the page that is built rather than written.

## What the page is, and why

The previous design (September 2026) was a nine-section editorial page in the
Linear and Vercel register: amber aurora, a bento of project cards with
counting figures, a timeline, a logo marquee. Joan looked at it two months
later and said it read like a portfolio template made with AI, and that he
wanted the minimalism of danielgross.com and ben.bolte.cc/about. His worry was
that the same bareness, with his credentials instead of theirs, would read to
an investor as "this person can't code".

The answer we settled on is craft in three places rather than decoration
anywhere: one real typographic decision, facts with nouns and links, and one
built thing that works. The built thing is the voice orb. The grid behind the
text is there so the page is not a text file, and it is kept faint enough that
it never competes. The reasoning, the mockup and the alternatives that were
rejected (a point field, floating glyphs, a serif, a pill button under the
tagline) are in `specs/002-one-screen-home/`.

## Color (oklch)

Chroma on the greys is held at or under 0.006 so they read as neither blue nor
brown. The amber is the only chromatic color on the page and it has two jobs:
the orb, and the label under it while a session is open. Anything else in
amber is a defect. Every text pair is measured by `bun run design:contrast`;
the minimum is 4.5 and `--text-tertiary` is the tightest at 5.02.

| Token | Value | Job |
|---|---|---|
| `--background` | `oklch(0.145 0.004 260)` | the page |
| `--foreground` | `oklch(0.93 0.004 260)` | name, fact text, active project links |
| `--text-secondary` | `oklch(0.70 0.006 260)` | positioning line, fact prose, past project links |
| `--text-tertiary` | `oklch(0.60 0.006 260)` | date column, idle label, social links |
| `--border` | `oklch(0.27 0.004 260)` | the only hairline; underline on past links and socials |
| `--primary` | `oklch(0.8370 0.1280 66.2900)` | orb colors, label while listening or talking |
| `--primary-foreground` | `oklch(0.145 0.004 260)` | kept for the outline utilities |
| `--ring` | `oklch(0.75 0.13 66)` | focus ring |

`--surface`, `--border-hover`, `--muted-foreground` and `--destructive` are
still in `globals.css` under a comment: `/chess` uses them, and `/chess` leaves
in its own pull request. Nothing on the home page may use them. The
`--chess-*` block is the same story.

**Rules.** No hardcoded `rgba`. Borders are opaque oklch. Colors derived from a
token (the vignette behind the text) use relative color syntax,
`oklch(from var(--background) l c h / a)`, not a second literal. The grid reads
`--foreground` and `--background` off the document at mount.

## Typography

Geist Mono, weights 400 and 500, for everything. There is no second typeface
and no display face; Space Grotesk left with the old hero.

- Name: `text-[22px] font-medium tracking-[-0.01em]`, centered.
- Everything else: 15px, line-height 1.6; 14px under 480px.
- Positioning line, fact prose: `--text-secondary`. Dates, idle label, social
  links: `--text-tertiary`.
- Links: underlined, `underline-offset` 3px, `text-decoration-color` in a
  dimmer tone than the text (`--text-tertiary` under active project links,
  `--border` under past ones and socials); hover turns the underline amber.

## Layout

One column, `max-w-[560px]`, centered in a `h-dvh` main with `overflow-hidden`.
There is no scrolling: the page fits at 1440×900, 1280×720 and 390×844, and
that is checked in a browser before a change ships. Top to bottom:

1. **Header, centered.** The orb (56px), the label, the name, the positioning
   line (max 420px wide).
2. **Facts, left-aligned.** Five rows. A 10ch date column in `--text-tertiary`,
   then project names (linked where `projects.json` has a URL; active projects
   in `--foreground`, past ones in `--text-secondary`, no-link names as plain
   secondary text), then the sentence. Under 480px the date column stacks above
   its row. The rows live in `src/components/facts.tsx`; the dates are derived
   from `projects.json`, not typed.
3. **Socials, centered.** GitHub, LinkedIn, X. No email on the page: the orb
   and the socials are the contact.

Behind the text block a radial vignette of the background color (0.92 at the
center, 0.6 at 55%, transparent at 75%, `inset: -80px -120px`) so the grid never
lowers the measured contrast.

## The orb

The ElevenLabs orb (`src/components/ui/orb.tsx`, driven by
`src/components/voice-orb.tsx`), 56px, inside a `<button>` above the name. The
label under it is rendered by the page from the session state:

| State | Label | Color |
|---|---|---|
| idle | Talk to me | `--text-tertiary` (`--foreground` on hover) |
| connecting | Requesting microphone… | `--text-tertiary` |
| listening | Listening | `--primary` |
| talking | Joan is talking | `--primary` |
| error | Voice unavailable, plus one truncated line of detail | `--text-tertiary` |

Clicking during a session ends it. If the orb's module never loads, if the
agent id is missing, or if it throws, a 56px disc in `--primary` at 25% takes
its place and the label stays "Talk to me". The page never waits on the
session.

## The grid

`src/components/grid-background.tsx`: plain three.js (not react-three-fiber;
see the comment at the top of the file), one `PlaneGeometry(400, 400, 80, 80)`
rotated flat at `y = -8`, `MeshBasicMaterial` wireframe in `--foreground` at
opacity 0.12, fog from 20 to 180 in `--background`, camera at `(0, 4, 40)`.

- It slides toward the viewer at 4 units a second and wraps every cell (5
  units). The undulation is computed in world space (`y − slide`) so the wrap
  is invisible. Tie it to local coordinates and the loop stutters; that was
  the first mockup, and Joan saw it.
- Time accumulates from clamped frame deltas, so a background tab resumes
  without a jump.
- The camera leans up to 0.06 rad with the pointer and settles to center when
  the pointer leaves the window.
- While the orb is listening or talking, the grid ripples: amplitude follows
  the session's output volume with a floor of 0.35, smoothed at 5% a frame, and
  the opacity rises with it up to 0.24.
- Without WebGL there is no canvas and the page is identical minus the lines.
  Under `prefers-reduced-motion` it draws one static frame at phase zero with
  no parallax.

## Motion

Three things move, and nothing else:

1. **The entrance.** On load, the header block, the name, the line, each fact
   row and the socials fade in top to bottom with an 8px rise: `motion`
   variants, `staggerChildren 0.06`, `delayChildren 0.1`, `duration 0.5`, ease
   `[0.22, 1, 0.36, 1]`. About a second in total. Every animated element
   carries `data-reveal`; the `MotionConfig reducedMotion="user"` provider makes
   it instant under reduced motion, and the `<noscript>` rule in `layout.tsx`
   plus the CSS fallback keep it visible without JavaScript.
2. **The grid**, as above.
3. **The orb**, which owns its own idle animation.

Animated properties are named (`opacity`, `transform`), never `all`.

## Metadata

Title and description come from `bio.json` (`name`, `positioning`). The Open
Graph and Twitter cards (`src/app/og-card.tsx`) are the page: name and line in
Geist Mono on the background color, no photo. Satori reads
`src/app/fonts/GeistMono-Regular.ttf` off disk, so the fonts directory is in
`outputFileTracingIncludes`. The apple icon still reads `joan-avatar.jpg`.

## What This Site Is NOT

- Not scrollable. If something does not fit, it does not go on the page; the
  orb can say it.
- Not a card grid, a bento, a timeline or a marquee.
- Not two typefaces.
- Not decorated beyond the grid. No aurora, no glow behind the orb, no
  spotlight, no counters.
- Not a second hue. Amber is for the orb and the active label only.
- Not lifeless. The grid and the orb are what moves, and they do move; the
  restraint is in the text, not in the absence of motion.
- Not a place for em-dashes as decoration. The rows use one as punctuation
  after a name, which is prose, not a separator.
