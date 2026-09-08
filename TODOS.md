# TODOS

- **Measure the chess page against its own baseline after 50 rapid games.** The
  targets are on `/chess`: unused clock in losses from 426s to under 300, and won
  positions thrown away from 40% to under 20%. Rating is the consequence, not the
  target. As of 2026-08-21 the last rapid game was 2026-08-04, so the count has not
  started. If 50 games pass with no movement in either number, the diagnosis was
  wrong and the page should change, not the effort.
- **Decided, not deferred: keep the Indian/Pirc setup for Black.** The earlier
  version of this item asked whether to switch away from it. Researched instead —
  coaching sources are consistent that this setup needs more judgment than most
  beginner defenses specifically because it's hypermodern (you have to know *when*
  to strike back with `...e5`/`...c5`; played passively it "breaks quickly"). That's
  exactly the skill the live engine layer added in 0.4.0 is for, so the fix for the
  setup's known weak point is the coaching, not a different opening. Still worth
  re-checking the repertoire-adherence number at the 50-game mark above.

---

## Done

- **Live engine commentary on `tactic` and `move` recommendations.** Done in
  0.4.2.0, and it turned out to matter more than the audit suggested: the same
  blind spot that hid those blunders (`bestSafeCapture` picking a capture that's
  safe on its square and nowhere else) also let the book get mated —
  `1.e4 e5 2.Cf3 Ac5 3.Cxe5 Dh4 4.Ac4?? Dxf2#`. Two fixes, deliberately in that
  order: the book itself now sees mate in one without any engine (one move
  generation, works offline, works if Stockfish never loads), and on top of that
  Stockfish became the authority outright — it runs from move one and names the
  move in every position. The plan no longer votes; it annotates, showing what it
  wanted and how far off it was so leaving the repertoire stays his call.
  `verify-no-forced-mate.ts` and `verify-no-hanging.ts` are the regression tests,
  and driving the real page in a browser is what caught the last two bugs — the
  explanation describing a different move than the one recommended, and the
  closing paragraph reprinting on every move of the middlegame. Neither was
  visible from tests or types.
- **Traction numbers in the voice agent.** Decided: the orb states no numbers. Registered and active account counts, the time-to-first-word baseline, and monetization price points stay out of `flare-product-kb.md`. If that ever changes, the source is `flare-ios/docs/PRODUCT.md` (Principles point 2, and Metrics); add them to "Where It Is Today" and re-run `./upload-kb.sh`.
- **Custom domain.** Decided: stay on `joanduarte.vercel.app`. `NEXT_PUBLIC_SITE_URL` is set to match across all three environments.
- **The "6 AI agents" claim.** It was wrong. Flare runs three — Spark, Mirror and Bond — per `flare-ios/docs/PRODUCT.md`. The whole knowledge base was rewritten against the V3 product doc, which had moved on further than the agent count: the atomic act is now a spoken check-in rather than a captured flare.
- **Overlapping Joan documents.** `joan-context-v1.md` and `joan-founder-kb.md` were merged into `joan-kb.md`. One document per subject.
- **OG image generation.** The routes existed but returned 500 in production: a 404'd Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted because Satori has no `inset` shorthand. Fixed; they now prerender as static.
