import { Chess, type Color, type Square } from "chess.js";
import {
  bestExchange,
  material,
  moveNetValue,
  pieceEs,
  winningCaptures,
  PIECE_VALUE,
} from "./see";
import { consultBook, SYSTEMS } from "./repertoire";

/** Material threshold that counts as "a real piece", in centipawns. */
export const MATERIAL_THRESHOLD = 200;
/** Below this, a position counts as having nothing hanging at all. */
export const QUIET_THRESHOLD = 100;

export type Puzzle = {
  id: string;
  /** "defend" asks what the opponent wins; "attack" asks what he wins. */
  kind: "defend" | "attack";
  fen: string;
  /** Board orientation: always his colour, so it looks like his game did. */
  orientation: Color;
  moveNumber: number;
  /** The move he actually played, shown after answering. */
  playedSan: string;
  /** Accepted answers in SAN. Empty means the answer is "nothing is hanging". */
  answers: string[];
  value: number;
  /** What is hanging, for the reveal text. */
  target: string | null;
  gameUrl: string;
  date: string;
};

export type Deviation = {
  moveNumber: number;
  played: string;
  book: string;
  idea: string;
};

export type GameAnalysis = {
  url: string;
  date: string;
  /** Unix seconds, for sorting and "today" grouping. */
  endTime: number;
  color: Color;
  result: "win" | "loss" | "draw";
  termination: string;
  rating: number;
  opponent: string;
  opponentRating: number;
  timeClass: string;
  totalSeconds: number;
  moves: number;
  /** Seconds left on his clock when the game ended. */
  timeLeft: number | null;
  medianThink: number | null;
  /** Peak material advantage in centipawns, and when he had it. */
  peakMaterial: number;
  peakMoveNumber: number;
  /** Was winning on material and did not win. */
  threwItAway: boolean;
  hung: { moveNumber: number; san: string; value: number; target: string }[];
  missed: { moveNumber: number; san: string; value: number; target: string }[];
  deviation: Deviation | null;
  puzzles: Puzzle[];
};

export type ChessComGame = {
  url: string;
  pgn: string;
  time_class: string;
  time_control: string;
  rules: string;
  end_time: number;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
};

const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "timevsinsufficient",
  "50move",
]);

const TERMINATION_ES: Record<string, string> = {
  win: "ganó",
  checkmated: "mate",
  resigned: "abandono",
  timeout: "tiempo",
  abandoned: "abandono",
  agreed: "tablas",
  repetition: "repetición",
  stalemate: "ahogado",
  insufficient: "material insuficiente",
  timevsinsufficient: "tiempo vs material",
  "50move": "regla de 50",
};

