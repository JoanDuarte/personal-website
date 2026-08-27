/**
 * Where a game is: opening, midgame, or endgame. Decoupled from whether the
 * repertoire book still has an opinion — a free capture on move 30 doesn't
 * retroactively make it "still the opening".
 *
 * The move-10 cutoff isn't arbitrary: it's the same one from Joan's original
 * diagnostic ("en la jugada 10 está en +56cp de media... el derrumbe es entre
 * la jugada 11 y la 40"), already familiar from the page copy. "Final" fires
 * on queens off the board — the classic, teachable signal — or move 30 as a
 * floor for games that drag on with queens still up.
 */
export type Phase = "apertura" | "medio-juego" | "final";

const OPENING_CEILING = 10;
const ENDGAME_FLOOR = 30;

export function gamePhase(moveNumber: number, fen: string): Phase {
  if (moveNumber <= OPENING_CEILING) return "apertura";
  const board = fen.split(" ")[0];
  const noQueens = !/[qQ]/.test(board);
  return noQueens || moveNumber >= ENDGAME_FLOOR ? "final" : "medio-juego";
}

export const PHASE_LABEL: Record<Phase, string> = {
  apertura: "Apertura",
  "medio-juego": "Medio juego",
  final: "Final",
};

// --- Move quality, from the engine eval before and after a move ------------
//
// Lichess's public formula (https://lichess.org/page/accuracy): convert
// centipawns to win probability first, then grade the *drop* in win%, not the
// raw centipawn loss. That's the point of doing it this way — losing 300cp in
// an equal position is a disaster; losing 300cp in a position already won by
// a rook barely moves the needle. A flat centipawn threshold can't tell those
// apart; a win% threshold naturally does, because both scores are already
// squashed toward the same end once a position is decided.

export function winPercent(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function accuracy(cpBefore: number, cpAfter: number): number {
  const drop = winPercent(cpBefore) - winPercent(cpAfter);
  return 103.1668 * Math.exp(-0.04354 * drop) - 3.1669;
}

export type MoveQuality =
  | "excelente"
  | "buena"
  | "imprecisión"
  | "error"
  | "blunder";

/**
 * Buckets by win% drop rather than Lichess's exact (unpublished) internal
 * thresholds — these are chosen to land close to how their own labels feel,
 * not copied from a source that doesn't exist publicly.
 */
export function moveQuality(cpBefore: number, cpAfter: number): MoveQuality {
  const drop = winPercent(cpBefore) - winPercent(cpAfter);
  if (drop < 2) return "excelente";
  if (drop < 5) return "buena";
  if (drop < 10) return "imprecisión";
  if (drop < 20) return "error";
  return "blunder";
}

export const QUALITY_TONE: Record<MoveQuality, "good" | "neutral" | "bad"> = {
  excelente: "good",
  buena: "good",
  imprecisión: "neutral",
  error: "bad",
  blunder: "bad",
};
