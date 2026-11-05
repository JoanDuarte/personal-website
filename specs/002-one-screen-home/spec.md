# Feature Specification: One-Screen Home

**Feature Branch**: `002-one-screen-home`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Rebuild the home page as a single screen with no scroll: a minimal text page over a subtle 3D wireframe grid, with the ElevenLabs voice orb as the one built thing. Joan wants to throw the current design system away. The current page reads as an AI-made portfolio template. He wants the minimalism of danielgross.com and ben.bolte.cc/about, but fears a bare page reads to an investor as 'this person can't code'. The resolution: minimal but crafted, with the voice orb as the proof of craft, and a restrained 3D background. One viewport, no scrolling. Centered header (orb, 'Talk to me' label that follows the session, name, one line), left-aligned list of dated facts with links, centered social links. Wireframe grid in perspective that loops without a seam and ripples when the orb is listening or talking. Subtle staggered entrance. Monospace throughout. DESIGN.md rewritten from scratch, constitution amended, dead sections deleted, VERSION 1.0.0. /chess and the domain change are a separate PR."

## How this spec came to be

Joan opened the session saying he wanted to fix the site and did not like what
`DESIGN.md` described. The conversation went through three things worth keeping
here, because they are the reasoning behind every requirement below.

The references were danielgross.com and ben.bolte.cc/about: a handful of lines
and links, nothing else. The worry was that the same page, with Joan's
credentials rather than theirs, would read to an investor as "this person can't
code". The agreed answer was not decoration but craft in three places: a real
typographic decision, facts with nouns and links, and one built thing that works.
The built thing is the voice orb, which the current site already has and which
neither reference does.

A throwaway mockup (`mockup.html` next to this file, plain HTML with three.js from
a CDN, not code to keep) was driven in a browser and iterated with Joan. He chose
the wireframe grid over a point field and over floating glyphs; he noticed the
grid's loop stuttering and it was fixed by computing the wave in world space; he
asked for the orb above the name with a label that changes, for the header and
the social links to be centered with the facts list left-aligned, for "Rosario"
to become "Argentine", and for the email to go. The last thing he asked for was a
subtle staggered entrance. He approved the result: "Espectacular. Me encantó."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor reads the whole page without scrolling (Priority: P1)

Someone opens joanduarte.com on a laptop or a phone. Everything there is to read
fits on the screen they are looking at: who Joan is in one line, five dated facts
with links to the things they name, and three places to find him. Nothing asks
them to scroll, and there is nothing below the fold. The page is dark, set in a
monospace face, and reads like a document someone wrote rather than a product
someone marketed.

**Why this priority**: This is the feature. The rest of the stories are what keeps
it from being a bare page.

**Independent Test**: Open the page at a laptop size, a small laptop size and a
phone size. No scrollbar appears, nothing is clipped, every link resolves.

**Acceptance Scenarios**:

1. **Given** a desktop viewport of 1440×900 or 1280×720, **When** the page
   loads, **Then** every element listed in FR-002 through FR-004 is visible at
   once and the document is not scrollable.
2. **Given** a phone viewport of 390×844, **When** the page loads, **Then** the
   same holds, with the date column allowed to move above its fact rather than
   beside it.
3. **Given** any viewport, **When** the visitor clicks a project name, **Then**
   it opens the URL recorded for that project in the repository's project data.

---

### User Story 2 - A visitor talks to the orb (Priority: P1)

Above the name there is a small orb with the words "Talk to me" under it. The
visitor clicks it, the browser asks for the microphone, the label changes to say
what is happening, and a voice that knows Joan's story answers questions about
him, his projects and his stack, since that content is no longer printed on the
page. While it listens and talks, the background responds to it.

**Why this priority**: The orb is the answer to the "can't code" worry. Without
it the page is the bare page Joan was afraid of.

**Independent Test**: Click the orb with a working microphone. The label passes
through the connecting and listening states, the agent answers a question about
Catherby, and the grid behind the text visibly moves more while it does.

**Acceptance Scenarios**:

1. **Given** the page is idle, **When** nothing has been clicked, **Then** the
   label under the orb reads "Talk to me".
