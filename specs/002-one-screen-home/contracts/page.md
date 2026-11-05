# Contract: What the Page Shows

The visible contract of `/`, in document order. A test or a reviewer can check
each line against the rendered page.

## Structure

```text
<main>  h-dvh, overflow-hidden, flex, items-center
  <GridBackground/>            fixed, inset 0, z -1, aria-hidden; absent without WebGL
  <div data-reveal>            column, max-w 560px, centered, vignette behind
    <header> centered
      <button aria-label="Talk to Joan"> 56px orb (dynamic import, skeleton while loading)
      <p> label                "Talk to me" | "Requesting microphone…" | "Listening" |
                               "Joan is talking" | "Voice unavailable"
      <p> error detail         only in the error state, tertiary, one line
      <h1> Joan Mateo Duarte Politi
      <p> Co-founder of Catherby. Building an agentic operating system for a farm's back office.
    <ul> left-aligned
      <li> <span date> 2026–     <a>Catherby</a> — with Franco Quattroqui. Agents running a farm's back office.
      <li> <span date> 2026–     <a>Verelyn</a>, <a>Flare</a>, <a>Privé</a> — three products shipped this year. Two still earn.
      <li> <span date> 2020–26   <a>Inception Crypto</a> — started at 21, dropped out for it. 150 ASICs. It funded everything after.
      <li> <span date> 2022–26   <a>Stevay</a>, <a>DL3ARN</a>, <a>Clikan</a>, Aequsy, Bloorfy. The ones that didn't make it.
      <li> <span date> Argentine Math olympiads as a kid. Chess, still.
    <nav> centered              <a>GitHub</a> <a>LinkedIn</a> <a>X</a>
```

Row 2's date is `2026–` by derivation (see data-model.md); the mockup said
`2026`. Either is acceptable to the spec; the data-derived one ships unless Joan
overrides it with a row label.

## Links

| Text | href | color |
|---|---|---|
| Catherby | https://catherby.app/en | foreground |
| Verelyn | https://verelyn.com | foreground |
| Flare | https://heyflare.app | text-secondary (inactive) |
| Privé | https://heyprive.com | foreground |
| Inception Crypto | (the Drive folder in projects.json) | text-secondary (inactive) |
| Stevay | https://stevay.com | text-secondary |
| DL3ARN | https://dl3arn.vercel.app/ | text-secondary |
| Clikan | (App Store URL in projects.json) | text-secondary |
| GitHub, LinkedIn, X | the three URLs in today's footer | text-tertiary |

All external links: `target="_blank" rel="noreferrer"`. Underline in the link's
color at reduced alpha via `text-decoration-color`; hover sets it to `--primary`.

## States and motion

| Condition | Grid | Entrance | Label |
|---|---|---|---|
| default | slides, undulates, parallax | staggered, < 1.2s | Talk to me |
| session open | ripple amplitude follows output volume, floor 0.35 | done | state text, amber |
| reduced motion | one static frame, no parallax | none | as above |
| no WebGL | not rendered | as default | as above |
| orb module fails | not affected | as default | Talk to me (click does nothing) |
| JavaScript off | not rendered | `[data-reveal]` forced visible | Talk to me |

## Viewport

No document scroll at 1440×900, 1280×720, 390×844. Measured as
`document.documentElement.scrollHeight <= window.innerHeight` after fonts load.
At 390px the date column stacks above the fact.

## Metadata

- `<title>`: Joan Mateo Duarte Politi
- description: the positioning line
- OG/Twitter image: dark card, name and line in Geist Mono, 1200×630
