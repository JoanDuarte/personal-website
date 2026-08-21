# TODOS

- **Measure the chess page against its own baseline after 50 rapid games.** The
  targets are on `/chess`: unused clock in losses from 426s to under 300, and won
  positions thrown away from 40% to under 20%. Rating is the consequence, not the
  target. As of 2026-08-21 the last rapid game was 2026-08-04, so the count has not
  started. If 50 games pass with no movement in either number, the diagnosis was
  wrong and the page should change, not the effort.
- **Revisit `1...e5` vs the Indian setup at that same checkpoint.** The case for
  switching rests on 38% over 94 games; the case against is that open positions
  teach calculation. The repertoire adherence metric on the page is what settles it.

---

## Done

- **Traction numbers in the voice agent.** Decided: the orb states no numbers. Registered and active account counts, the time-to-first-word baseline, and monetization price points stay out of `flare-product-kb.md`. If that ever changes, the source is `flare-ios/docs/PRODUCT.md` (Principles point 2, and Metrics); add them to "Where It Is Today" and re-run `./upload-kb.sh`.
- **Custom domain.** Decided: stay on `joanduarte.vercel.app`. `NEXT_PUBLIC_SITE_URL` is set to match across all three environments.
- **The "6 AI agents" claim.** It was wrong. Flare runs three — Spark, Mirror and Bond — per `flare-ios/docs/PRODUCT.md`. The whole knowledge base was rewritten against the V3 product doc, which had moved on further than the agent count: the atomic act is now a spoken check-in rather than a captured flare.
- **Overlapping Joan documents.** `joan-context-v1.md` and `joan-founder-kb.md` were merged into `joan-kb.md`. One document per subject.
- **OG image generation.** The routes existed but returned 500 in production: a 404'd Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted because Satori has no `inset` shorthand. Fixed; they now prerender as static.
