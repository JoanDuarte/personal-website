import { Chess, type Color, type Square } from "chess.js";
import { sanEs } from "./format";
import {
  bestExchange,
  flipTurn,
  moveNetValue,
  pieceEs,
  PIECE_VALUE,
  type Exchange,
} from "./see";

/**
 * A repertoire is a *setup*, not a variation tree. Each system is an ordered
 * list of squares to put pieces on, plus a short list of exceptions for the
 * handful of things the opponent can do that actually change the plan.
 *
 * This is deliberate: a tree of memorised lines collapses the moment the
 * opponent leaves it, which at 600-800 elo is by move 4. A setup survives
 * anything, which is the whole point of picking one.
 */

export type Step = {
  from: Square;
  to: Square;
  /** Piece expected on `to` once the step is done. */
  piece: "p" | "n" | "b" | "r" | "q" | "k";
  idea: string;
};

export type Exception = {
  id: string;
  idea: string;
  /** Returns the from/to to play, or null when the exception doesn't apply. */
  resolve: (chess: Chess) => { from: Square; to: Square } | null;
};

export type System = {
  /** Internal label. Not used for lookup — `SYSTEMS` below owns that. */
  id: string;
  color: Color;
  name: string;
  tagline: string;
  /** Why this system, in his own numbers. */
  rationale: string;
  setup: (chess: Chess) => Step[];
  exceptions: Exception[];
  /** Shown once the setup is complete and the book stops. */
  afterBook: string;
  /** Opponent plans the drill cycles through. */
  plans: { name: string; moves: string[] }[];
};

function pieceAt(chess: Chess, square: Square, type: string, color: Color) {
  const p = chess.get(square);
  return !!p && p.type === type && p.color === color;
}

/** The piece reached its square. */
function isPlaced(chess: Chess, step: Step, color: Color) {
  return pieceAt(chess, step.to, step.piece, color);
}

/**
 * The step is settled, one way or another: the piece is where it belongs, or it
 * has left its starting square — traded off, or sent elsewhere by an exception.
 * Without this, a bishop chased off its book square would leave that step
 * pending forever and the book would report itself unfinished after castling.
 */
function isResolved(chess: Chess, step: Step, color: Color) {
  return isPlaced(chess, step, color) || !pieceAt(chess, step.from, step.piece, color);
}

function findLegal(chess: Chess, from: Square, to: Square) {
  return chess
    .moves({ verbose: true })
    .find((m) => m.from === from && m.to === to);
}

/**
 * The mate the side to move can play right now, in SAN, or null.
 *
 * chess.js already marks checkmate in the SAN it generates, so this costs one
 * move generation — about 0.08ms — and needs no search of its own.
 */
function mateInOne(chess: Chess): string | null {
  return chess.moves().find((san) => san.endsWith("#")) ?? null;
}

/**
 * The mate the opponent threatens if we do nothing.
 *
 * A null-move flip, the same trick `moveRisk` uses for material: if handing
 * them the move produces mate, the threat is real and outranks the setup, the
 * free pawn, and everything else the book has an opinion about.
 */
function mateThreat(chess: Chess): string | null {
  const flipped = flipTurn(chess.fen());
  return flipped ? mateInOne(new Chess(flipped)) : null;
}

/**
 * What a capture actually nets once the opponent answers: the material it wins,
 * minus the best exchange they have afterwards, anywhere on the board.
 *
 * `moveRisk` deliberately subtracts the threat that already existed, so a move
 * is never blamed for a problem it did not create. That is the right rule for
 * *ordering the setup* and the wrong one for *deciding to grab material*: taking
 * a free pawn while your queen hangs is still losing a queen, and the pawn was
 * never free. An audit found `Axe5` winning a pawn with the queen already
 * hanging to `fxg4` — a move the safety check passed, correctly, and the book
 * should never have recommended.
 *
 * Mutates and restores `chess`.
 */
function captureBalance(chess: Chess, from: Square, to: Square, gained: number): number {
  const legal = findLegal(chess, from, to);
  if (!legal) return gained;
  chess.move({ from, to, promotion: legal.promotion });
  const backlash = bestExchange(chess.fen())?.value ?? 0;
  chess.undo();
  return gained - backlash;
}

/** Net material a candidate move gives away counts as unsafe from here up. */
const UNSAFE = 100;
/** Free material worth stopping the setup to take. */
const WORTH_TAKING = 100;
/** Material of your own already under threat that the setup must not ignore. */
const AT_RISK = 200;

/**
 * The most material-winning capture that does not hand anything back.
 *
 * `bestExchange` resolves the exchange on one square and is blind to what the
 * capturing piece walks into. Running each candidate through `moveRisk` closes
 * that gap.
 */