function parseClocks(pgn: string): number[] {
  return [...pgn.matchAll(/\[%clk\s+(\d+):(\d+):([\d.]+)\]/g)].map(
    (m) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number.parseFloat(m[3])
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function describe(fen: string, square: Square): string {
  const piece = new Chess(fen).get(square);
  return piece ? pieceEs(piece.type) : "el material";
}

export function analyzeGame(
  game: ChessComGame,
  username: string
): GameAnalysis | null {
  const chess = new Chess();
  try {
    chess.loadPgn(game.pgn);
  } catch {
    return null;
  }

  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const me: Color = isWhite ? "w" : "b";
  const mine = isWhite ? game.white : game.black;
  const theirs = isWhite ? game.black : game.white;

  const result =
    mine.result === "win" ? "win" : DRAW_RESULTS.has(mine.result) ? "draw" : "loss";

  const history = chess.history({ verbose: true });
  const clocks = parseClocks(game.pgn);
  const totalSeconds = Number.parseInt(game.time_control, 10) || 0;
  const system = SYSTEMS[me === "w" ? "london" : "indian"];

  const myClocks: number[] = [];
  const thinkTimes: number[] = [];
  const hung: GameAnalysis["hung"] = [];
  const missed: GameAnalysis["missed"] = [];
  const puzzles: Puzzle[] = [];

  let peakMaterial = 0;
  let peakMoveNumber = 0;
  let deviation: Deviation | null = null;
  let quietDefend = 0;
  let quietAttack = 0;

  history.forEach((move, ply) => {
    const clock = clocks[ply];
    if (move.color === me && clock != null) {
      const previous = myClocks.length > 0 ? myClocks[myClocks.length - 1] : totalSeconds;
      myClocks.push(clock);
      thinkTimes.push(Math.max(0, previous - clock));
    }
    if (move.color !== me) return;

    const moveNumber = Math.floor(ply / 2) + 1;

    // Did he follow his repertoire? Only worth asking while the book is live.
    if (deviation === null && moveNumber <= 12) {
      const probe = new Chess(move.before);
      // The probe has no history, so the opponent's last move is passed in;
      // otherwise a recapture would read as leaving the repertoire.
      const previous = ply > 0 ? history[ply - 1] : null;
      const book = consultBook(system, probe, previous);
      if (book.kind === "move" && book.san !== move.san) {
        deviation = {
          moveNumber,
          played: move.san,
          book: book.san,
          idea: book.idea,
        };
      }
    }

    // Free material he could have taken and didn't. Graded on what his move
    // actually nets, not on whether it was the exact move SEE happened to pick:
    // capturing the same piece with a different attacker is not a miss.
    const available = bestExchange(move.before);
    const tookIt =
      available !== null && moveNetValue(move.before, move) >= available.value;
    if (available && available.value >= MATERIAL_THRESHOLD && !tookIt) {
      const target = describe(move.before, available.square);
      missed.push({ moveNumber, san: move.san, value: available.value, target });
      if (missed.length <= 3) {
        puzzles.push({
          id: `${game.url}#${ply}-attack`,
          kind: "attack",
          fen: move.before,
          orientation: me,
          moveNumber,
          playedSan: move.san,
          answers: winningCaptures(move.before, available.value).map((m) => m.san),
          value: available.value,
          target,
          gameUrl: game.url,
          date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
        });
      }
    } else if (
      (!available || available.value < QUIET_THRESHOLD) &&
      moveNumber >= 8 &&
      quietAttack < 1
    ) {
      quietAttack += 1;
      puzzles.push({
        id: `${game.url}#${ply}-attack-quiet`,
        kind: "attack",
        fen: move.before,
        orientation: me,
        moveNumber,
        playedSan: move.san,
        answers: [],
        value: 0,
        target: null,
        gameUrl: game.url,
        date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
      });
    }

    // What the opponent can now win off him, minus whatever he just took. A
    // bishop that gets recaptured after taking a knight is a trade, not a
    // hang, and counting it as one both inflates the metric and produces a
    // puzzle whose "answer" is an even exchange.
    const exposed = bestExchange(move.after);
    const gained = move.captured ? PIECE_VALUE[move.captured] : 0;
    const netLoss = exposed ? exposed.value - gained : 0;
    if (exposed && netLoss >= MATERIAL_THRESHOLD) {
      const target = describe(move.after, exposed.square);
      hung.push({ moveNumber, san: move.san, value: netLoss, target });
      if (hung.length <= 4) {
        puzzles.push({
          id: `${game.url}#${ply}-defend`,
          kind: "defend",
          fen: move.after,
          orientation: me,
          moveNumber,
          playedSan: move.san,
          answers: winningCaptures(move.after, exposed.value).map((m) => m.san),
          value: exposed.value,
          target,
          gameUrl: game.url,
          date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
        });
      }
    } else if (
      (!exposed || exposed.value < QUIET_THRESHOLD) &&
      moveNumber >= 8 &&
      quietDefend < 1
    ) {
      quietDefend += 1;
      puzzles.push({
        id: `${game.url}#${ply}-defend-quiet`,
        kind: "defend",
        fen: move.after,
        orientation: me,
        moveNumber,
        playedSan: move.san,
        answers: [],
        value: 0,
        target: null,
        gameUrl: game.url,
        date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
      });
    }

    const count = material(move.after);
    const advantage = isWhite ? count.w - count.b : count.b - count.w;
    if (advantage > peakMaterial) {
      peakMaterial = advantage;
      peakMoveNumber = moveNumber;
    }
  });

  return {
    url: game.url,
    date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
    endTime: game.end_time,
    color: me,
    result,
    termination: TERMINATION_ES[mine.result] ?? mine.result,
    rating: mine.rating,
    opponent: theirs.username,
    opponentRating: theirs.rating,
    timeClass: game.time_class,
    totalSeconds,
    moves: Math.ceil(history.length / 2),
    timeLeft: myClocks.length > 0 ? myClocks[myClocks.length - 1] : null,
    medianThink: median(thinkTimes),
    peakMaterial,
    peakMoveNumber,
    threwItAway: peakMaterial >= 300 && result !== "win",
    hung,
    missed,
    deviation,
    puzzles,
  };
}

// --- Rolling scorecard -----------------------------------------------------

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

export function scorecard(games: GameAnalysis[]): Scorecard {
  if (games.length === 0) {
    return {
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
  }

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
