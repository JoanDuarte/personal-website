# Research: One-Screen Home

Every unknown in the plan's Technical Context, resolved. Format: decision,
reasoning, what else was considered.

## 1. Where the grid's animation runs: CPU vertex update vs. vertex shader

**Decision**: CPU. Each frame, `useFrame` rewrites the `z` of the plane's
position attribute from the base grid (`PlaneGeometry(400, 400, 80, 80)`, 6,561
vertices) and flags it `needsUpdate`, exactly as the approved mockup does.

**Rationale**: it is the code that was already driven and approved, it is
readable at 3am, and 6.5k vertices a frame is nothing. The loop seam fix
(wave computed from world-space `y - slide`) is a one-line change there and a
uniform plumbing exercise in a shader.

**Alternatives**: a `ShaderMaterial` with `uTime`, `uSlide`, `uActivity`
uniforms, displacement in the vertex shader and distance fade in the fragment
shader. Cheaper per frame and no buffer upload, but needs manual fog, custom
wireframe handling and about twice the code. Move to it only if a phone shows
dropped frames (`ponytail:` ceiling: ~20k vertices or a measured frame time
over 8ms on an iPhone 12).

## 2. How the grid learns about the orb

**Decision**: `home.tsx` owns `status` (React state, drives the label and the
entrance) and `activityRef: RefObject<number>` (a mutable 0..1 the grid reads
every frame). The orb component receives `onStatusChange` and writes
`activityRef.current` from `conversation.getOutputVolume()` inside a
`requestAnimationFrame` loop while a session is open, with a floor of 0.35 when
the status is `listening` or `talking` so the ripple is visible between words.

**Rationale**: `@elevenlabs/client`'s `VoiceConversation` exposes
`getOutputVolume(): number` (verified in `node_modules/@elevenlabs/client/dist/VoiceConversation.d.ts`),
and `ui/orb.tsx` already polls it the same way. A ref keeps the grid off the
React render path; state only changes on status transitions.

**Alternatives**: a context or a tiny store. Two consumers and one owner do not
need either. Passing volume through React state at 60fps was rejected outright.

## 3. Loop seam

**Decision**: the mesh slides with `position.z = (t * speed) % cell`, where
`cell` is the plane's segment size (400 / 80 = 5), and the wave is computed from
world-space coordinates: `yWorld = yLocal - position.z`. Time accumulates from
`delta` clamped to 50ms, not from the clock, so a backgrounded tab resumes
without a jump.

**Rationale**: lines are periodic in `cell`, so the wrap is invisible as long as
nothing else is tied to local coordinates. The first mockup tied the wave to
local coordinates and Joan saw it stutter; the fix was verified in the second
mockup.

**Alternatives**: scrolling a texture or UV offset (no geometry motion, but no
real 3D undulation either); an infinitely long plane (wasteful).

## 4. Reduced motion and no WebGL

**Decision**: `useReducedMotion()` from `motion/react` gates the grid: when
true, the canvas renders one frame (`frameloop="never"` plus a single
`invalidate()`) with the wave at phase zero and no parallax. Before mounting,
`grid-background.tsx` checks `typeof WebGLRenderingContext !== "undefined"` and
tries `canvas.getContext("webgl")` once; on failure it returns `null`. The
component is wrapped in the existing `ErrorBoundary` with a `null` fallback for
anything that throws later. The page's background color is the body's; the
canvas only adds lines.

**Rationale**: Principle III. The mockup's vignette behind the text is kept as a
CSS radial on the text block so contrast does not depend on the canvas.

**Alternatives**: a static PNG of the grid as the fallback. Rejected: it would
be a second thing to keep in sync, and the page without lines is the design
Joan's references use anyway.

## 5. Entrance animation