function bestSafeCapture(
  chess: Chess,
  min: number
): { from: Square; to: Square; san: string; net: number } | null {
  const fen = chess.fen();
  // Two free pawns are worth the same to SEE and not to the position: taking
  // the central one is nearly always the better half of the tie.
  const offCentre = (square: Square) =>
    Math.abs(3.5 - "abcdefgh".indexOf(square[0])) +
    Math.abs(3.5 - (Number(square[1]) - 1));

  let best: { from: Square; to: Square; san: string; net: number } | null = null;

  for (const m of chess.moves({ verbose: true })) {
    if (!m.captured) continue;
    const net = moveNetValue(fen, m);
    if (net < min) continue;
    if (best && (net < best.net ||
      (net === best.net && offCentre(m.to) >= offCentre(best.to)))) continue;
    if (moveRisk(chess, m.from, m.to)) continue;
    best = { from: m.from, to: m.to, san: m.san, net };
  }
  return best;
}

/**
 * The least bad move available when something of yours is already hanging.
 *
 * `moveRisk` only stops the book from *creating* a threat. It says nothing about
 * one that already exists, which is how the book came to answer "...g5 attacking
 * your f4 bishop" with "play c3" — an audit against Stockfish put that at -600
 * centipawns. Rescuing has to be its own rule.
 */
function safestMove(
  chess: Chess,
  /** Tie-break among equally safe moves. Higher is better. */
  prefer: (move: { from: Square; to: Square; piece: string }) => number
): { from: Square; to: Square; san: string; net: number; mate: string | null } | null {
  const fen = chess.fen();
  type Candidate = {
    from: Square;
    to: Square;
    san: string;
    net: number;
    rank: number;
    /** The mate the opponent plays in reply, when this move allows one. */
    mate: string | null;
  };
  let best: Candidate | null = null;

  for (const m of chess.moves({ verbose: true })) {
    const probe = new Chess(fen);
    probe.move({ from: m.from, to: m.to, promotion: m.promotion });
    // Not getting mated outranks every material consideration below: a move
    // that saves the rook and allows mate next is not the safest move.
    const mate = mateInOne(probe);
    const after = bestExchange(probe.fen());
    const gained = m.captured ? PIECE_VALUE[m.captured] : 0;
    const net = (after?.value ?? 0) - gained;
    const rank = prefer(m);
    const candidate: Candidate = { from: m.from, to: m.to, san: m.san, net, rank, mate };
    if (best === null) {
      best = candidate;
    } else if ((mate === null) !== (best.mate === null)) {
      if (mate === null) best = candidate;
    } else if (net < best.net || (net === best.net && rank > best.rank)) {
      best = candidate;
    }
  }
  return best;
}

function findRescue(
  chess: Chess,
  threatened: Square
): { from: Square; to: Square; san: string } | null {
  // Prefer moving the piece under attack: getting it out is the lesson, not
  // shuffling something else into a defence.
  const best = safestMove(chess, (m) => (m.from === threatened ? 1 : 0));
  if (!best || best.mate || best.net >= AT_RISK) return null;
  return { from: best.from, to: best.to, san: best.san };
}

export type Risk = {
  san: string;
  cost: number;
  attacker: string;
  square: Square;
  /** The mate the opponent answers with, when the move hangs one. */
  mate?: string;
};

/**
 * What a candidate move loses, if anything.
 *
 * A setup is a plan, not a licence to hang pieces: developing a piece to its
 * book square only makes sense while nothing hangs once it gets there — a
 * bishop sent to a square a pawn now attacks is a bishop for nothing. The
 * threat is measured as the *increase* in what the opponent can win, so a move
 * is not blamed for a threat that already existed before it. Mate is the one
 * exception to that rule, reported separately below: it ends the game whether
 * or not the threat predates the move.
 *
 * Mutates and restores `chess`.
 */
function moveRisk(chess: Chess, from: Square, to: Square): Risk | null {
  const legal = findLegal(chess, from, to);
  if (!legal) return null;

  const flipped = flipTurn(chess.fen());
  const before = flipped ? (bestExchange(flipped)?.value ?? 0) : 0;

  chess.move({ from: from, to: to, promotion: legal.promotion });
  const after = chess.fen();
  const mate = mateInOne(chess);
  const threat = bestExchange(after);
  const attacker = threat ? new Chess(after).get(threat.move.from)?.type : null;
  chess.undo();

  // Mate is the one cost that isn't measured against what came before: a move
  // that leaves it available is unplayable whether or not the threat predates
  // it, and SEE prices it at zero (win a pawn, lose the queen to the recapture).
  if (mate) {
    return { san: legal.san, cost: PIECE_VALUE.k, attacker: "el mate", square: to, mate };
  }

  const gained = legal.captured ? PIECE_VALUE[legal.captured] : 0;
  const cost = (threat?.value ?? 0) - gained - before;
  if (cost < UNSAFE || !threat) return null;

  return {
    san: legal.san,
    cost,
    attacker: attacker ? pieceEs(attacker) : "una pieza",
    square: threat.square,
  };
}

// --- White: the London System (internal fallback) --------------------------
//
// No longer the primary book for White — that's the Italian below. This stays
// as Plan B for when Black declines the Italian's ...e5: not a dedicated
// answer to the Sicilian, French, or anything else, just the same
// already-audited "develop with sense" setup it always was, reused as-is.
// It is never shown as a selectable system on its own; only ITALIAN.setup
// delegates into it.