2. **Given** the visitor clicks the orb, **When** the microphone permission is
   pending, **Then** the label says so; **When** the session is listening, the
   label says "Listening"; **When** the agent speaks, the label says "Joan is
   talking".
3. **Given** the session is listening or talking, **When** the visitor looks at
   the background, **Then** the grid ripples in a way it does not while idle.
4. **Given** the voice service fails to connect or the microphone is denied,
   **When** the failure happens, **Then** the label reads "Voice unavailable",
   the page is otherwise unchanged, and the visitor can try again.

---

### User Story 3 - The background moves without getting in the way (Priority: P2)

Behind the text, a faint wireframe grid recedes into darkness, slides slowly
toward the viewer and undulates. It never catches the eye on its own, never
stutters or visibly restarts, and shifts slightly as the pointer moves. On a
machine or browser without 3D support, or for a visitor who has asked their
system for less motion, the page shows the same text over a plain dark
background and loses nothing.

**Why this priority**: It is what separates this page from a plain text file,
but the page has to be complete without it.

**Independent Test**: Watch the grid for a full minute: no seam or jump. Reload
with reduced motion enabled: the grid is still. Disable 3D in the browser: the
page reads identically on a flat background.

**Acceptance Scenarios**:

1. **Given** the page is open, **When** one minute passes, **Then** the grid's
   motion has shown no visible discontinuity.
2. **Given** the operating system prefers reduced motion, **When** the page
   loads, **Then** the grid does not slide, undulate or follow the pointer, and
   nothing on the page animates in.
3. **Given** 3D rendering is unavailable, **When** the page loads, **Then** the
   text renders over the plain background with the same layout and contrast.

---

### User Story 4 - The page arrives in order (Priority: P3)

On load, the elements appear one after another from top to bottom: the orb and
its label, the name, the line under it, each fact, the links. The sequence is
short and quiet, a fade and a small rise, and it never happens for a visitor who
asked for reduced motion.

**Why this priority**: Joan asked for it last, as a finish, and it is the one
place the page can show motion craft without competing with the grid.

**Independent Test**: Reload the page and watch; the sequence completes within
about a second and the final layout matches the static page exactly.

**Acceptance Scenarios**:

1. **Given** a fresh load with motion allowed, **When** the page appears,
   **Then** elements fade in top to bottom with a small upward movement, the
   whole sequence finishing in under 1.5 seconds, with no overshoot.
2. **Given** reduced motion is preferred, **When** the page loads, **Then** all
   elements are present immediately.

---

### User Story 5 - The repository tells the truth about the page (Priority: P3)

Someone opening the repository, human or agent, reads a design document that
describes this page and not the previous one, a constitution whose layout rules
match it, a README and agent instructions that point at files that exist, a
changelog entry that says what was removed and why, and a social-card preview
that looks like the page.

**Why this priority**: The constitution makes documents binding; a document that
describes a page that no longer exists would mislead the next change.

**Independent Test**: Read `DESIGN.md`, the constitution, `README.md` and
`AGENTS.md`; every path and rule they mention exists and holds. Share the URL in
a chat client; the preview card matches the page.

**Acceptance Scenarios**:

1. **Given** the feature is merged, **When** `DESIGN.md` is read, **Then** it
   describes only this page and contains no reference to sections, fonts or
   tokens that no longer exist.
2. **Given** the feature is merged, **When** the constitution is read, **Then**
   the 640px/960px measure rule, the "Not quiet" and "Not centered-everything"
   prohibitions, and the Space Grotesk and aurora mentions are gone, and the
   five principles are unchanged.
3. **Given** the site URL is pasted into a chat client, **When** the preview
   renders, **Then** its title, description and card match the new page.

### Edge Cases

- A short, wide viewport (for example 1280×600) is below the heights listed in
  SC-001; the page may scroll there. Nothing may be clipped or overlap.
- The visitor's browser blocks the microphone outright: the label shows "Voice
  unavailable" and the orb can be clicked again later.
- The voice service's script never loads: the orb's placeholder and the label
  still render, the label stays "Talk to me", and clicking does nothing harmful.
- A project in the data has no URL (Aequsy, Bloorfy): its name is plain text in
  the same row, not a dead link.
