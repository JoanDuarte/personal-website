"use client";

import { useEffect, useRef, useState } from "react";
import { getEngine, type EngineEval } from "@/lib/chess/engine";

const DEPTH = 12;

/**
 * Evaluates `fen` once the engine is ready, caching every position seen so
 * repeats (undo, transpositions) don't re-run the search and so a caller can
 * look back at the position *before* the last move to grade it.
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
export function useEngine(fen: string) {
  const [cache, setCache] = useState<Record<string, EngineEval>>({});
  const [unavailable, setUnavailable] = useState(false);
  const inFlight = useRef(new Set<string>());

  useEffect(() => {
    if (unavailable || cache[fen] || inFlight.current.has(fen)) return;
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
  }, [fen, cache, unavailable]);

  return {
    /** Resolved eval for any previously-seen FEN, or undefined if not (yet) known. */
    get: (f: string) => cache[f],
    /** Resolved eval for the FEN this hook was called with. */
    current: cache[fen],
    unavailable,
  };
}