const LONDON: System = {
  id: "london",
  color: "w",
  name: "Sistema Londres",
  tagline: "Blancas · 8 jugadas, siempre las mismas",
  rationale:
    "El plan de reserva cuando el rival no juega ...e5 contra la Italiana: el mismo desarrollo con d4 de siempre, sin apostar nada nuevo en la posición menos preparada.",
  setup: () => [
    {
      from: "d2",
      to: "d4",
      piece: "p",
      idea: "Ocupás el centro. El Londres arranca siempre igual: no tenés que decidir nada todavía.",
    },
    {
      from: "g1",
      to: "f3",
      piece: "n",
      idea: "Caballo natural. Controla e5 y ya prepara el enroque.",
    },
    {
      from: "c1",
      to: "f4",
      piece: "b",
      idea: "El alfil sale ANTES de e3. Este es el orden que importa: si jugás e3 primero, el alfil queda encerrado atrás del peón toda la partida. Es el error clásico del Londres.",
    },
    {
      from: "e2",
      to: "e3",
      piece: "p",
      // Deliberately does not assert where the c1 bishop is: the safety check
      // can reorder the setup, and this step may now come first.
      idea: "Sostiene d4 y le abre la diagonal al alfil de f1. El orden importa: si e3 sale antes que el alfil de c1, ese alfil queda encerrado atrás del peón toda la partida.",
    },
    {
      from: "f1",
      to: "d3",
      piece: "b",
      idea: "Apunta a h7. Junto con el alfil de f4 son las dos piezas del ataque que viene después.",
    },
    {
      from: "c2",
      to: "c3",
      piece: "p",
      idea: "Sostiene d4 y le da casilla a la dama en c2.",
    },
    {
      from: "b1",
      to: "d2",
      piece: "n",
      idea: "El último caballo va a d2, no a c3: el peón de c3 ya ocupa esa casilla.",
    },
    {
      from: "e1",
      to: "g1",
      piece: "k",
      idea: "Enrocás y terminaste el desarrollo. Ocho jugadas, cero decisiones, reloj entero.",
    },
  ],
  exceptions: [
    {
      id: "qb6",
      idea: "Te está pegando en b2 con la dama. Dc1 defiende el peón y de paso conecta tus torres. No entres en pánico ni juegues b3, que te debilita las casillas alrededor del rey.",
      resolve: (chess) => {
        if (!pieceAt(chess, "b6", "q", "b")) return null;
        if (!pieceAt(chess, "b2", "p", "w")) return null;
        return findLegal(chess, "d1", "c1") ? { from: "d1", to: "c1" } : null;
      },
    },
    {
      id: "nh5",
      idea: "Te atacan el alfil de f4 con el caballo. Ag3 lo salva. Si te lo cambia con Cxg3, recapturás con hxg3 y te queda la columna h abierta apuntando a su enroque: es buen negocio para vos.",
      resolve: (chess) => {
        if (!pieceAt(chess, "f4", "b", "w")) return null;
        // The eight squares a knight attacks f4 from.
        const attackers: Square[] = ["d3", "d5", "e2", "e6", "g2", "g6", "h3", "h5"];
        if (!attackers.some((sq) => pieceAt(chess, sq, "n", "b"))) return null;
        return findLegal(chess, "f4", "g3") ? { from: "f4", to: "g3" } : null;
      },
    },
    {
      id: "bf5-trade",
      idea: "Te plantó el alfil en f5, mirando al tuyo de d3. Cambialo vos: Axf5. Parece una jugada boba y no lo es — mientras ese alfil siga ahí, el tuyo de d3 está defendido sólo por la dama, y en cuanto el caballo vaya a d2 le tapás la defensa y te lo comen gratis.",
      resolve: (chess) => {
        if (!pieceAt(chess, "d3", "b", "w")) return null;
        if (!pieceAt(chess, "f5", "b", "b")) return null;
        return findLegal(chess, "d3", "f5") ? { from: "d3", to: "f5" } : null;
      },
    },
    {
      id: "c5-push",
      idea: "Te presiona d4 con el peón de c5. c3 lo sostiene y esto pasa al frente de la fila: primero aguantás el centro, después seguís desarrollando.",
      resolve: (chess) => {
        if (!pieceAt(chess, "c5", "p", "b")) return null;
        if (pieceAt(chess, "c3", "p", "w")) return null;
        return findLegal(chess, "c2", "c3") ? { from: "c2", to: "c3" } : null;
      },
    },
  ],
  afterBook:
    "Terminó el libro. El plan de acá en adelante: Ce5 para clavar el caballo en el centro, f4 para sostenerlo, y la dama a f3 o e2 mirando el enroque rival. Pero antes de cada jugada, la pregunta de siempre: ¿qué me captura?",
  plans: [
    { name: "Clásico", moves: ["d5", "Nf6", "e6", "Be7", "O-O", "c5", "Nc6"] },
    { name: "India de rey", moves: ["Nf6", "g6", "Bg7", "d6", "O-O", "Nbd7", "e5"] },
    { name: "Agresivo con Dama a b6", moves: ["d5", "Nf6", "c5", "Qb6", "Nc6", "cxd4"] },
    { name: "Caballo a h5", moves: ["d5", "Nf6", "e6", "Nh5", "Be7", "O-O"] },
    { name: "Eslava", moves: ["d5", "Nf6", "c6", "Bf5", "e6", "Bd6", "O-O"] },
  ],
};

