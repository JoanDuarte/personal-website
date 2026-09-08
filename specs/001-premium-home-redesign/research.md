# Research: Premium Home Page Redesign

Every decision below is final for this feature. Each records what was chosen, why, and
what was considered and rejected.

## 1. Typeface: Geist for text, Space Grotesk for the name, Geist Mono for metadata

**Decision**: Load `Geist` (400, 500) and `Geist_Mono` (400) from `next/font/google`
alongside `Space_Grotesk` reduced to weight 600. Geist becomes `--font-sans`, Space
Grotesk becomes `--font-display` and is used on the `h1` only, Geist Mono becomes
`--font-mono` (the variable `globals.css` already declares and nothing has loaded).

**Rationale**: The brief names Vercel and Linear. Geist is Vercel's typeface, so the
reference is hit directly rather than approximated, and it pairs with Geist Mono, which
the token file already expects. Joan chose the hybrid: the name keeps the site's
original letterforms as a signature; everything else goes neutral. `next/font/google`
is the mechanism the project already uses for Space Grotesk, and it self-hosts the files
at build, so there is no runtime request to Google.

**Alternatives considered**: Inter (the taste-skill discourages it as a default and it
is less distinctive; acceptable but no reason to prefer it); the `geist` npm package
(ships the same files locally without a build-time fetch, at the cost of a dependency
for something the existing mechanism already handles); keeping Space Grotesk for
everything (Joan chose against it).

## 2. Palette: neutral near-black, opaque borders, amber kept

**Decision**: replace the warm charcoal `:root` set with the values in
`contracts/tokens.md`. Base is near-black with chroma at or under 0.004, so it reads
neutral, not blue and not brown. Foreground is off-white, never pure. Borders stay
opaque oklch (DESIGN.md rule, kept). `--primary` stays the existing amber
`oklch(0.837 0.128 66.29)`; `--ring` and the orb glow derive from it as today.

**Rationale**: "Near-black neutral surfaces, restrained opaque borders" is the brief
verbatim. Pure black is rejected by both the taste-skill and DESIGN.md's spirit (no
depth). Keeping the amber untouched preserves the orb, which is the signature element,
and answers Joan's first clarification. Chroma is held low so the page does not tip
into the "cool" family and fight the warm accent.

**Alternatives considered**: pure `#000`/`#fff` (no depth, flat); a slightly cool base
like Linear's (chroma 0.01 at hue 260 reads visibly blue next to amber, and the
taste-skill's "one palette, do not fluctuate warm and cool" applies); keeping the warm
charcoal and only polishing (Joan asked for the departure explicitly).

## 3. Where the accent is allowed to appear (the "handful of places")

**Decision**: exactly five uses of amber on the page, and nowhere else:

1. The orb's glow (existing).
2. The "Active" badge on the four active project panels. This is real semantic state, not
   a decorative dot, which is the taste-skill's condition for allowing it.
3. Link and button hover/underline color, plus the "Talk to me" pill on the orb.
4. The focus ring (`--ring`), for accessibility.
5. A faint amber radial at the top of the page, replacing the current warm gradient, at
   roughly a third of its current strength. This is the "some color details" the brief
   asked for, and it ties the base to the orb.

Section headings, labels, body text, borders and the footer stay neutral.

**Rationale**: the brief says "some color details but not everywhere." Five uses, each
with a job, is a budget that can be audited. It also satisfies the taste-skill's
color-consistency lock (one accent, used the same way across sections).

## 4. Where taste-skill and DESIGN.md disagreed, and what was taken from each

DESIGN.md wins every conflict; the skill's advice was taken where DESIGN.md was silent.