- A project's recorded URL is a long third-party link (Inception Crypto's is a
  shared folder): it is linked as recorded; the spec does not invent a better
  destination.
- The pointer leaves the window: the parallax settles back to center rather than
  freezing at the edge.
- The tab is in the background: the grid may pause; it must resume without a
  visible jump.

## Requirements *(mandatory)*

### Functional Requirements

**Layout and content**

- **FR-001**: The home page MUST fit within one viewport, with no document
  scrolling, at 1440×900, 1280×720 and 390×844 CSS pixels.
- **FR-002**: The page MUST show, in this order and nothing else: the orb with
  its label; the name "Joan Mateo Duarte Politi"; the line "Co-founder of
  Catherby. Building an agentic operating system for a farm's back office."; a
  list of five fact rows; a row of three links (GitHub, LinkedIn, X).
- **FR-003**: The orb, label, name and positioning line MUST be horizontally
  centered. The fact list MUST be left-aligned within the same column. The three
  social links MUST be centered.
- **FR-004**: The five fact rows MUST read, with the date in a dim column before
  the fact:
  1. "2026–" Catherby — with Franco Quattroqui. Agents running a farm's back office.
  2. "2026" Verelyn, Flare, Privé — three products shipped this year. Two still earn.
  3. "2020–26" Inception Crypto — started at 21, dropped out for it. 150 ASICs. It funded everything after.
  4. "2022–26" Stevay, DL3ARN, Clikan, Aequsy, Bloorfy. The ones that didn't make it.
  5. "Argentine" Math olympiads as a kid. Chess, still.
- **FR-005**: Every project name that has a URL in the repository's project data
  MUST be a link to that URL. Catherby, Verelyn, Flare, Privé and Inception
  Crypto are linked in the primary text color; Stevay, DL3ARN and Clikan are
  linked in the secondary text color with a dimmer underline; Aequsy and
  Bloorfy are plain text.
- **FR-006**: Dates MUST come from the project data, not be typed into the page.
- **FR-007**: The page MUST NOT show an email address, a navigation bar, a
  footer line, a copyright notice, story paragraphs, a stack list, photos, a
  reading list or a writing section. That content remains reachable through the
  orb, whose knowledge base is unchanged by this feature.
- **FR-008**: All text MUST be set in the monospace face the site already loads.
  The name MAY be slightly larger than the body; no second typeface is used.

**Orb**

- **FR-009**: The orb MUST be the existing voice component, rendered at about
  56px, above the name.
- **FR-010**: A label directly under the orb MUST read "Talk to me" when idle
  and follow the session's real state: requesting the microphone, listening,
  Joan talking, and voice unavailable, using the state names the component
  already has.
- **FR-011**: The orb MUST remain usable when the background cannot render, and
  the page MUST remain readable when the orb's service never loads (Principle
  III).

**Background**

- **FR-012**: Behind the content, a wireframe grid plane in perspective MUST
  recede into fog, drawn in the primary text color at low opacity (about 0.12)
  so it never competes with the text.
- **FR-013**: The grid MUST slide continuously toward the viewer and undulate
  slowly, and the loop MUST be seamless: no visible seam, jump or restart over
  at least one minute of observation.
- **FR-014**: The camera MUST shift slightly with the pointer, and settle to
  center when the pointer leaves.
- **FR-015**: While the orb session is listening or talking, the grid MUST
  ripple with visibly more amplitude than when idle; when the session ends, it
  MUST return to the idle motion.
- **FR-016**: A soft darkening behind the text block MUST keep the text's
  measured contrast above the thresholds in Principle IV regardless of the grid
  behind it.
- **FR-017**: If 3D rendering is unavailable or fails at any point, the page
  MUST show the plain dark background with identical layout and no error
  visible to the visitor.
- **FR-018**: Under a reduced-motion preference, the grid MUST be static: no
  slide, no undulation, no parallax.

**Entrance**

- **FR-019**: On load with motion allowed, elements MUST appear in a staggered
  top-to-bottom sequence (orb and label, name, line, each fact row, links) using
  opacity and a small upward translation only, with no overshoot, completing in
  under 1.5 seconds.