// --- White: the Italian Game (Giuoco Pianissimo) ----------------------------

const ITALIAN: System = {
  id: "italian",
  color: "w",
  name: "Apertura Italiana",
  tagline: "Blancas · Giuoco Pianissimo, 6 jugadas fijas",
  rationale:
    "Con blancas venís jugando 1.e4 en 116 partidas con 53% — la Italiana no te pide cambiar de primera jugada, canaliza la que ya jugás. Solo se aplica si el rival contesta 1...e5, que es la respuesta más común a tu nivel; si no coopera, el plan pasa solo al mismo desarrollo con d4 del Londres que ya conocías, con la misma red de seguridad de siempre.",
  setup: (chess) => {
    // Once Black has actually replied, check whether they played along. Before
    // that (right after White's own 1.e4) there's nothing to branch on yet.
    const blackFirst = chess.history()[1];
    if (chess.history().length >= 2 && blackFirst !== "e5") {
      return LONDON.setup(chess);
    }
    return [
      {
        from: "e2",
        to: "e4",
        piece: "p",
        idea: "Abrís con el peón de rey. La Italiana necesita que el rival conteste ...e5 — si no, el plan pasa solo al del Londres que ya conocías.",
      },
      {
        from: "g1",
        to: "f3",
        piece: "n",
        idea: "Atacás el peón de e5 y desarrollás el caballo natural.",
      },
      {
        from: "f1",
        to: "c4",
        piece: "b",
        idea: "El alfil apunta a f7, el punto más flojo del rival. Esto es lo que hace a esta apertura 'italiana'.",
      },
      {
        from: "d2",
        to: "d3",
        piece: "p",
        idea: "Sostenés e4 sin abrir el centro todavía. Ésta es la versión tranquila (Giuoco Pianissimo): nunca jugás Cg5, así que toda la teoría afilada de líneas como el Fried Liver queda afuera sin que tengas que evitarla vos. Responde igual si el rival contestó ...Ac5 o ...Cf6.",
      },
      {
        from: "e1",
        to: "g1",
        piece: "k",
        idea: "Enrocás. Con el rey seguro, no hay apuro.",
      },
      {
        from: "c2",
        to: "c3",
        piece: "p",
        idea: "Preparás d4 para cuando el centro esté listo para abrirse. Todavía no lo jugás — ese 'cuándo' ya es criterio de medio juego.",
      },
    ];
  },
  // No hand-written exceptions: a pawn attacking the c4 bishop always exposes
  // ≥300cp (a bishop is worth 320), which the generic "something of yours is
  // already hanging" rescue above already catches and answers — a hand-coded
  // "retreat to b3" exception here was provably unreachable, since that generic
  // check runs first and picks whatever legal move loses the least (a real
  // retreat, if one exists), before this list is ever consulted.
  exceptions: [],
  afterBook:
    "Terminó el libro. El plan de acá en adelante: buscás el momento para el quiebre con d4, sacás el caballo de b1 (a d2, y después reagrupa hacia f1-g3) y mirás dónde le pesa más al rival. Pero antes de cada jugada, la pregunta de siempre: ¿qué me captura?",
  plans: [
    { name: "Giuoco Piano clásico", moves: ["e5", "Nc6", "Bc5", "Nf6", "d6", "O-O"] },
    { name: "Dos Caballos", moves: ["e5", "Nc6", "Nf6", "Bc5", "d6", "O-O"] },
    { name: "Ataca el alfil con b5", moves: ["e5", "Nc6", "Bc5", "b5", "Nf6", "d6", "O-O"] },
    { name: "Siciliana (no coopera)", moves: ["c5", "Nc6", "d6", "g6", "Bg7", "Nf6", "O-O"] },
    { name: "Francesa (no coopera)", moves: ["e6", "d5", "Nf6", "Be7", "c5", "Nc6", "O-O"] },
  ],
};

// --- Black: the Indian setup ----------------------------------------------

