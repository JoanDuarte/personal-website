# Data Model: One-Screen Home

Three things carry data on the page. None is stored; all are build-time or
in-memory.

## Project (existing, `src/data/projects.json`)

Unchanged shape. Fields the page reads:

| Field | Type | Used for |
|---|---|---|
| `name` | string | lookup key from a fact row; the link text |
| `date` | `"YYYY"` \| `"YYYY–YYYY"` \| `"YYYY–present"` | the row's date label |
| `status` | `"active"` \| `"inactive"` | link color (primary vs. secondary) |
| `link` | string, optional | the href; absent → plain text |

`logo`, `tags`, `tagline`, `description` are not read by the page any more. They
stay in the file: JSON fields are invisible to knip, the voice agent's knowledge
base is a separate document, and deleting prose that may come back costs more
than keeping it. The constitution's one-document rule is about documents, not
fields.

**Validation**: a fact row naming a project that is not in the file throws at
build time with the name.

## FactRow (new, `src/components/facts.tsx`)

```text
FactRow
  label?: string              literal date column (only the last row: "Argentine")
  projects: string[]          names, in display order; may be empty
  text: string                the sentence after the names (may start with "—")
```

The five rows, as approved in the spec (FR-004). Derived at build time:

- `dateLabel`: `label` if present; otherwise from the referenced projects'
  `date` fields: parse each into `[start, end | null]`, take the earliest start
  and the latest end; render `start–` if any end is `present`, `start` if start
  equals end, else `start–YY`.
- Each project name renders as a link when `link` exists, in `--foreground` when
  `status === "active"` and `--text-secondary` otherwise; names without a link
  render as text. Separator between names: `", "`.

Expected output, which doubles as the check:

| Row | projects | dateLabel |
|---|---|---|
| 1 | Catherby | `2026–` |
| 2 | Verelyn, Flare, Privé | `2026–` (Verelyn and Privé are `present`) |
| 3 | Inception Crypto | `2020–26` |
| 4 | Stevay, DL3ARN, Clikan, Aequsy, Bloorfy | `2022–26` |
| 5 | (none, label "Argentine") | `Argentine` |

Note on row 2: the spec's mockup showed `2026`; the data says two of the three
are still live, so the derived label is `2026–`. That is the data telling the
truth, and the spec's FR-006 says data wins. If Joan prefers `2026` the fix is
a `label` on the row, not a change to the formatter.

## SessionStatus (in-memory, `home.tsx`)

```text
SessionStatus = "idle" | "connecting" | "listening" | "talking" | "error"
```

Transitions (all driven by the orb component's callbacks):

```text
idle ──click──▶ connecting ──onConnect──▶ listening ◀──onModeChange──▶ talking
                    │                          │                          │
                    └──onError/catch──▶ error  └──click/onDisconnect──▶ idle
error ──click──▶ connecting
```

Derived values:

- `label`: see research §10.
- `activity` (ref, 0..1): `0` when idle/connecting/error; otherwise
  `max(0.35, getOutputVolume())`, smoothed by the grid at ~5% per frame.
- `entrance`: runs once on mount, independent of status.