| Topic | taste-skill says | Decision | Why |
|---|---|---|---|
| Hero alignment | Anti-center bias at variance > 4 | Centered, orb above name | DESIGN.md rule; also the skill's own exception for editorial/manifesto pages, which a personal site is |
| Color mode | Dual mode mandatory | Dark only | DESIGN.md rule; the brief confirms it |
| Icons | Lucide discouraged | Keep lucide-react | Already a dependency, which the skill lists as the override; one family only |
| Footer brand marks | Never hand-roll SVG | Keep the three brand paths | They are logos (GitHub, LinkedIn, X), not icons, and they are the official paths; adding an icon package for three marks is worse |
| Section labels | Max one uppercase-tracking eyebrow per three sections | Zero eyebrows: sections get a sentence-case `h2` | DESIGN.md's current "12px uppercase tracking-0.2em" label is amended; the every-section eyebrow is the pattern the brief wants to leave behind |
| Em-dashes | Zero, anywhere | Zero in anything designed (labels, separators, captions, UI copy). Body text quoted from the knowledge base keeps its punctuation | FR-007 says content is verbatim or near-verbatim; rewriting Joan's sentences to satisfy a lint would be the wrong trade |
| Long lists | Not `divide-y` rows for > 5 items | Active projects: 2x2 panel grid. Past projects: compact list under one heading with a single group divider, expandable detail | Nine `border-t` rows is the pattern the skill names as the laziest default; it is also what the site has today |
| Cards | Only when elevation means hierarchy | Panels for the four active projects only | Active vs past is the hierarchy FR-006 asks to show |
| Spacing | Density 3: py-32 to py-48 | Sections `py-20 md:py-28` | DESIGN.md is amended from "compact" toward generous, but not to gallery scale on a single-column page |
| Scroll cues | Banned | None. DESIGN.md's "scroll-down chevron" line is removed; the component does not exist in the tree | Stale rule |
| Images | Even minimalist sites need real images | The orb is the hero visual; project logos and the Messi photo remain; no stock imagery is added | A personal site does not need placeholder photography, and the taste-skill's rule is aimed at marketing pages |
| Motion | "Motion claimed, motion shown" | Hero stagger, section reveals, hover states, all real | Intensity 4, so the page does move, and every animation has a stated reason (§6) |

## 5. Content mechanics: one source, corrected copies

**Decision**:
- `src/lib/kb.ts` reads `joan-kb.md` from `process.cwd()` at render time. Since `/` is
  prerendered, that is build time. It splits on `## ` headings and returns the paragraphs
  under "How I Think" and the bullet list under "Technical Identity" as
  `{ label, value }` pairs. If either heading is missing it throws, so the build fails
  instead of shipping an empty section.
- `src/data/bio.json` `story[2]` is corrected. Today it reads "Today I'm building
  Flare… Alongside it, Stevay… and Privé…". It becomes, from `joan-kb.md`'s "What I'm
  Building Now" and the existing closing sentence: *"Today most of my time goes to
  Verelyn, a newsroom built around one reader. Flare, my social brain, is live on iOS.
  Privé lets creators sell and get paid without leaving Telegram. Different problems,
  same bet: software should act before you ask it to."* Every clause traces to a source
  line; the last sentence is the one already in `bio.json`.
- `src/app/layout.tsx` metadata `description` still says "Currently building Flare,
  Stevay and Privé". It is copy, so FR-007 applies: it becomes "Currently building
  Verelyn, Flare and Privé."
- Nothing in `joan-kb.md` changes, so `kb:upload` is not needed.

**Rationale**: Principle V, and the fact that `bio.json` has already drifted once.

**Alternatives considered**: a new `src/data/about.json` with the two sections copied
in (simplest; rejected as a second document about Joan that will drift); importing the
markdown through MDX (heavier, and it would render the whole document, not two
sections); moving the hero story to the KB reader as well (out of scope; `bio.json`
stays the source for hero, chess and reading text).

## 6. Motion mechanics

**Decision**:
- `<MotionConfig reducedMotion="user">` in a client provider around the page, so every
  Motion animation collapses to static when the visitor prefers reduced motion. The
  existing CSS `prefers-reduced-motion` block stays for the CSS keyframes.
- Hero: a `stagger.tsx` client leaf with `variants` on the parent and `staggerChildren:
  0.08`; children rise 8px and fade in over 0.5s with `ease: [0.16, 1, 0.3, 1]`. Reason:
  hierarchy. The orb, then the name, then the line, in that order.
- Sections: a `reveal.tsx` client leaf using `whileInView={{ opacity: 1, y: 0 }}` with
  `viewport={{ once: true, amount: 0.2 }}` and `initial={{ opacity: 0, y: 8 }}`. Reason:
  sequence. Once only, so scrolling back up does not replay.
- No JavaScript: Motion writes `opacity: 0` into the server HTML for anything with an
  `initial`, which would hide the page from a no-JS reader. Every animated wrapper gets
  `data-reveal`, and `globals.css` carries
  `<noscript>`-equivalent handling via a `.no-js` fallback: a `<noscript><style>` in
  `layout.tsx` sets `[data-reveal]{opacity:1!important;transform:none!important}`. Cheap,
  standard, and it makes FR-011 true rather than hoped.