const INDIAN: System = {
  id: "indian",
  color: "b",
  name: "Esquema indio",
  tagline: "Negras · 5 jugadas, contra todo",
  rationale:
    "Con negras 1...e5 te da 38% en 94 partidas — es tu peor resultado y tu muestra más grande. 1...d6 te da 60% en 25. El esquema indio te deja jugar la misma estructura contra 1.e4, 1.d4 y cualquier otra cosa.",
  setup: (chess) => {
    const d6: Step = {
      from: "d7",
      to: "d6",
      piece: "p",
      idea: "Contra 1.e4 el peón va primero. Si salís con Cf6, te contesta e5 y tenés que mover el caballo de nuevo perdiendo un tiempo.",
    };
    const nf6: Step = {
      from: "g8",
      to: "f6",
      piece: "n",
      idea: "Caballo al centro, presionando e4.",
    };
    const g6: Step = {
      from: "g7",
      to: "g6",
      piece: "p",
      idea: "Le abrís la diagonal larga al alfil. Es la jugada que define todo el esquema.",
    };
    const bg7: Step = {
      from: "f8",
      to: "g7",
      piece: "b",
      idea: "El alfil de g7 es tu mejor pieza: apunta a todo el flanco de dama del rival y no se cambia por nada.",
    };
    const castle: Step = {
      from: "e8",
      to: "g8",
      piece: "k",
      idea: "Rey seguro. Terminaste: cinco jugadas, las mismas siempre, contra lo que te pongan enfrente.",
    };
    // Against 1.e4 the pawn goes first; otherwise the knight leads.
    return pieceAt(chess, "e4", "p", "w")
      ? [d6, nf6, g6, bg7, castle]
      : [nf6, g6, bg7, d6, castle];
  },
  exceptions: [
    {
      id: "e5-push",
      idea: "Le empujó el peón a e5 para echarte el caballo. No lo muevas: cambiá en el centro con dxe5. Le sacás el peón de encima y le desarmás el avance.",
      resolve: (chess) => {
        if (!pieceAt(chess, "e5", "p", "w")) return null;
        if (!pieceAt(chess, "f6", "n", "b")) return null;
        return findLegal(chess, "d6", "e5") ? { from: "d6", to: "e5" } : null;
      },
    },
    {
      id: "bishop-check",
      idea: "Te dio jaque con el alfil en b5. Tapá con el caballo a d7 o con el alfil a d7: no muevas el rey, que perdés el enroque.",
      resolve: (chess) => {
        if (!chess.isCheck()) return null;
        if (!pieceAt(chess, "b5", "b", "w")) return null;
        if (findLegal(chess, "b8", "d7")) return { from: "b8", to: "d7" };
        if (findLegal(chess, "c8", "d7")) return { from: "c8", to: "d7" };
        return null;
      },
    },
  ],
  afterBook:
    "Terminó el libro. El plan de acá en adelante: romper el centro con ...e5 o ...c5, según dónde lo tenga más flojo. Pero antes de cada jugada, la pregunta de siempre: ¿qué me captura?",
  plans: [
    { name: "1.e4 clásico", moves: ["e4", "d4", "Nc3", "Nf3", "Be2", "O-O", "Be3"] },
    { name: "1.d4 con c4", moves: ["d4", "c4", "Nc3", "e4", "Nf3", "Be2", "O-O"] },
    { name: "Ataque austríaco", moves: ["e4", "d4", "Nc3", "f4", "Nf3", "Bd3", "O-O"] },
    { name: "Londres del rival", moves: ["d4", "Nf3", "Bf4", "e3", "Bd3", "c3", "O-O"] },
    { name: "1.Nf3 flexible", moves: ["Nf3", "g3", "Bg2", "O-O", "d4", "c4", "Nc3"] },
  ],
};

export const SYSTEMS = {
  italian: ITALIAN,
  indian: INDIAN,
} as const satisfies Record<string, System>;

// --- Book lookup -----------------------------------------------------------

export type BookAnswer =
  | {
      kind: "move";
      from: Square;
      to: Square;
      san: string;
      idea: string;
      source: "setup" | "exception";
      /** Why the book departed from its own move order, when it did. */
      warning?: string;
      /** 1-based index into the setup, for the progress display. */
      step: number;
      total: number;
    }
  | {
      kind: "tactic";
      idea: string;
      /** The exact capture the book found. Any winning capture here still counts. */
      from: Square;
      to: Square;
      san: string;
      square: Square;
      value: number;
    }
  | { kind: "done"; idea: string }
  | { kind: "out"; idea: string };

/**
 * What the book says to play in this position, or why it has nothing to say.
 *
 * Tactics outrank the book: if the opponent left material hanging, taking it
 * beats finishing the setup, and the drill should say so rather than teach him
 * to play on autopilot.
 */
