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
- **Extend live engine commentary to `tactic` and `move` recommendations, not just
  `done`/`out`.** The post-Italian audit (see README, "How good the book actually
  is") found the worst blunders (-1165cp, -678cp) hiding inside `tactic` picks
  (`bestSafeCapture` choosing a capture that's safe but not best) and even plain
  `move` recommendations (`c3`, `Ad3` losing hundreds of cp to a pawn break SEE
  can't see). The engine layer currently stays silent whenever the book has an
  opinion at all, by design — extending it to grade those too is the concrete next
  step, now that the audit has located exactly where it would help most.

---

## Done

- **Traction numbers in the voice agent.** Decided: the orb states no numbers. Registered and active account counts, the time-to-first-word baseline, and monetization price points stay out of `flare-product-kb.md`. If that ever changes, the source is `flare-ios/docs/PRODUCT.md` (Principles point 2, and Metrics); add them to "Where It Is Today" and re-run `./upload-kb.sh`.
- **Custom domain.** Decided: stay on `joanduarte.vercel.app`. `NEXT_PUBLIC_SITE_URL` is set to match across all three environments.
- **The "6 AI agents" claim.** It was wrong. Flare runs three — Spark, Mirror and Bond — per `flare-ios/docs/PRODUCT.md`. The whole knowledge base was rewritten against the V3 product doc, which had moved on further than the agent count: the atomic act is now a spoken check-in rather than a captured flare.
- **Overlapping Joan documents.** `joan-context-v1.md` and `joan-founder-kb.md` were merged into `joan-kb.md`. One document per subject.
- **OG image generation.** The routes existed but returned 500 in production: a 404'd Google Fonts URL, an unreachable `metadataBase`, and an overlay that never painted because Satori has no `inset` shorthand. Fixed; they now prerender as static.
