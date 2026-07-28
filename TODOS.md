# TODOS

## Decide what the voice agent may say about Flare's traction
**Priority:** P2 | **Effort:** XS (a decision, not work)
**What:** `flare-product-kb.md` was rewritten from `flare-ios/docs/PRODUCT.md`, deliberately leaving out the internal numbers: registered and monthly-active account counts, the measured time-to-first-word baseline, and the monetization price points.
**Why:** The footer invites accelerators and investors, so the orb talks to exactly the people those numbers matter to. Early-stage counts can read as honest traction or as a liability depending on how they land, and that call is the founder's, not a default.
**Context:** The source numbers are in `flare-ios/docs/PRODUCT.md` under Principles (point 2) and Metrics. If they should be sayable, add them to the "Where It Is Today" section and re-run `./upload-kb.sh`.

---

## Done

- **Custom domain.** Decided: stay on `joanduarte.vercel.app`. `NEXT_PUBLIC_SITE_URL` is set to match across all three environments.
- **The "6 AI agents" claim.** It was wrong. Flare runs three — Spark, Mirror and Bond — per `flare-ios/docs/PRODUCT.md`. The whole knowledge base was rewritten against the V3 product doc, which had moved on further than the agent count: the atomic act is now a spoken check-in rather than a captured flare.
- **Overlapping Joan documents.** `joan-context-v1.md` and `joan-founder-kb.md` were merged into `joan-kb.md`. One document per subject.
- **OG image generation.** The routes existed but returned 500 in production: a 404'd Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted because Satori has no `inset` shorthand. Fixed; they now prerender as static.