export function consultBook(
  system: System,
  chess: Chess,
  options: {
    /** The opponent's last move, when known. Enables the recapture rule. */
    lastMove?: { to: Square; captured?: string } | null;
    /**
     * The best capture in this position, when the caller already computed it.
     * Batch analysis evaluates the same position anyway, and the exchange search
     * is the expensive part of a sync.
     */
    freeMaterial?: Exchange | null;
  } = {}
): BookAnswer {
  const { lastMove, freeMaterial } = options;

  if (chess.turn() !== system.color) {
    return { kind: "out", idea: "No es tu turno." };
  }

  const steps = system.setup(chess);
  const total = steps.length;
  const doneCount = steps.filter((s) => isResolved(chess, s, system.color)).length;

  // In check overrides everything below. Only check-resolving moves are legal
  // right now, so material sitting elsewhere on the board isn't actionable —
  // and when the resolving move also happens to win material (recapturing the
  // checking piece, say), it used to fall through to the "free material" branch
  // below and get framed as a tactic instead of a check. Same move, worse
  // framing: "hay material gratis" when the real fact is "te dieron jaque".
  // ...Qa4+ against the Indian is one of the most common checks at this level,
  // and the book used to meet it with a shrug when nothing tapped it directly.
  if (chess.isCheck()) {
    const reply = safestMove(chess, (m) => (m.piece === "k" ? 0 : 1));
    if (reply) {
      return {
        kind: "move",
        from: reply.from,
        to: reply.to,
        san: reply.san,
        idea: `Te dan jaque, así que el esquema espera: primero se sale del jaque. De las respuestas posibles ésta es la que menos pierde${reply.net <= 0 ? " y no te cuesta nada" : ""}. Si podés tapar en vez de mover el rey, tapá: mover el rey te deja sin enroque.`,
        source: "exception",
        step: doneCount + 1,
        total,
      };
    }
    // No legal reply would mean checkmate, which the caller already screens
    // for via chess.isGameOver() — fall through defensively rather than throw.
  }

  // Mate threatened next move. This sits above free material, above the
  // recapture rule, above a hanging piece and above the setup, because it is
  // the only thing on that list that ends the game. Everything below measures
  // positions in centipawns, and static exchange evaluation prices ...Dxf2# at
  // zero — it wins a pawn and loses the queen to a recapture that never gets
  // played. That blind spot is how the book answered 3...Dh4 with 4.Ac4 and
  // got mated on the next move.
  const mated = mateThreat(chess);
  if (mated) {
    // Among the moves that stop it, one that also happens to be a step of the
    // setup is the one worth teaching: "enrocá" beats "poné la torre en f8"
    // when both defend f7 and only one of them is where the piece was going
    // anyway.
    const save = safestMove(chess, (m) =>
      steps.some((step) => step.from === m.from && step.to === m.to)
        ? 2
        : m.piece === "k"
          ? 0
          : 1
    );
    if (save && !save.mate) {
      return {
        kind: "move",
        from: save.from,
        to: save.to,
        san: save.san,
        idea: `Frená todo: te amenazan mate con ${sanEs(mated)}. El esquema no importa acá — ninguna jugada de desarrollo vale nada si la partida se termina. Ésta lo para y es la que menos material entrega.`,
        source: "exception",
        step: doneCount + 1,
        total,
      };
    }
    return {
      kind: "out",
      idea: `Te amenazan mate con ${sanEs(mated)} y no encontré jugada que lo pare sin dar otro mate. Esto ya no lo arregla la apertura: mirá si podés capturar la pieza que mata, taparle la casilla, o darle jaque vos primero.`,
    };
  }

  // Free material is only free if taking it doesn't hand something back. An
  // audit against Stockfish found "take the pawn on f5" recommendations that
  // dropped a bishop two plies later: the capture was safety-checked on its own
  // square and nowhere else.
  const free =
    freeMaterial !== undefined ? freeMaterial : bestExchange(chess.fen());
  if (free && free.value >= WORTH_TAKING) {
    const safe = bestSafeCapture(chess, WORTH_TAKING);
    // ...and only if you come out ahead once they answer. `bestSafeCapture`
    // asks whether the capture creates a problem; this asks whether it walks
    // past one, which is the difference between "el peón está gratis" and "el
    // peón está gratis y te cuesta la dama".
    if (safe && captureBalance(chess, safe.from, safe.to, safe.net) > -AT_RISK) {
      return {
        kind: "tactic",
        from: safe.from,
        to: safe.to,
        san: safe.san,
        square: safe.to,
        value: safe.net,
        idea: `Pará. En ${safe.to} se gana ${pieceEs(
          chess.get(safe.to)?.type ?? "p"
        )}: la captura se sostiene y nadie te la cobra de vuelta ahí. El libro se corta cuando hay táctica — la apertura no manda sobre el material.`,
      };
    }
    // Everything that wins material also gives some back; fall through to the
    // setup rather than recommending a trap.
  }

  // Recapture before anything else in the setup. "They took, take back" is the
  // rule that keeps a beginner from drifting through a trade a pawn down.
  const captured = lastMove ?? chess.history({ verbose: true }).at(-1) ?? null;
  if (captured?.captured) {
    const fen = chess.fen();
    // Safety-checked like everything else. `moveNetValue` resolves the exchange
    // on the captured square and is blind to what the recapturing piece leaves
    // behind — which is how "tomá de vuelta con la pieza de menor valor" came to
    // mean `Cxd4` with the knight pinned to the queen by a bishop on g4, an
    // audit-measured -629cp. `moveRisk` prices the whole board, and mate too.
    const recaptures = chess
      .moves({ verbose: true })
      .filter(
        (m) =>
          m.to === captured.to &&
          m.captured &&
          moveNetValue(fen, m) >= 0 &&
          !moveRisk(chess, m.from, m.to)
      );
    // Taking back is not automatic either: same test as the free-material
    // branch above, for the same reason. A recapture that leaves something
    // bigger hanging falls through to the rescue below.
    recaptures.sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece]);
    const take = recaptures.find(
      (m) => captureBalance(chess, m.from, m.to, moveNetValue(fen, m)) > -AT_RISK
    );
    if (take) {
      return {
        kind: "move",
        from: take.from,
        to: take.to,
        san: take.san,
        idea: `Te capturó en ${take.to}. Tomá de vuelta con la pieza de menor valor: el esquema puede esperar una jugada, el material no.`,
        source: "exception",
        step: doneCount + 1,
        total,
      };
    }
  }

  // Something of yours is already hanging. The setup does not get to ignore it:
  // this is the "¿qué me captura?" check the whole page is about, applied to the
  // book itself.
  const flipped = flipTurn(chess.fen());
  const exposed = flipped ? bestExchange(flipped) : null;
  if (exposed && exposed.value >= AT_RISK) {
    const mine = chess.get(exposed.square);
    const attacker = chess.get(exposed.move.from);
    const what = mine ? pieceEs(mine.type) : "material";
    const who = attacker ? pieceEs(attacker.type) : "una pieza";
    const rescue = findRescue(chess, exposed.square);

    if (rescue) {
      return {
        kind: "move",
        from: rescue.from,
        to: rescue.to,
        san: rescue.san,
        idea: `Pará el esquema: tenés ${what} colgado en ${exposed.square} y ${who} se lo come. Primero se salva el material, después se desarrolla.`,
        source: "exception",
        step: doneCount + 1,
        total,
      };
    }
    return {
      kind: "out",
      idea: `Tenés ${what} colgado en ${exposed.square}: ${who} se lo come y no hay jugada que lo salve del todo. Esto ya no lo resuelve el esquema — buscá la que menos pierda.`,
    };
  }

  for (const exception of system.exceptions) {
    const hit = exception.resolve(chess);
    if (!hit) continue;
    const legal = findLegal(chess, hit.from, hit.to);
    if (!legal) continue;
    // Even an exception has to survive the position it fires in.
    if (moveRisk(chess, hit.from, hit.to)) continue;
    return {
      kind: "move",
      from: hit.from,
      to: hit.to,
      san: legal.san,
      idea: exception.idea,
      source: "exception",
      step: doneCount + 1,
      total,
    };
  }

  // Skipped steps are remembered so the reordering can be explained rather than
  // silently happening. "Af4 pero acá no, te la come el peón de e5" is the whole
  // lesson; quietly recommending e3 instead teaches nothing.
  const risky: Risk[] = [];

  for (const [i, step] of steps.entries()) {
    if (isResolved(chess, step, system.color)) continue;
    const legal = findLegal(chess, step.from, step.to);
    if (!legal) {
      // The step is unreachable right now (blocked, pinned, or in check).
      // Later steps may still be playable, so keep looking.
      continue;
    }
    const risk = moveRisk(chess, step.from, step.to);
    if (risk) {
      risky.push(risk);
      continue;
    }
    return {
      kind: "move",
      from: step.from,
      to: step.to,
      san: legal.san,
      idea: step.idea,
      warning:
        risky.length > 0
          ? risky[0].mate
            ? `Ojo: ${sanEs(risky[0].san)} es la que tocaba, pero acá te dan mate con ${sanEs(risky[0].mate)}. Por eso el orden cambia.`
            : `Ojo: ${sanEs(risky[0].san)} es la que tocaba, pero acá te la come ${risky[0].attacker} en ${risky[0].square}. Por eso el orden cambia.`
          : undefined,
      source: "setup",
      step: i + 1,
      total,
    };
  }

  if (doneCount === total) {
    return { kind: "done", idea: system.afterBook };
  }

  if (risky.length > 0) {
    const first = risky[0];
    return {
      kind: "out",
      idea: first.mate
        ? `El esquema no sirve tal cual acá: ${sanEs(first.san)} permite mate con ${sanEs(first.mate)}, y las otras del esquema tampoco entran. Pensá vos: primero mirá qué te captura y qué te da mate.`
        : `El esquema no sirve tal cual acá: ${sanEs(first.san)} pierde material contra ${first.attacker} en ${first.square}, y las otras del esquema tampoco entran. Pensá vos: primero mirá qué te captura.`,
    };
  }
  return {
    kind: "out",
    idea: "El rival hizo algo que saca al esquema de su curso. De acá en adelante pensás vos — que es justamente para lo que el libro te dejó tiempo en el reloj.",
  };
}