**Decision**: `motion` variants on `home.tsx`: a parent with
`staggerChildren: 0.06`, children `initial {opacity: 0, y: 8}` to
`{opacity: 1, y: 0}`, `duration 0.5`, `ease: [0.22, 1, 0.36, 1]`. Order: orb +
label, name, line, each fact row, links. Total under 1.2s. The existing
`MotionProvider` (`reducedMotion="user"`) makes it instant under reduced motion.
A `<noscript>` rule keeps `[data-reveal]` visible without JavaScript, as today.

**Rationale**: the spec's "subtle, no bounce"; one place for the policy.

**Alternatives**: CSS `@keyframes` with `animation-delay` per child. Fine too,
but Joan asked for `motion` by name and the provider is already there.

## 6. Typography

**Decision**: Geist Mono only, loaded through `next/font/google` with weights
400 and 500. Name at 22px/500, body 15px/400, line-height 1.6, phone 14px.
Space Grotesk and Geist are dropped from `layout.tsx`.

**Rationale**: the references are monospace or default serif; Joan chose mono in
the mockup (`T` toggled serif and he did not pick it). Geist Mono is already
loaded for metadata, so nothing new.

**Alternatives**: a serif (Iowan Old Style / Georgia) was in the mockup as the
alternative; not chosen.

## 7. The OG card

**Decision**: a dark card, name and positioning line in Geist Mono, no photo.
Satori needs a font file on disk; `next/font` does not expose one. Add
`src/app/fonts/GeistMono-Regular.ttf` (Vercel's Geist, SIL OFL) and delete the
Space Grotesk TTF. `outputFileTracingIncludes` lists the fonts dir only.

**Rationale**: FR-027, and Space Grotesk must not survive anywhere once the page
drops it. The Messi photo leaves with the "Beyond code" section.

**Alternatives**: keep the Space Grotesk file for the card only. Rejected: a
second typeface in the preview that is nowhere on the page.

## 8. Fact rows and dates

**Decision**: `facts.tsx` holds the five rows as data: each row names the
projects it references (looked up in `projects.json` by name, build-time) and
the trailing sentence. The date label is derived: for a row with projects, from
their `date` fields (`"2026–present"` → `2026–`; `"2020–2026"` → `2020–26`; a
set spanning several → `earliest start–latest end`, two-digit end). The last
row has a literal label (`Argentine`). A missing project name fails the build.

**Rationale**: FR-006 (dates from data) without changing `projects.json`'s
shape. The formatter is ten lines.

**Alternatives**: typing the dates into the page (rejected by the spec); adding
`start`/`end` fields to `projects.json` (more than needed).

## 9. Tokens

**Decision**: keep `--background`, `--foreground`, `--text-secondary`,
`--text-tertiary`, `--border`, `--primary`, `--primary-foreground`, `--ring`,
and the `--chess-*` block (used by `/chess`, out of scope). Remove `--surface`,
`--muted*`, `--spot`, `--orb-glow*`, `--border-hover`, `--input`, the shadcn
aliases (`--secondary`, `--accent`, `--popover`, `--card`) once their consumers
are gone, and the `@theme` lines that map them. The grid reads
`--foreground` at mount for its line color; the vignette is
`radial-gradient` of `--background` with alpha, declared in CSS.

**Rationale**: FR-022. shadcn's `tailwind.css` import stays only if a shadcn
component survives knip; otherwise it goes with them.

**Alternatives**: keeping the full shadcn token set "for later". Rejected:
YAGNI, and the constitution's knip rule is the same idea for CSS.

## 10. Label states

**Decision**: the label under the orb is rendered by `home.tsx` from `status`:
`idle → "Talk to me"`, `connecting → "Requesting microphone…"`,
`listening → "Listening"`, `talking → "Joan is talking"`,
`error → "Voice unavailable"`. Clicking during a session ends it. The label
turns amber (`--primary`) while a session is open. The orb's own error detail
string (rate-limit message etc.) is shown in tertiary text under the label only
in the `error` state, and the page must still fit the viewport with it.

**Rationale**: FR-010; these are the component's existing strings.
