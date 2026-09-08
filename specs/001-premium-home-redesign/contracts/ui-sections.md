# Contract: UI Sections

Page order, top to bottom. "Family" is the layout family, and no family repeats.

| # | Section | Component | Source | Family | Motion | Mobile (< 768px) |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero.tsx` | `bio.json` name, positioning | centered stack, orb above name | stagger: orb → name → line (0.08s apart) | same stack, orb 80px |
| 2 | Story | `story.tsx` | `bio.json` story (3 paragraphs, `[2]` corrected) | single column prose, 640px, 65ch | reveal once | same |
| 3 | Work | `work.tsx` | `projects.json` | "Active": 2x2 panel grid at 960px; "Past": compact list under one heading, one divider, expandable detail | reveal once per group; panel hover border + 1px rise | grid → 1 column; list unchanged |
| 4 | How I think | `how-i-think.tsx` | `joan-kb.md` "How I Think" | single column prose, 640px | reveal once | same |
| 5 | What I build with | `builds-with.tsx` | `joan-kb.md` "Technical Identity" | intro line + 2-column definition grid (label in Geist Mono, value in Geist) | reveal once | 1 column, label above value |
| 6 | Beyond code / Writing | `beyond-code.tsx`, `writing.tsx` | existing content | accordion (shadcn), collapsed by default | accordion open/close only | same |
| 7 | Footer | `footer.tsx` | existing content | single line + icon row | none | same |

## Per-section rules

**Hero**: max 3 text elements (name, positioning, and the orb's own label). No eyebrow, no
tagline strip, no scroll cue. `min-h-[70dvh]`, `pt` at most `pt-24`. The orb keeps its
dynamic import, `OrbSkeleton` loading state and `ErrorBoundary`.

**Story**: directly under the hero so the first screen flows into it. `text-[16px]
md:text-[17px] leading-[1.7] text-muted-foreground`.

**Work**: heading "Work" as `h2`. Sub-headings "Active" and "Past" as `h3` in
`text-[13px] font-medium text-text-tertiary` (sentence case, no tracking). Active panels:
`Card` from shadcn with `bg-surface border-border rounded-[var(--radius)]`, logo 28px,
name, tagline, period + tags in mono, full description, link. `Badge` "Active" in amber
text on `--primary/10`. Past list: name, tagline, period; a `Accordion`-style expand for
the description and link. Exactly four panels for four active projects; no empty cell.

**How I think**: heading "How I think". Paragraphs verbatim from the KB, punctuation as
written.

**What I build with**: heading "What I build with". Intro sentence verbatim. Grid rows:
label (`Mobile`, `Frontend`, …) in mono `text-[12px] text-text-tertiary`; value in
`text-[15px] text-muted-foreground`.

**Accordion**: `AccordionTrigger` text is the section name in the same style as the
"Active"/"Past" sub-headings. Content unchanged from today.

**Footer**: content unchanged. Icons unchanged.

## Global rules

- One `h1` (the name). Section titles are `h2`. Group titles are `h3`.
- Zero uppercase-tracking eyebrows on the page.
- Zero em-dashes in anything designed (labels, separators, captions). Quoted KB text
  keeps its own punctuation.
- Every animated wrapper carries `data-reveal`; the `<noscript>` style makes them visible.
- Tap targets ≥ 44px; `focus-visible` ring from `--ring`.
- `transition-[border-color,transform]`, never `transition-all`.