/**
 * A short, factual reason to play `san` here.
 *
 * Needed for moves the book did *not* choose — the engine's, mostly. Pairing the
 * engine's move with the setup's prose put "jugá d4" directly above "ésta para
 * el mate", which described `Cg4`: the right move with the wrong reason under
 * it, which is worse than no reason at all.
 *
 * Stockfish supplies a number and no words. These are the only words derivable
 * from the position without inventing anything — what the move takes, what it
 * stops, what it threatens, what it saves. Deliberately not strategy: a made-up
 * plan is exactly the failure this exists to fix.
 *
 * Capped at two clauses. Three true facts about one move read like a list, and
 * the point is a sentence he can hold in his head at the board.
 */
export function explainMove(system: System, chess: Chess, san: string): string | null {
  const move = chess.moves({ verbose: true }).find((m) => m.san === san);
  if (!move) return null;

  const threat = mateThreat(chess);
  const before = flipTurn(chess.fen());
  const exposed = before ? bestExchange(before) : null;

  const probe = new Chess(chess.fen());
  probe.move({ from: move.from, to: move.to, promotion: move.promotion });
  if (probe.isCheckmate()) return "Es mate.";

  const parts: string[] = [];

  if (threat && !mateInOne(probe)) parts.push(`para el mate de ${sanEs(threat)}`);

  if (move.captured) {
    const net = moveNetValue(chess.fen(), move);
    parts.push(
      `te comés ${pieceEs(move.captured)}${net > 0 ? " y no te la cobran de vuelta" : ""}`
    );
  }

  if (probe.isCheck()) parts.push("da jaque");

  if (exposed && exposed.value >= AT_RISK && move.from === exposed.square) {
    const mine = chess.get(exposed.square);
    parts.push(
      `saca ${mine ? pieceEs(mine.type) : "la pieza"} de ${exposed.square}, donde te la comían`
    );
  }

  // What the move threatens next. `flipTurn` refuses when the opponent is in
  // check, which is right: the check is the news, not a hypothetical follow-up.
  const after = flipTurn(probe.fen());
  const creates = after ? bestExchange(after) : null;
  if (creates && creates.value >= AT_RISK) {
    const victim = probe.get(creates.square);
    parts.push(
      `amenaza ${victim ? pieceEs(victim.type) : "material"} en ${creates.square}`
    );
  }

  if (move.flags.includes("k") || move.flags.includes("q")) {
    parts.push("enrocás y el rey queda a salvo");
  } else if (move.piece !== "p" && move.from[1] === (move.color === "w" ? "1" : "8")) {
    parts.push(`saca ${pieceEs(move.piece)} al juego`);
  }

  // Membership in the setup is not the same as being the step that was due —
  // `c3` is in the Italian and can turn up long before its turn. Saying "es la
  // que pedía el esquema" there contradicts the line right below it, which is
  // busy naming the step that actually was due.
  if (system.setup(chess).some((step) => step.from === move.from && step.to === move.to)) {
    parts.push("está en el esquema, sólo que más adelante en el orden");
  }

  if (parts.length === 0) return null;
  const text = parts.slice(0, 2).join(", ");
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

/**
 * The concrete legal move a book answer asks for, when it asks for one.
 *
 * `tactic` names a square and accepts any winning capture on it; this returns
 * the specific one the book itself picked, which is what a caller needs to play
 * the position forward — the engine check in the trainer, and the scripts.
 */
export function bookMoveOf(answer: BookAnswer, chess: Chess) {
  if (answer.kind !== "move" && answer.kind !== "tactic") return null;
  return (
    chess
      .moves({ verbose: true })
      .find((m) => m.from === answer.from && m.to === answer.to) ?? null
  );
}

export type StepStatus = {
  step: Step;
  /** Display label in Spanish notation: "d4", "Af4", "O-O". */
  label: string;
  /** The piece is on its square. */
  placed: boolean;
  /** Settled: placed, traded off, or moved elsewhere. */
  resolved: boolean;
};

const PIECE_LABEL: Record<string, string> = {
  p: "",
  n: "C",
  b: "A",
  r: "T",
  q: "D",
  k: "R",
};

/** The whole setup with each step marked done, for the progress panel. */
export function setupProgress(system: System, chess: Chess): StepStatus[] {
  return system.setup(chess).map((step) => ({
    step,
    label:
      step.piece === "k" && step.from === "e1" && step.to === "g1"
        ? "O-O"
        : step.piece === "k" && step.from === "e8" && step.to === "g8"
          ? "O-O"
          : `${PIECE_LABEL[step.piece]}${step.to}`,
    placed: isPlaced(chess, step, system.color),
    resolved: isResolved(chess, step, system.color),
  }));
}

/** The opponent's reply in a drill: follow the plan, else something sane. */
export function opponentReply(chess: Chess, plan: string[]): string | null {
  for (const san of plan) {
    try {
      const move = chess.move(san);
      if (move) return move.san;
    } catch {
      // Not legal in this position; try the next move in the plan.
    }
  }

  // Plan exhausted or unplayable: any developing move that doesn't hang material.
  const legal = chess.moves({ verbose: true });
  if (legal.length === 0) return null;

  const safe = legal.filter((m) => {
    const probe = new Chess(chess.fen());
    probe.move({ from: m.from, to: m.to, promotion: m.promotion });
    const reply = bestExchange(probe.fen());
    return !reply || reply.value < 200;
  });

  // Prefer bringing a new piece out over shuffling one that already moved, so
  // a drill that outlives its plan doesn't devolve into Bd7-c8-d7.
  const homeRank = chess.turn() === "w" ? "1" : "8";
  const pool = safe.length > 0 ? safe : legal;
  const developing = pool.filter(
    (m) =>
      m.flags.includes("k") ||
      ((m.piece === "n" || m.piece === "b" || m.piece === "r") &&
        m.from[1] === homeRank)
  );
  const choice = (developing.length > 0 ? developing : pool)[0];
  const move = chess.move({
    from: choice.from,
    to: choice.to,
    promotion: choice.promotion,
  });
  return move ? move.san : null;
}
