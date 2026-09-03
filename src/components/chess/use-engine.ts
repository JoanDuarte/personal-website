"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getEngine, type EngineEval } from "@/lib/chess/engine";

const DEPTH = 12;

/**
 * Evaluates every position in `fens` once the engine is ready, caching each one
 * so repeats (undo, transpositions) don't re-run the search and so a caller can
 * look back at the position *before* the last move to grade it.
 *
 * It takes a list rather than one position because the trainer needs two: the
 * position on the board, and the position the book's own recommendation would
 * produce. Comparing those two is what turns "the engine talks once the book
 * runs out" into "the engine checks the book before you play it".
 *
 * Never throws: a failed or unavailable engine just means positions never
 * resolve, and the book + SEE safety net keeps working exactly as it does
 * without this hook — the engine is a layer on top, never a requirement.
 *
 * Resolved evals live in state, not a ref: reading a ref's `.current` while
 * computing render output can tear under concurrent rendering, so everything
 * this hook returns comes from `useState`. Only the in-flight-request guard —
 * touched exclusively inside the effect, never returned — is a plain ref.
 */
export function useEngine(fens: (string | null | undefined)[]) {
  const [cache, setCache] = useState<Record<string, EngineEval>>({});
  const [unavailable, setUnavailable] = useState(false);
  const inFlight = useRef(new Set<string>());

  // A stable string, so passing a fresh array every render doesn't re-run the
  // effect just because the array identity changed.
  const key = fens.filter(Boolean).join("|");

  useEffect(() => {
    if (unavailable) return;
    for (const fen of key.split("|")) {
      if (!fen || cache[fen] || inFlight.current.has(fen)) continue;
      inFlight.current.add(fen);
      getEngine()
        .evaluate(fen, DEPTH)
        .then((result) => {
          setCache((prev) => ({ ...prev, [fen]: result }));
        })
        .catch(() => {
          setUnavailable(true);
        })
        .finally(() => {
          inFlight.current.delete(fen);
        });
    }
  }, [key, cache, unavailable]);

  return useMemo(
    () => ({
      /** Resolved eval for any previously-seen FEN, or undefined if not (yet) known. */
      get: (f: string | null | undefined) => (f ? cache[f] : undefined),
      unavailable,
    }),
    [cache, unavailable]
  );
}