- Hover: panels transition `border-color` to `--border-hover` and rise 1px over 200ms
  (`transition-[border-color,transform]`, never `transition: all`, per DESIGN.md). Links
  keep `underline-offset-4`. Buttons scale to 0.98 on `:active`.
- Nothing infinite is added. The background breathe (existing, 25s, opacity only) and the
  orb's own states stay.

**Rationale**: DESIGN.md's motion budget and Principle IV. The taste-skill's "motion must
be motivated" test is met sentence by sentence above.

**Alternatives considered**: CSS-only reveals with `animation-timeline: view()` (no
Safari on older iOS, and Joan asked for Motion specifically); IntersectionObserver by
hand (what the deleted `reveal-on-scroll.tsx` did; Motion does it with less code and
handles reduced motion for free); GSAP (overkill at intensity 4; the taste-skill reserves
it for pin/scrub work).

## 7. shadcn components

**Decision**: add `card`, `badge`, `accordion` and `separator` with
`bunx shadcn@latest add`. `components.json` is already base-nova with the project's
aliases. Each is customized through the tokens (radius from `--radius`, colors from
`--surface`/`--border`), never shipped in default state. `accordion` replaces the
hand-rolled `collapsible-section.tsx` for Beyond Code and Writing, which also brings
proper keyboard and ARIA handling from Base UI.

**Rationale**: Joan asked for shadcn; these four are the ones the sections need.

**Alternatives considered**: keeping the hand-rolled collapsible (works, but the
accordion is the accessible version of the same thing and one fewer thing to own);
adding `tabs` for active/past (hides the past list behind a click, which the spec's
"nothing hidden better" intent argues against).

## 8. `/chess` inherits the global tokens: a spec amendment

**Decision**: the new `:root` values apply site-wide. Nothing under `src/app/chess`,
`src/components/chess` or `src/lib/chess` is edited, and the `--chess-*` board tokens are
unchanged. The spec's FR-010 and SC-006 are amended from "renders identically" to "not
edited; inherits the global palette; board tokens unchanged; driven in the browser on
the new base to confirm the board still clears its lightness gaps and the page still
reads."

**Rationale**: `/chess` uses `--background`, `--foreground`, `--border` and
`--muted-foreground` throughout. Scoping the new palette to `/` would need either a
wrapper that paints over the html background and the fixed grain/gradient pseudo-elements
(fragile, and the two pages would look like two sites), or a route-group layout that
cannot set attributes on `<html>`. The warm-wood board on a neutral base is a warm object
on a neutral page, which is a reasonable relationship; the board's internal contrast
rule (piece-on-square gap ≥ 0.25) does not involve the page background at all.

**Alternatives considered**: scoped theme (rejected above); leaving the spec wording and
failing SC-006 (dishonest); redesigning `/chess` too (out of scope, and Joan said it is
untouched).

**Flagged to Joan** in the plan report so he can veto.

## 9. Measuring contrast

**Decision**: `scripts/design/check-contrast.ts` parses the `:root` block of
`globals.css`, converts each oklch token to sRGB, computes WCAG relative luminance and
the ratio for a fixed list of pairs (see `contracts/tokens.md`), prints a table, and
exits non-zero if any pair is under its threshold (4.5:1 for body and metadata text,
3:1 for large text and the border-on-background pair). Wired as `bun run
design:contrast`. `knip.jsonc`'s `entry` is widened to `scripts/**/*.ts` so knip knows
the script is a root.

**Rationale**: SC-005 and Principle I. A script survives the next token change; a
one-time check does not.

**Alternatives considered**: a browser devtools audit (manual, unrepeatable); a Lighthouse
run (it samples rendered pairs, which is useful as a second check in the browser drive but
not as the gate).

## 10. What changes in DESIGN.md, and why each line changes

