# Quickstart: verifying the one-screen home

Everything here is what "done" means for this feature. Run it on the branch
before opening the PR, and paste the numbers and screenshots into the PR body.

## Prerequisites

```bash
bun install
vercel env pull .env.local     # NEXT_PUBLIC_ELEVENLABS_AGENT_ID, NEXT_PUBLIC_SITE_URL
bun dev                        # http://localhost:3000
```

## 1. Gates

```bash
bun run check                  # eslint + tsc + knip, zero findings, no new knip exceptions
bun run build                  # must pass: layout, OG routes, fonts
bun run design:contrast        # every pair ≥ its min; copy the table into the PR
```

## 2. Fits one viewport

Open http://localhost:3000 in Orca's browser and run at each size:

```bash
orca viewport --width 1440 --height 900 --json && orca reload --json
orca eval --expression "document.documentElement.scrollHeight <= window.innerHeight" --json   # true
orca screenshot --json

orca viewport --width 1280 --height 720 --json && orca reload --json
orca eval --expression "document.documentElement.scrollHeight <= window.innerHeight" --json   # true
orca screenshot --json

orca viewport --width 390 --height 844 --scale 3 --mobile --json && orca reload --json
orca eval --expression "document.documentElement.scrollHeight <= window.innerHeight" --json   # true
orca screenshot --json
```

Expected: `true` three times, no clipped text, date column stacked above the
fact on the phone size.

## 3. Links

```bash
for u in $(orca eval --expression "JSON.stringify([...document.querySelectorAll('a')].map(a=>a.href))" --json | jq -r '.result | fromjson[]'); do
  printf "%s -> " "$u"; curl -s -o /dev/null -L -m 15 -A Mozilla/5.0 -w "%{http_code}\n" "$u"
done
```

Expected: 200 for all eleven (eight projects, three socials).

## 4. The orb

With a microphone, at desktop size:

1. Label reads "Talk to me".
2. Click the orb. Label: "Requesting microphone…" then "Listening", in amber.
3. Ask "What is Catherby?". Label: "Joan is talking" while the agent speaks.
   The grid ripples visibly more than idle.
4. Click again. Label returns to "Talk to me"; the grid settles within ~2s.
5. Deny the microphone in a fresh tab: label "Voice unavailable" with one line
   of detail under it; the page still fits the viewport.

## 5. The grid

1. Watch for 60 seconds at desktop size: no seam, jump or restart.
2. Move the pointer across the window: the view shifts slightly; move it out:
   it settles to center.
3. Switch tabs for 30 seconds, come back: no jump.
4. `orca emulate media --reduced-motion` (or OS setting) and reload: grid still,
   no parallax, everything visible on first paint.
5. Disable WebGL (Chrome: `--disable-webgl`, or
   `orca eval --expression "HTMLCanvasElement.prototype.getContext=()=>null"`
   before the page mounts) and reload: same layout, flat background, no console
   error shown to the user.

## 6. Entrance

Reload with motion allowed: orb and label, name, line, five rows, links appear
top to bottom; the sequence finishes in about a second; the final layout is
identical to the static one.

## 7. Metadata

```bash
curl -s http://localhost:3000/opengraph-image -o /tmp/og.png && file /tmp/og.png   # PNG 1200x630
curl -s http://localhost:3000/twitter-image -o /tmp/tw.png && file /tmp/tw.png
curl -s http://localhost:3000 | grep -o '<title>[^<]*'                              # Joan Mateo Duarte Politi
```

Open the PNGs: dark card, name and line in Geist Mono, no photo.

## 8. Documents

`DESIGN.md`, `.specify/memory/constitution.md`, `README.md`, `AGENTS.md`
mention no file that no longer exists:

```bash
for f in DESIGN.md README.md AGENTS.md .specify/memory/constitution.md; do
  grep -oE 'src/[A-Za-z0-9_./-]+' "$f" | sort -u | while read p; do [ -e "$p" ] || echo "$f: $p missing"; done
done
```

Expected: no output (paths under `/chess` still exist on this branch).
