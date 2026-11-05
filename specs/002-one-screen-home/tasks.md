# Tasks: One-Screen Home

**Input**: Design documents from `/specs/002-one-screen-home/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tokens.md, contracts/page.md, quickstart.md

**Tests**: none requested. Verification is the browser pass in `quickstart.md`, plus `bun run check`, `bun run build` and `bun run design:contrast`.

**Organization**: by user story. US1 (one screen, no scroll) is the MVP and is the only story that deletes anything; US2 to US5 add to it. Every task names its file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 one screen · US2 orb · US3 grid · US4 entrance · US5 documents

## Path Conventions

Next.js App Router at repository root: `src/app/`, `src/components/`, `src/data/`, `scripts/`. Documents at root. Nothing under `src/app/chess`, `src/lib/chess`, `src/components/chess`, `scripts/chess` or `public/engine` is touched.

---

## Phase 1: Setup

**Purpose**: the one asset the rewrite needs that is not in the repo yet.

- [X] T001 Add `src/app/fonts/GeistMono-Regular.ttf` (Vercel Geist Mono, SIL OFL, from the Geist GitHub release; TTF, not woff2, because Satori needs it) and delete `src/app/fonts/SpaceGrotesk-SemiBold.ttf`

---

## Phase 2: Foundational

**Purpose**: the shell every story renders into. Nothing story-specific here.

- [X] T002 Rewrite `src/app/layout.tsx`: load only `Geist_Mono` (weights 400, 500) as `--font-geist-mono`; drop `Geist` and `Space_Grotesk`; set `metadata.title` to "Joan Mateo Duarte Politi" and `description`, `openGraph.description`, `twitter.description` to `bio.positioning`; keep `MotionProvider`, `Analytics` and the `<noscript>` rule for `[data-reveal]`; `<html>` className becomes `${geistMono.variable} dark antialiased bg-background`
- [X] T003 Trim `src/data/bio.json` to `{ "name", "positioning" }` with `positioning` = "Co-founder of Catherby. Building an agentic operating system for a farm's back office."
- [X] T004 Rewrite `src/app/globals.css` per `contracts/tokens.md`: keep `--background`, `--foreground`, `--text-secondary`, `--text-tertiary`, `--border`, `--primary`, `--primary-foreground`, `--ring` and the whole `--chess-*` block with its comment; remove `--surface`, `--muted*`, `--border-hover`, `--input`, `--spot`, `--orb-glow*`, `--secondary*`, `--accent*`, `--popover*`, `--card*`; `@theme inline` maps only the surviving tokens plus `--font-mono: var(--font-geist-mono)`; `html { font-family: var(--font-mono) }`; keep the grain `body::before`; delete `body::after` (amber radial) and `gradient-breathe`, `orb-breathe`, `orb-active`, `orb-connecting`, `fade-in-up`, `marquee`, `.animate-marquee`, `fade-in`; keep the `prefers-reduced-motion` block with the `[data-reveal]` rule; leave `@import "shadcn/tailwind.css"` and `--radius*` only if T017 finds a shadcn component still in use
- [X] T005 Rewrite `scripts/design/check-contrast.ts` `pairs` to the six rows in `contracts/tokens.md` and point its comment at `specs/002-one-screen-home/contracts/tokens.md`

**Checkpoint**: `bun run design:contrast` passes on the trimmed palette. The page itself is broken until US1 lands; that is expected.

---

## Phase 3: User Story 1 - A visitor reads the whole page without scrolling (Priority: P1) 🎯 MVP

**Goal**: one viewport, header + five fact rows + three links, Geist Mono, dark, nothing else. Old sections gone.

**Independent Test**: quickstart §1, §2, §3. No scrollbar at the three viewports; eleven links return 200; `bun run check` and `bun run build` pass with the old components deleted.

- [X] T006 [P] [US1] Create `src/components/facts.tsx`: export `FactRow` type `{ label?: string; projects: string[]; text: string }`, the five rows exactly as in `contracts/page.md`, a `dateLabel(row)` formatter per `data-model.md` (`"2026–present"` → `2026–`, `"2020–2026"` → `2020–26`, several projects → earliest start to latest end, two-digit end, `–` suffix if any is present), a project lookup from `src/data/projects.json` by `name` that throws `Error("facts: unknown project <name>")`, and a `Facts` component rendering `<ul>` with one `<li>` per row: `<span className="date">` in `--text-tertiary` (10ch, stacks above at `max-width: 480px`), project names as `<a target="_blank" rel="noreferrer">` in `--foreground` when `status === "active"` and `--text-secondary` otherwise, plain `<span>` when there is no `link`, names joined by ", ", then the row's `text` in `--text-secondary`
- [X] T007 [P] [US1] Create `src/components/home.tsx` (`"use client"`): `<main className="relative flex h-dvh items-center overflow-hidden px-6">`, a centered column `max-w-[560px]` with a `::before` vignette (`radial-gradient` of the background oklch at 0.92 → 0.6 at 55% → transparent 75%, `inset: -80px -120px`, `z-index: -1`), the header (orb slot and label as a placeholder `<p>` reading "Talk to me" until US2 wires it; `<h1>` 22px/500 "Joan Mateo Duarte Politi"; `<p>` `bio.positioning` in `--text-secondary` max 420px), `<Facts />`, and a centered `<nav>` with GitHub `https://github.com/JoanDuarte`, LinkedIn `https://www.linkedin.com/in/joanmateoduarte/`, X `https://x.com/jotyduarte` in `--text-tertiary`; body 15px, 14px under 480px; links underlined with `text-decoration-color` at the link color's reduced alpha, hover `--primary`
- [X] T008 [US1] Rewrite `src/app/page.tsx` to `export default function Page() { return <Home />; }` importing from `@/components/home`
- [X] T009 [US1] Delete `src/components/sections/` (all ten files), `src/components/motion/aurora.tsx`, `kinetic-text.tsx`, `magnetic.tsx`, `reveal.tsx`, `scroll-progress.tsx`, `spotlight-card.tsx`, `stagger.tsx`, `timeline-frame.tsx`, `src/components/copy-email-button.tsx`, `src/components/project-link.tsx`, `src/lib/kb.ts`, `public/images/messi.png`, `public/images/messi-og.jpg`, `public/logos/` (all ten PNGs); keep `src/components/motion/motion-provider.tsx` and `src/components/error-boundary.tsx`
- [X] T010 [US1] Edit `next.config.ts`: remove the `images.remotePatterns` block (Simple Icons) and its comment; set `outputFileTracingIncludes` to `"/opengraph-image": ["./src/app/fonts/**"]`, `"/twitter-image": ["./src/app/fonts/**"]`, `"/apple-icon": ["./public/images/joan-avatar.jpg"]`
- [X] T011 [US1] Run `bun run knip`; delete every file it reports unused (expected: `src/components/ui/accordion.tsx`, `badge.tsx`, `card.tsx`, `separator.tsx`, possibly `button.tsx` and `src/lib/utils.ts` depending on US2's orb rewrite order) and remove the dependencies it reports unused from `package.json` with `bun remove` (candidates: `lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `shadcn`, `@base-ui/react`, `tw-animate-css`, `@types/mdx` is NOT unused: the blog uses MDX); if `shadcn` goes, drop `@import "shadcn/tailwind.css"` and `@import "tw-animate-css"` from `globals.css` and delete `components.json`; add no knip exception
- [X] T012 [US1] Run `bun run check` and `bun run build`; fix what they report
- [X] T013 [US1] Browser pass per quickstart §2 and §3 in Orca at 1440×900, 1280×720, 390×844: `scrollHeight <= innerHeight` true at each, screenshots saved under `specs/002-one-screen-home/screenshots/` (`desktop.png`, `laptop.png`, `phone.png`), all eleven links 200

**Checkpoint**: the page is a complete, shippable text page. The orb slot shows the label only.

---

## Phase 4: User Story 2 - A visitor talks to the orb (Priority: P1)

**Goal**: the 56px orb above the name, label following the real session, output volume exposed for the grid.

**Independent Test**: quickstart §4. Label passes idle → requesting → listening → talking → idle; "Voice unavailable" on denied mic; page still fits.

- [X] T014 [US2] Rewrite `src/components/voice-orb.tsx`: keep the `Conversation.startSession` wiring, `OrbStatus`, `getAgentState`, the secure-context and rate-limit handling and the unmount cleanup; export `type OrbStatus` and `VoiceOrb({ onStatusChange, activityRef }: { onStatusChange: (s: OrbStatus, detail?: string) => void; activityRef: React.RefObject<number> })`; render a single `<button type="button" aria-label="Talk to Joan" className="h-14 w-14 rounded-full focus-visible:outline-2 focus-visible:outline-ring">` containing `<Orb colors={["#a86a37","#f1d2a4"]} agentState getInputVolume getOutputVolume />`; while status is `listening` or `talking`, a `requestAnimationFrame` loop writes `activityRef.current = Math.max(0.35, conversation.getOutputVolume())`, and `0` otherwise (loop cancelled on status change and unmount); remove the pill, avatar `Image`, `Button`, lucide icons, the helper copy and `getStatusLabel` (the label moves to `home.tsx`); export `OrbSkeleton` as a 56px disc in `--primary` at 0.25 opacity; `OrbFallback` becomes the same disc, used when `agentId` is missing
- [X] T015 [US2] Wire the orb in `src/components/home.tsx`: `const [status, setStatus] = useState<OrbStatus>("idle")`, `const [detail, setDetail] = useState<string|null>(null)`, `const activityRef = useRef(0)`; `dynamic(() => import("@/components/voice-orb").then(m => m.VoiceOrb), { ssr: false, loading: OrbSkeleton })` inside `<ErrorBoundary fallback={<OrbSkeleton />}>`; label text from status per research §10 (`idle` → "Talk to me", `connecting` → "Requesting microphone…", `listening` → "Listening", `talking` → "Joan is talking", `error` → "Voice unavailable"); label in `--text-tertiary`, `--foreground` on button hover, `--primary` while `listening`/`talking`; `detail` rendered under the label in `--text-tertiary` 13px only when status is `error`, one line, truncated with `text-overflow: ellipsis`
- [X] T016 [US2] (kept: `apple-icon.tsx` reads it) Delete `public/images/joan-avatar.jpg` only if `src/app/apple-icon.tsx` does not read it (it does today; if so, keep it and leave `outputFileTracingIncludes` for `/apple-icon` as set in T010); remove `NEXT_PUBLIC_ELEVENLABS_AVATAR_IMAGE_URL` handling from `voice-orb.tsx`
- [X] T017 [US2] Run `bun run knip`; delete `src/components/ui/button.tsx` and `src/lib/utils.ts` if now unreferenced, and apply the `shadcn`/`tw-animate-css`/`components.json` cleanup from T011 if it was deferred
- [ ] T018 [US2] Browser pass per quickstart §4 with a live microphone; confirm label transitions and that the error state still fits the viewport at 390×844 — *partly done: idle → "Requesting microphone…" → "Voice unavailable" ("Permission denied") verified in Orca, which has no microphone; the listening/talking path is Joan's check on the preview*

**Checkpoint**: US1 + US2 is the page Joan approved minus the grid and the entrance.

---

## Phase 5: User Story 3 - The background moves without getting in the way (Priority: P2)

**Goal**: the wireframe grid, seamless loop, parallax, ripple from `activityRef`, static under reduced motion, absent without WebGL.

**Independent Test**: quickstart §5. Sixty seconds with no seam; parallax settles; tab switch resumes without a jump; reduced motion freezes it; no WebGL leaves the flat page.

- [X] T019 [US3] Create `src/components/grid-background.tsx` (`"use client"`): export `GridBackground({ activityRef }: { activityRef: React.RefObject<number> })`; on mount check `typeof WebGLRenderingContext !== "undefined"` and `document.createElement("canvas").getContext("webgl")` once; return `null` if either fails; otherwise render `<div aria-hidden className="pointer-events-none fixed inset-0 -z-10">` with an R3F `<Canvas camera={{ fov: 60, near: 0.1, far: 400, position: [0, 4, 40] }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]} frameloop={reduced ? "never" : "always"}>` and a `<GridScene>` child; line color read from `getComputedStyle(document.documentElement).getPropertyValue("--foreground")` at mount and parsed with `new THREE.Color().setStyle(...)` (three supports oklch strings; fall back to `#d9d9dc` if parsing throws)
- [X] T020 [US3] In the same file, `GridScene`: `PlaneGeometry(400, 400, 80, 80)` rotated `-π/2` at `y = -8`, `MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.12, color })`, `scene.fog = new THREE.Fog(background, 20, 180)`; keep a copy of the base positions; in `useFrame((state, delta) => …)`: `t += Math.min(delta, 0.05)`, `slide = (t * 4) % 5`, `mesh.position.z = slide`, for every vertex `yWorld = yBase - slide`, `z = sin(x*0.08 + t*0.4)*1.2 + cos(yWorld*0.1 + t*0.3)*1.2 + amp * sin(hypot(x, yWorld)*0.3 - t*5)*2.5` where `amp += (activityRef.current - amp) * 0.05`, `material.opacity = 0.12 + amp*0.12`, `positions.needsUpdate = true`; camera rotation lerps 4%/frame toward `(-pointer.y*0.04, -pointer.x*0.06)` where `pointer` is `[-1,1]` from a `pointermove` listener on `window` and resets to `(0,0)` on `pointerleave`/`blur`; under `useReducedMotion()` call `invalidate()` once after mount and skip the frame body (wave at `t = 0`, no parallax)
- [X] T021 [US3] Mount it in `src/components/home.tsx` as `<ErrorBoundary fallback={null}><GridBackground activityRef={activityRef} /></ErrorBoundary>` as the first child of `<main>`; confirm `src/components/error-boundary.tsx` accepts a `fallback` prop (add one if it only renders a fixed message)
- [X] T022 [US3] (seam and tab-switch checked by construction and by 1s screenshot diffs with Playwright; reduced motion and no-WebGL verified) Browser pass per quickstart §5: one-minute watch, parallax, tab switch, reduced motion, WebGL disabled; note frame timing from the Orca console if anything stutters

**Checkpoint**: the mockup, rebuilt.

---

## Phase 6: User Story 4 - The page arrives in order (Priority: P3)

**Goal**: staggered fade-and-rise on load; instant under reduced motion and without JavaScript.

**Independent Test**: quickstart §6.

- [X] T023 [US4] In `src/components/home.tsx` wrap the column in `motion.div` with variants `container: { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }` and each of the following in `motion.div`/`motion.li` with `item: { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }`: the orb+label block, `h1`, the positioning line, each `<li>` (pass `motion` into `Facts` via a `renderRow` prop or make `Facts` accept `itemVariants`), the `nav`; `initial="hidden" animate="show"`; every animated element carries `data-reveal` so the reduced-motion CSS and the `<noscript>` rule force it visible
- [X] T024 [US4] Browser pass per quickstart §6 twice: motion allowed (sequence ≈ 1s, final layout identical to static) and reduced motion (nothing moves)

---

## Phase 7: User Story 5 - The repository tells the truth about the page (Priority: P3)

**Goal**: documents, metadata and release entry match the shipped page.

**Independent Test**: quickstart §7 and §8.

- [X] T025 [P] [US5] Rewrite `src/app/og-card.tsx`: read `src/app/fonts/GeistMono-Regular.ttf`; 1200×630 `#141418`-equivalent of `--background` (Satori needs hex: `#1b1b1e` is `oklch(0.145 0.004 260)` rounded; state the source in a comment), name at 56px/400 in `#ededf0`, positioning line at 28px in `#b3b3b8`, left-aligned at 96px padding, no photo, no gradient; update `alt` in `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx` to "Joan Mateo Duarte Politi"
- [X] T026 [P] [US5] Rewrite `DESIGN.md` from scratch (same file, no second document): what the page is and why (two paragraphs, pointing at the spec), the palette table from `contracts/tokens.md`, typography (Geist Mono only, the sizes), layout (one column 560px, centered header, left-aligned facts, centered links, no scroll at the three viewports), the grid (what it is, the loop rule, the ripple, the degrade), motion (entrance, grid, orb; reduced motion), the orb (56px, label states), and a rewritten "What This Site Is NOT" (not scrollable, not a card grid, not two typefaces, not decorated beyond the grid, not a second hue, not quiet in the sense of lifeless: the grid and the orb are what moves)
- [X] T027 [P] [US5] Update `README.md`: "Architecture" list to the new files (`page.tsx`, `home.tsx`, `facts.tsx`, `grid-background.tsx`, `voice-orb.tsx`, `ui/orb.tsx`, `motion/motion-provider.tsx`, `error-boundary.tsx`, `globals.css`, `og-card.tsx`, `check-contrast.ts`), delete mentions of sections, `kb.ts`, copy-email, shadcn components that were removed; keep the chess and blog sections untouched
- [X] T028 [P] [US5] Update `AGENTS.md`: first paragraph ("a single page that fits one screen"), "Where things live" table to the new files, remove the `src/components/sections/` row, keep the chess rows (out of scope here), keep the managed Spec Kit block
- [X] T029 [US5] Run `/speckit-constitution` with this amendment (MINOR, 1.2.0 → 1.3.0): in Principle IV replace the "What This Site Is NOT" examples with the new list's items and drop "centered-everything"; in Technology and Content Constraints replace "Measure" with "one column of 560px, centered; the page fits one viewport at 1440×900, 1280×720 and 390×844; nothing breaks out"; remove the Space Grotesk and aurora mentions wherever they appear; Sync Impact Report states the reason (the page was rebuilt as one screen on 2026-11-05 and the layout rules described the previous page)
- [X] T030 [US5] Bump `VERSION` to `1.0.0` and add the `CHANGELOG.md` entry: Removed (every section, the motion helpers, the shadcn components, Space Grotesk and Geist Sans, the Messi assets and project logos, `kb.ts`, the email button, the amber radial and the grain's companions), Added (the one-screen layout, the grid, the entrance, the orb label), Changed (tokens, OG card, documents), with the reasoning in the spec's first section condensed to a paragraph and the verification (contrast numbers, three viewports, one-minute grid watch)
- [X] T031 [US5] Run quickstart §7 (OG PNGs, title) and §8 (no stale paths in the four documents)

---

## Phase 8: Polish

- [X] T032 Run the full `quickstart.md` once more on the final branch; paste the contrast table, the three `scrollHeight` results and the three screenshots into the PR description
- [X] T033 Open the PR to `main` titled "Rebuild the home page as one screen" with a body that says what went and why, what was tried in the mockup and rejected (point field, floating glyphs, serif, the pill button under the tagline, the stuttering local-space wave), and the recommendation to merge `joanduarte-com-and-retire-chess` first

---

## Dependencies

```text
T001 ─┐
T002 ─┤
T003 ─┼─▶ US1 (T006, T007 parallel → T008 → T009 → T010 → T011 → T012 → T013)
T004 ─┤        │
T005 ─┘        ▼
          US2 (T014 → T015 → T016 → T017 → T018)
               │
               ▼
          US3 (T019 → T020 → T021 → T022)      US5 docs (T025–T028) can start after US1
               │                                      │
               ▼                                      ▼
          US4 (T023 → T024)  ────────────────▶  T029 → T030 → T031 → T032 → T033
```

- US2 depends on US1 only for `home.tsx` existing; its `voice-orb.tsx` rewrite (T014) can start any time after T004.
- US3 depends on US2 for `activityRef` (T015); the grid file itself (T019, T020) can be written earlier against the prop type.
- US4 touches only `home.tsx` and `facts.tsx`; do it after US3 so the grid mount is not reshuffled twice.
- US5's T025–T028 only need the file layout settled (after T011). T029 and T030 go last so they describe what shipped.

## Parallel Execution Examples

- After Phase 2: T006 and T007 (two new files).
- After T011: T025, T026, T027, T028 (four documents) alongside T014.
- T019/T020 can be drafted while T018's browser pass runs.

## Implementation Strategy

1. **MVP = US1**: a text page that fits one screen, with the old site deleted. It is already a better page than today's and can ship alone.
2. **US2** turns the label into the real orb. Ship point two.
3. **US3 + US4** are the finish: the grid and the entrance. Verify each in the browser before moving on; the constitution's Principle II is the gate.
4. **US5** closes the release: documents, constitution, version.

Each checkpoint runs `bun run check` and `bun run build`. Commits are Joan's; the suggested titles are "Replace the home page with one screen", "Put the orb above the name with a live label", "Draw the grid behind the page", "Stagger the page in", "Rewrite the documents for the one-screen page".