| Section | Today | After | Why |
|---|---|---|---|
| Aesthetic Direction | "Warm, not cold." Reference: zuhair.io | "Neutral near-black with one warm accent." References: zuhair.io for voice; Linear and Vercel for surface and type | The brief's stated departure |
| Color Palette table | Warm charcoal values | Values from `contracts/tokens.md`; amber row unchanged | New base |
| Typography | Space Grotesk everywhere | Geist for text, Space Grotesk 600 for the name, Geist Mono for metadata; new scale | Joan's clarification |
| Section labels | 12px uppercase tracking-0.2em | Sentence-case `h2`, 24/28px medium, tight tracking; no eyebrows | The every-section eyebrow is the template rhythm being left behind |
| Spacing | "Compact. py-8 to py-16" | Sections `py-20 md:py-28`; measure 640px for prose, 960px for the project grid | Generous, disciplined spacing is most of the premium feel |
| Layout | Hero `min-h-[60dvh]` | Hero `min-h-[70dvh]`, still centered, orb above name | More air above the fold |
| Voice Orb | Glow amber radial | Unchanged | Signature element |
| Motion Budget | Hero stagger via CSS; scroll-reveal listed as opacity-only; scroll-down chevron | Hero stagger via Motion; section reveal returns as opacity + 8px rise, once, with a no-JS override; chevron line removed (it does not exist) | Matches what will be built |
| Background | Warm radial at 30% 0% | Faint amber radial at 50% 0%, roughly a third of today's strength; grain unchanged | One of the five accent uses |
| What This Site Is NOT | existing list | add: not an uppercase eyebrow above every section; not em-dashes as design elements | New rules worth writing down |
| Chess Board Tokens | unchanged | unchanged, with a note that the board now sits on a neutral base | §8 |

## 11. Second pass: intensity, after Joan saw the first preview

**What happened**: the first build was correct and quiet. Joan's words were "es muy
simple, es un front muy simple y malo; necesitamos más cosas, más llamativo". The
misread was mine: "Linear and Vercel" was taken as restraint (motion 4, variance 6)
when the brief's first sentence was "que se note la calidad, que se note muchísimo".

**Decision**: dials go to `DESIGN_VARIANCE 8`, `MOTION_INTENSITY 7`, `VISUAL_DENSITY 4`,
and the page gets things a visitor can see move or notice, each with a reason:

| Addition | Reason (taste-skill's test) | Content source |
|---|---|---|
| Amber aurora behind the hero, three blurred radials drifting on `transform` | atmosphere that ties the base to the orb; replaces the static radial | none needed |
| Name enters word by word, blur to sharp, 60ms apart | hierarchy: the name is the first thing | `bio.json` |
| Hero scales to 0.94 and fades as it scrolls out (`useScroll` + `useTransform`) | transition: hands off to the story | none |
| Scroll progress bar, 2px amber, top of page | orientation on a long page | none |
| Work as a bento: Verelyn wide, Flare and Privé, Inception wide | hierarchy: flagship, two products, the engine that funds them | `projects.json` |
| Spotlight border that follows the cursor on each panel (`useMotionValue`) | feedback: the panel under the pointer is the live one | none |
| One large mono number per panel, counting up on first view | emphasis; each number is in the panel's own description | `07:00`, `29 / 23 / 3`, `0%`, `500k`, all from `projects.json` |
| "How I got here": vertical timeline of all nine projects, line drawn by scroll progress | story: the order matters and the scroll is the reader's pace | `projects.json` dates and taglines |
| Stack marquee of real logos (Simple Icons, monochrome off-white), one per page | breadth at a glance; the definition grid below keeps the detail | names from `joan-kb.md` "Technical Identity" |
| Beyond code visible, Messi photo large in a split | the site's one real photograph was hidden in an accordion | existing content |
| Magnetic "Copy email" pill in the footer (`useMotionValue` + spring) | feedback on the one action the page asks for | existing |

**What does not change**: dark only, tokens only, one accent, sourced content,
reduced motion collapses everything to static, no JavaScript still shows the whole
page, `/chess` untouched, the orb untouched.

**Accent rule, revised**: "five places" was a budget for a quiet page. The rule now is
one chromatic accent and no second hue: amber may appear in the aurora, the progress
bar, the badges, the spotlight highlight, the large numbers, hover and focus, and the
email pill. Everything else stays neutral. DESIGN.md is amended to say this.

**DESIGN.md "What This Site Is NOT", revised**: "no blobs" stays for shapes drawn as
decoration; an atmospheric glow is not a blob. "No parallax" stays for background
layers moving at different speeds; a hero that scales as it leaves is a transition.

**Alternatives considered**: GSAP sticky-stack for the four projects (heavy for a
personal site, and pinning fights the reader on mobile); a 3D tilt on the panels
(cheap trick, and it breaks text legibility while moving); custom cursor (banned);
product screenshots in the bento (none exist; div-based fakes are the worst tell).
