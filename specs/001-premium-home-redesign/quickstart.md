# Quickstart: validating the Premium Home Page Redesign

## Prerequisites

```bash
bun install
vercel env pull .env.local   # NEXT_PUBLIC_ELEVENLABS_AGENT_ID, NEXT_PUBLIC_SITE_URL
```

## Gates (all must exit 0)

```bash
bun run check              # lint + typecheck + knip
bun run design:contrast    # every pair in contracts/tokens.md at or above its minimum
bun run chess:verify       # globals.css is shared with /chess; run it even though no chess file changed
bun run build              # "/" must still print as ○ (Static)
```

Expected from `design:contrast` (measured 2026-09-08 on the ratified tokens):

```
--foreground on --background         16.11  min 4.5  PASS
--foreground on --surface            15.30  min 4.5  PASS
--muted-foreground on --background    7.41  min 4.5  PASS
--muted-foreground on --surface       7.04  min 4.5  PASS
--text-tertiary on --background       5.02  min 4.5  PASS
--text-tertiary on --surface          4.77  min 4.5  PASS
--primary on --background            11.62  min 4.5  PASS
--primary on --surface               11.04  min 4.5  PASS
--primary-foreground on --primary    11.62  min 4.5  PASS
--border on --background              1.31  info
OK
```

Any row under its minimum fails the command. `--text-tertiary` is the tightest pair;
its lightness is 0.60 for that reason and should not go lower.

## Browser drive (Principle II)

```bash
bun dev
```

Open `http://localhost:3000` and check, in this order:

1. **1440px wide.** The hero shows the orb, the name in Space Grotesk, the positioning
   line. The entrance is a short stagger. Scroll: Story, Work (four panels in a 2x2 grid,
   then the Past list), How I think, What I build with (two-column grid), the two accordion
   rows, the footer. Every section fades in once. Nothing bounces.
2. **Hover** an active panel: border lightens, panel rises 1px. Hover a link: amber
   underline.
3. **390px wide.** Single column everywhere; the 2x2 grid stacks; the definition grid
   stacks label over value; the orb is 80px; every tap target is at least 44px.
4. **Reduced motion.** DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`.
   Reload. Every section is visible immediately; no stagger, no reveal.
5. **JavaScript off.** DevTools → Settings → Debugger → Disable JavaScript. Reload. All
   text is visible (the `<noscript>` rule). The orb shows its placeholder.
6. **Accent audit.** Count where amber appears: orb glow, Active badges, link/button
   hover, focus ring (Tab through the page), the faint radial at the top. Five. Anywhere
   else is a defect.
7. **Eyebrow audit.** No uppercase wide-tracking labels anywhere.
8. **Tap the orb.** The session starts, or the placeholder holds if the service is blocked.
9. **`/chess`.** Open it. The board's warm woods sit on the neutral base; pieces are
   legible on both square colors at the rendered size; the panels and text read on the
   new background. Nothing in the trainer changed behavior.
10. **`/blog/building-with-conviction`.** Renders; type is Geist now.

## Content audit (SC-003)

For each rendered string, find its source line in `bio.json`, `projects.json`,
`joan-kb.md`, or the existing `footer.tsx` / `writing.tsx` / `beyond-code.tsx`. The
table in `data-model.md` lists the allowed origins. `bio.json` `story[2]` and the
metadata `description` in `layout.tsx` must name Verelyn, Flare and Privé.

## Preview

Push the branch. Vercel builds a preview; compare it side by side with
`https://joanduarte.vercel.app`.
