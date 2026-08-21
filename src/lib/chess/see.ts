import { Chess, type Move, type Square } from "chess.js";

export const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 300,
  b: 320,
  r: 500,
  q: 900,
  k: 20000,
};

/** A capture sequence the side to move can start on `square`, and what it nets. */
export type Exchange = {
  square: Square;
  /** Net centipawns won by the side to move. Never negative. */
  value: number;
  /** The move that starts the sequence. */
  move: { from: Square; to: Square; san: string; promotion?: string };
};

/**
 * Static exchange evaluation: the material the side to move nets by starting a
 * capture sequence on `square`, assuming both sides always recapture with their
 * least valuable attacker and either side may stop when continuing would lose.
 *
 * chess.js only generates legal moves, so a pinned defender correctly cannot
 * recapture. That makes this stricter than textbook SEE, which ignores pins and
 * would overvalue the defence.
 *
 * Mutates and restores `chess`.
 */
function exchangeValue(chess: Chess, square: Square): number {
  const captures = chess
    .moves({ verbose: true })
    .filter((m) => m.to === square && m.captured);
  if (captures.length === 0) return 0;

  captures.sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece]);
  const first = captures[0];
  const gain = PIECE_VALUE[first.captured as string];

  chess.move({ from: first.from, to: first.to, promotion: first.promotion });
  const recapture = exchangeValue(chess, square);
  chess.undo();

  return Math.max(0, gain - recapture);
}

/**
 * The best material-winning capture available to the side to move, or null when
 * every capture on the board is an even trade or worse.
 */
export function bestExchange(fen: string): Exchange | null {
  const chess = new Chess(fen);
  const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
  const squares = [...new Set(captures.map((m) => m.to))];

  let best: Exchange | null = null;
  for (const square of squares) {
    const value = exchangeValue(chess, square);
    if (value <= 0 || (best && value <= best.value)) continue;

    const starters = captures.filter((m) => m.to === square);
    starters.sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece]);
    const m = starters[0];
    best = {
      square,
      value,
      move: { from: m.from, to: m.to, san: m.san, promotion: m.promotion },
    };
  }
  return best;
}

/** Net material a specific capture nets, accounting for the recapture sequence. */
export function moveNetValue(
  fen: string,
  move: { from: Square; to: Square; promotion?: string; captured?: string }
): number {
  if (!move.captured) return 0;
  const chess = new Chess(fen);
  chess.move({ from: move.from, to: move.to, promotion: move.promotion });
  const recapture = exchangeValue(chess, move.to);
  return PIECE_VALUE[move.captured] - recapture;
}

/**
 * Every capture that nets at least `threshold`. Used to grade a puzzle: more
 * than one move can be equally good, and marking a correct alternative wrong
 * teaches the wrong lesson.
 */
export function winningCaptures(fen: string, threshold: number): Move[] {
  const chess = new Chess(fen);
  return chess
    .moves({ verbose: true })
    .filter((m) => m.captured && moveNetValue(fen, m) >= threshold);
}

/**
 * The same position with the other side to move. Used to ask "what could the
 * opponent win if it were their turn right now", which is the only way to tell
 * whether a candidate move *creates* a threat or merely fails to solve one that
 * already existed.
 *
 * Returns null when the flip would be illegal — that is, when the side that
 * would stop moving is in check.
 */
export function flipTurn(fen: string): string | null {
  const parts = fen.split(" ");
  parts[1] = parts[1] === "w" ? "b" : "w";
  parts[3] = "-"; // an en passant target does not survive the flip
  try {
    // If the side to move is currently in check, flipping would leave the side
    // *not* to move in check. That position is illegal and its capture search
    // would be meaningless.
    if (new Chess(fen).isCheck()) return null;
    const flipped = parts.join(" ");
    new Chess(flipped);
    return flipped;
  } catch {
    return null;
  }
}

/** Material totals in centipawns, kings excluded. */
export function material(fen: string): { w: number; b: number } {
  const board = fen.split(" ")[0];
  let w = 0;
  let b = 0;
  for (const ch of board) {
    const value = PIECE_VALUE[ch.toLowerCase()];
    if (!value || value === PIECE_VALUE.k) continue;
    if (ch === ch.toUpperCase()) w += value;
    else b += value;
  }
  return { w, b };
}

/** Human name for a piece letter, in Spanish. */
export const PIECE_NAME_ES: Record<string, string> = {
  p: "peón",
  n: "caballo",
  b: "alfil",
  r: "torre",
  q: "dama",
  k: "rey",
};

/** Piece name with its article, so sentences read right in both genders. */
export function pieceEs(type: string): string {
  const feminine = type === "r" || type === "q";
  return `${feminine ? "la" : "el"} ${PIECE_NAME_ES[type] ?? "pieza"}`;
}
