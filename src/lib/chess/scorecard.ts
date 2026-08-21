import type { GameAnalysis } from "./analyze";

/**
 * Kept apart from `analyze.ts` so the client can recompute it over a merged
 * window after an incremental sync without pulling the analysis engine in.
 * The import above is type-only, so nothing from that module ships here.
 */

export type Scorecard = {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number | null;
  /** Median seconds left on the clock in losses. Target: under 300. */
  timeLeftInLosses: number | null;
  /** Share of games he was up 3+ material and failed to win. Target: under 20%. */
  threwAwayRate: number | null;
  threwAway: number;
  wasWinning: number;
  hangsPerGame: number | null;
  missedPerGame: number | null;
  /** Share of games where he stayed in his repertoire past the book. */
  onBookRate: number | null;
};

const EMPTY: Scorecard = {
  games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  rating: null,
  timeLeftInLosses: null,
  threwAwayRate: null,
  threwAway: 0,
  wasWinning: 0,
  hangsPerGame: null,
  missedPerGame: null,
  onBookRate: null,
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function scorecard(games: GameAnalysis[]): Scorecard {
  if (games.length === 0) return EMPTY;

  const losses = games.filter((g) => g.result === "loss");
  const wasWinning = games.filter((g) => g.peakMaterial >= 300);
  const threwAway = wasWinning.filter((g) => g.result !== "win");
  const onBook = games.filter((g) => g.deviation === null);
  const newest = [...games].sort((a, b) => b.endTime - a.endTime)[0];

  return {
    games: games.length,
    wins: games.filter((g) => g.result === "win").length,
    losses: losses.length,
    draws: games.filter((g) => g.result === "draw").length,
    rating: newest.rating,
    timeLeftInLosses: median(
      losses.map((g) => g.timeLeft).filter((t): t is number => t != null)
    ),
    threwAwayRate:
      wasWinning.length > 0 ? threwAway.length / wasWinning.length : null,
    threwAway: threwAway.length,
    wasWinning: wasWinning.length,
    hangsPerGame:
      games.reduce((sum, g) => sum + g.hung.length, 0) / games.length,
    missedPerGame:
      games.reduce((sum, g) => sum + g.missed.length, 0) / games.length,
    onBookRate: onBook.length / games.length,
  };
}

/** Newest first, one entry per game, capped to the rolling window. */
export function mergeGames(
  incoming: GameAnalysis[],
  existing: GameAnalysis[],
  window: number
): GameAnalysis[] {
  const byUrl = new Map<string, GameAnalysis>();
  for (const game of [...existing, ...incoming]) byUrl.set(game.url, game);
  return [...byUrl.values()]
    .sort((a, b) => b.endTime - a.endTime)
    .slice(0, window);
}
