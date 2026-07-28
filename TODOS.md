# TODOS

Nothing open.

---

## Done

- **Traction numbers in the voice agent.** Decided: the orb states no numbers. Registered and active account counts, the time-to-first-word baseline, and monetization price points stay out of `flare-product-kb.md`. If that ever changes, the source is `flare-ios/docs/PRODUCT.md` (Principles point 2, and Metrics); add them to "Where It Is Today" and re-run `./upload-kb.sh`.
- **Custom domain.** Decided: stay on `joanduarte.vercel.app`. `NEXT_PUBLIC_SITE_URL` is set to match across all three environments.
- **The "6 AI agents" claim.** It was wrong. Flare runs three — Spark, Mirror and Bond — per `flare-ios/docs/PRODUCT.md`. The whole knowledge base was rewritten against the V3 product doc, which had moved on further than the agent count: the atomic act is now a spoken check-in rather than a captured flare.
- **Overlapping Joan documents.** `joan-context-v1.md` and `joan-founder-kb.md` were merged into `joan-kb.md`. One document per subject.
- **OG image generation.** The routes existed but returned 500 in production: a 404'd Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted because Satori has no `inset` shorthand. Fixed; they now prerender as static.
