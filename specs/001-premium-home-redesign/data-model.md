# Data Model: Premium Home Page Redesign

No database. Three content sources, all already in the repository.

## Project

Source: `src/data/projects.json` (unchanged by this feature).

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, unique |
| `tagline` | string | required, one line |
| `description` | string | required; may be long (Verelyn is ~110 words) and is shown in full on active panels |
| `status` | `"active" \| "inactive"` | drives grouping: active → panel grid, inactive → compact list |
| `date` | string | shown as period, in Geist Mono |
| `logo` | string path | may 404; the initial-letter fallback stays |
| `link` | string \| null | when null, no link is rendered |
| `tags` | string[] | shown in Geist Mono, muted |

Nine projects today: four active (Verelyn, Flare, Privé, Inception), five inactive
(Stevay, DL3ARN, Clikan, Aequsy, Bloorfy). Order within each group is file order.

## Bio

Source: `src/data/bio.json`. One field changes.

| Field | Type | Change |
|---|---|---|
| `name` | string | none |
| `positioning` | string | none; hero line, ≤ 20 words |
| `story` | string[3] | `story[2]` corrected to agree with `joan-kb.md` (see `research.md` §5) |
| `chess` | `{ text, profileLink }` | none |
| `reading` | `{ text, favorites[], goodreadsLink }` | none |

Rule: where `bio.json` and `joan-kb.md` disagree, `joan-kb.md` wins and `bio.json` is
edited. `bio.json` is never edited to say something `joan-kb.md` does not.

## Knowledge base sections (read at build time)

Source: `joan-kb.md`, via `src/lib/kb.ts`.

```ts
type KbSections = {
  howIThink: string[];                 // paragraphs under "## How I Think", in order
  buildsWith: { label: string; value: string }[]; // bullets under "## Technical Identity",
                                       // split on the first ":" after the bold label
  buildsWithIntro: string;             // the sentence(s) between the heading and the list
};
```

Rules:
- Headings are matched exactly: `## How I Think`, `## Technical Identity`. A missing
  heading throws with the heading name in the message, so the build fails.
- Paragraphs are split on blank lines; markdown bold markers around the label are
  stripped; nothing else is transformed. Punctuation is kept as written.
- The reader runs during prerender of `/`. It must not be imported from a client
  component.

## Content traceability (SC-003)

Every rendered string on the page has one of these origins:

| Origin | Strings |
|---|---|
| `bio.json` | name, positioning, story (3), chess text, reading text and favorites |
| `projects.json` | every project field |
| `joan-kb.md` | "How I think" paragraphs; "What I build with" intro and pairs |
| `footer.tsx` | the contact line and link labels (existing, unchanged) |
| `writing.tsx` | the one post's title, description, date (existing, unchanged) |
| `beyond-code.tsx` | the Messi paragraph and the section headings (existing, unchanged) |
| section headings | "Work", "Active", "Past", "How I think", "What I build with", "Beyond code", "Writing" |

Nothing else may appear.