- **FR-020**: Under a reduced-motion preference, there MUST be no entrance
  animation; everything is present on first paint.
- **FR-021**: The grid, the orb and the entrance MUST be the only motion on the
  page.

**Color**

- **FR-022**: The palette MUST shrink to: one background, three text greys
  (primary, secondary, tertiary), one opaque border, and the existing amber
  accent reserved for the orb and the active-state label. Every pair MUST be
  measured by the repository's contrast script and clear its thresholds.

**Documents and metadata**

- **FR-023**: `DESIGN.md` MUST be rewritten from scratch to describe this page
  and only this page. No second design document is created (Principle V).
- **FR-024**: The constitution MUST be amended through its own procedure so that
  the 640px/960px measure, the "Not quiet" and "Not centered-everything" items,
  and the Space Grotesk and aurora references are removed; principles I–V stay.
- **FR-025**: `README.md` and `AGENTS.md` MUST describe the new file layout and
  page, with no reference to files this feature deletes.
- **FR-026**: `VERSION` MUST become `1.0.0` and `CHANGELOG.md` MUST gain an
  entry that says what was removed, why, and how the result was checked.
- **FR-027**: The page title, description and social-preview card MUST be
  updated to match the new page; the preview routes MUST keep working in
  production.

**Removal**

- **FR-028**: Every section component, motion helper, data field, icon set and
  UI component that has no caller after the rewrite MUST be deleted, and the
  unused-code gate MUST pass with no new exceptions.
- **FR-029**: The `/chess` route, its code, and the domain configuration are out
  of scope; they are not touched by this feature.

### Key Entities

- **Fact row**: a date label and a sentence, with zero or more project
  references; each reference resolves to a project's name and optional URL in
  the project data.
- **Project** (existing data): name, date range, status, optional URL. This
  feature reads it; it does not change its shape.
- **Orb session state**: idle, requesting microphone, listening, talking,
  unavailable. Drives the label text and the grid's ripple amplitude.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At 1440×900, 1280×720 and 390×844, the page shows no scrollbar
  and no clipped or overlapping element, checked in a real browser and recorded
  with screenshots in the pull request.
- **SC-002**: Every project link on the page returns a successful response when
  followed, for the eight projects that have a URL.
- **SC-003**: Clicking the orb with a working microphone reaches the listening
  state and produces a spoken answer about Catherby; the label text is observed
  to change at each state.
- **SC-004**: Over sixty seconds of observation, the grid shows zero visible
  seams or restarts.
- **SC-005**: With reduced motion enabled, nothing on the page moves on load or
  over time except the orb's own idle rendering.
- **SC-006**: With 3D rendering disabled, the page's layout and text are
  pixel-identical to the normal render except for the missing grid.
- **SC-007**: Every text-on-background pair in the new palette clears the
  contrast thresholds in the repository's script, and the numbers are quoted in
  the pull request.
- **SC-008**: The lint, type and unused-code gate and the production build both
  pass with no new exceptions.
- **SC-009**: After the rewrite, the home page ships no section, motion helper
  or data field that nothing renders.
- **SC-010**: Joan looks at the deployed preview and does not ask for the
  previous page back.

## Assumptions

- The orb component's existing states and labels (requesting microphone,
  listening, Joan is talking, voice unavailable) are the ones the label under
  the orb shows; no new state is invented.
- The voice service exposes at least the session state; if it also exposes an
  output audio level, the grid's ripple may follow it, otherwise state alone
  drives it. Either satisfies FR-015.
- The 3D libraries the orb already depends on are what the grid uses; no
  dependency is added.
- The phone target is 390×844 with roughly 700px of usable height after browser
  chrome; the date column may stack above its fact there.
- Social link destinations are the ones currently on the site (GitHub,
  LinkedIn, X); the email link and copy-to-clipboard button are removed on
  purpose.
- The chess trainer and the joanduarte.com domain change are on the unmerged
  branch `joanduarte-com-and-retire-chess` and ship as their own pull request.
  This feature branches from `main` and does not touch `/chess`.
- The ElevenLabs agent prompt and the two knowledge-base documents do not change.
- The mockup next to this spec is the visual reference for layout, hierarchy
  and grid behaviour. Its code is not reused.
