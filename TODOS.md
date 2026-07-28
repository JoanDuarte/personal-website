# TODOS

## Custom domain
**Priority:** P2 | **Effort:** S
**What:** Attach a real domain. The site is live at `joanduarte.vercel.app`; the docs used to claim `jmduarte.com`, which does not exist on the Vercel account.
**Why:** A vercel.app URL reads as unfinished on a site whose whole job is to be a founder's calling card.
**Context:** Buy and attach it in Vercel, then update `NEXT_PUBLIC_SITE_URL` in all three environments. That variable is the `metadataBase` for every link preview, so a domain change that skips it silently breaks OG images again. Also update the references in `README.md` and `DESIGN.md`.

## Verify the "6 AI agents" claim
**Priority:** P3 | **Effort:** XS
**What:** `flare-product-kb.md` and `joan-context-v1.md` both state Flare runs 6 named agents (Mirror, Lens, Identity, Orb, Bond, Pulse).
**Why:** The voice agent repeats these numbers to strangers, so a stale count is a small credibility leak. The table and Edge Function counts in the same paragraph were both wrong until recently.
**Context:** Agents are rows in an `agents` table in `flare-ios` rather than hardcoded, so the count could not be confirmed from source. Only `bond`, `mirror` and `orb` appear as string literals in the Edge Functions. Query the live table to confirm.

## Decide whether Joan Context and Joan Founder should both ship
**Priority:** P3 | **Effort:** XS
**What:** `joan-context-v1.md` and `joan-founder-kb.md` are both uploaded to the agent and overlap heavily on the founder story.
**Why:** Overlapping documents can pull retrieval toward whichever phrasing wins, which is not necessarily the better one.
**Context:** They do serve different needs — the context doc carries voice, uncertainties, reading and hobbies that the founder doc omits. If it turns out to be redundant, drop the entry from the `DOCS` array in `upload-kb.sh` and re-run.

---

## Done

- **OG image generation.** The routes existed but returned 500 in production: a 404'd
  Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted
  because Satori has no `inset` shorthand. Fixed; they now prerender as static.
