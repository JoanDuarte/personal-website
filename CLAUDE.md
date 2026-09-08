@AGENTS.md

## Claude Code

Everything that matters is in `AGENTS.md`, imported above. This file only adds what
is specific to Claude Code.

**Skill routing.** When a request matches one of these, invoke the skill first
rather than answering ad hoc:

- A feature to build → `/speckit-specify` (it creates the branch). Ambiguous shape →
  `/speckit-clarify` before `/speckit-plan`.
- A bug report, a 500, "why is this broken" → `/speckit-bug-assess`, then
  `/speckit-bug-fix` and `/speckit-bug-test`.
- An idea, "is this worth building" → `/speckit-assess-intake` and the rest of the
  assess pipeline, ending in `/speckit-assess-decide`.
- A change to how the project is governed → `/speckit-constitution`.
- Visual or UI work → the `design-taste-frontend` skill, with `DESIGN.md` winning any
  disagreement.

**Skills on disk.** `.claude/skills/` holds spec-kit's Claude copies of its skills and
symlinks into `.agents/skills/` for everything else. Do not edit either by hand;
reinstall instead (`specify extension add <id> --force`, `npx skills add <repo>`).

**Local state.** `.claude/settings.local.json` is gitignored. Nothing else under
`.claude/` should hold credentials.
