import { Chess, type Color, type Square } from "chess.js";
import {
  bestExchange,
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
  id: "london" | "indian";
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
 * Without this, a London bishop chased from f4 to g3 would leave step 3 pending
 * forever and the book would report itself unfinished after castling.
 */
function isResolved(chess: Chess, step: Step, color: Color) {
  return isPlaced(chess, step, color) || !pieceAt(chess, step.from, step.piece, color);
}

function findLegal(chess: Chess, from: Square, to: Square) {
  return chess
    .moves({ verbose: true })
    .find((m) => m.from === from && m.to === to);
}

// --- White: the London System ---------------------------------------------

const LONDON: System = {
  id: "london",
  color: "w",
  name: "Sistema Londres",
  tagline: "Blancas · 8 jugadas, siempre las mismas",
  rationale:
    "Con blancas venís jugando 1.e4 en 116 partidas con 53%. El Londres te saca las decisiones de encima en la apertura, que es exactamente lo que necesitás para llegar a la jugada 11 con el reloj entero.",
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
      idea: "Ahora sí. Sostiene d4 y le abre la diagonal al otro alfil, con el de f4 ya afuera.",
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

export const SYSTEMS: Record<System["id"], System> = {
  london: LONDON,
  indian: INDIAN,
};

// --- Book lookup -----------------------------------------------------------

export type BookAnswer =
  | {
      kind: "move";
      from: Square;
      to: Square;
      san: string;
      idea: string;
      source: "setup" | "exception";
      /** 1-based index into the setup, for the progress display. */
      step: number;
      total: number;
    }
  | { kind: "tactic"; idea: string; square: Square; value: number }
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

  const free =
    freeMaterial !== undefined ? freeMaterial : bestExchange(chess.fen());
  if (free && free.value >= 200) {
    return {
      kind: "tactic",
      square: free.square,
      value: free.value,
      idea: `Pará. Hay material gratis en ${free.square}: se gana ${pieceEs(
        chess.get(free.square)?.type ?? "p"
      )} sin compensación. El libro se corta cuando hay táctica — la apertura no manda sobre el material.`,
    };
  }

  // Recapture before anything else in the setup. "They took, take back" is the
  // rule that keeps a beginner from drifting through a trade a pawn down.
  const captured = lastMove ?? chess.history({ verbose: true }).at(-1) ?? null;
  if (captured?.captured) {
    const fen = chess.fen();
    const recaptures = chess
      .moves({ verbose: true })
      .filter((m) => m.to === captured.to && m.captured && moveNetValue(fen, m) >= 0);
    if (recaptures.length > 0) {
      recaptures.sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece]);
      const take = recaptures[0];
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

  for (const exception of system.exceptions) {
    const hit = exception.resolve(chess);
    if (!hit) continue;
    const legal = findLegal(chess, hit.from, hit.to);
    if (!legal) continue;
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

  for (const [i, step] of steps.entries()) {
    if (isResolved(chess, step, system.color)) continue;
    const legal = findLegal(chess, step.from, step.to);
    if (!legal) {
      // The step is unreachable right now (blocked, pinned, or in check).
      // Later steps may still be playable, so keep looking.
      continue;
    }
    return {
      kind: "move",
      from: step.from,
      to: step.to,
      san: legal.san,
      idea: step.idea,
      source: "setup",
      step: i + 1,
      total,
    };
  }

  if (doneCount === total) {
    return { kind: "done", idea: system.afterBook };
  }
  return {
    kind: "out",
    idea: chess.isCheck()
      ? "Estás en jaque, así que el esquema se suspende: primero resolvés el jaque. Eso ya lo pensás vos."
      : "El rival hizo algo que saca al esquema de su curso. De acá en adelante pensás vos — que es justamente para lo que el libro te dejó tiempo en el reloj.",
  };
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
