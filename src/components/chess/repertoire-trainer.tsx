"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board, type BoardMove, type Highlight } from "./board";
import { useEngine } from "./use-engine";
import {
  bookMoveOf,
  consultBook,
  explainMove,
  setupProgress,
  SYSTEMS,
  type BookAnswer,
  type System,
} from "@/lib/chess/repertoire";
import { uciToSan } from "@/lib/chess/engine";
import { sanEs, pawns } from "@/lib/chess/format";
import {
  gamePhase,
  moveQuality,
  PHASE_LABEL,
  QUALITY_TONE,
  type MoveQuality,
} from "@/lib/chess/phase";

/**
 * Stockfish decides. The setup explains, and never overrules.
 *
 * This went through a wrong middle version worth recording: the engine only got
 * to take over once the plan's move had *also* been searched, so its cost was
 * known and could be compared against a threshold. That made the book win the
 * panel almost always — the second search lands well after the first, and until
 * it does there is no cost to compare, so the plan kept the floor by default.
 * The engine's answer was sitting right there, unused.
 *
 * So the engine's move is the recommendation the moment its search resolves,
 * full stop. The plan's cost, when it arrives, is an annotation: it says what
 * the setup wanted and how far off it was, so staying inside the repertoire
 * stays a choice he can make with a number in front of him rather than a
 * decision the page makes for him.
 *
 * The setup is still not decoration. It is the instant answer before a 7MB
 * engine has downloaded and compiled, the only answer if it never does (its
 * mate and hanging rules need no engine at all), and the only source of a
 * *reason* — "Cf3 (+0.2)" teaches a 600 nothing on its own.
 */
/**
 * Wording thresholds for the gap between the engine's move and the plan's.
 * These pick a sentence; they no longer pick a move.
 */
const PLAN_COSTS_LITTLE = 50;
const PLAN_IS_A_MISTAKE = 300;

type LastMove = { from: Square; to: Square; captured?: string };
/** What he just played, and what was being recommended, captured at move time. */
type Played = { san: string; wanted: string | null };

type Advice = {
  san: string;
  /** Who is being followed: both agree, the plan stands, or the engine took over. */
  from: "ambos" | "esquema" | "motor";
  /** The setup's own move here, when it has one. */
  bookSan: string | null;
  /** The engine's own move here, once it has resolved. */
  engineSan: string | null;
};

function lastMoveOf(chess: Chess): LastMove | null {
  const last = chess.history({ verbose: true }).at(-1);
  return last
    ? { from: last.from, to: last.to, captured: last.captured }
    : null;
}

/** The move a book answer names, in SAN, when it names one. */
function bookSanOf(answer: BookAnswer): string | null {
  return answer.kind === "move" || answer.kind === "tactic" ? answer.san : null;
}

export function RepertoireTrainer() {
  const [systemId, setSystemId] = useState<keyof typeof SYSTEMS>("italian");
  const system = SYSTEMS[systemId];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SYSTEMS) as (keyof typeof SYSTEMS)[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSystemId(id)}
            className={`min-h-11 rounded-md border px-4 text-[14px] transition-colors ${
              id === systemId
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:border-border-hover"
            }`}
          >
            {SYSTEMS[id].name}
            <span className="ml-2 opacity-60">
              {SYSTEMS[id].color === "w" ? "blancas" : "negras"}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[15px] leading-[1.7] text-muted-foreground">
        {system.rationale}
      </p>

      {/* Keyed on the system: switching sides is the only thing that should
          reset the board. Everything else lives inside Sandbox. */}
      <Sandbox key={systemId} system={system} />
    </div>
  );
}

function Sandbox({ system }: { system: System }) {
  // The Chess object is the mutable game model and lives in state, not a ref:
  // `fen` is the render-visible projection of it, updated on every mutation.
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [played, setPlayed] = useState<Played | null>(null);
  const [plies, setPlies] = useState(0);

  // The position right before the move that produced `fen`, so a resolved eval
  // for it (if the search finished in time) can grade that move retroactively.
  // Adjusted inline during render rather than in an effect + ref: reading a
  // ref while computing render output can tear under concurrent rendering,
  // and this is exactly the "store info from a previous render" case React's
  // own docs recommend handling with a state update during render.
  const [renderedFen, setRenderedFen] = useState(fen);
  const [previousFen, setPreviousFen] = useState(fen);
  if (fen !== renderedFen) {
    setPreviousFen(renderedFen);
    setRenderedFen(fen);
  }

  // `lastMove` has to be handed over explicitly: the board is rebuilt from a
  // FEN, which carries no history, so `consultBook` could never see that the
  // opponent had just captured — the recapture rule has been dead in the UI
  // since it was written, and only ever fired in the scripts, which pass a live
  // game object.
  const book = useMemo(
    () => consultBook(system, new Chess(fen), { lastMove }),
    [system, fen, lastMove]
  );
  const progress = useMemo(() => setupProgress(system, new Chess(fen)), [system, fen]);

  const position = useMemo(() => new Chess(fen), [fen]);
  const myColorToMove = position.turn() === system.color;
  const over = position.isGameOver();

  // The position the setup's own move would produce, so the engine can price
  // the plan as well as the position. Only needed while the plan has an opinion.
  const bookFen = useMemo(() => {
    if (!myColorToMove || over) return null;
    const chess = new Chess(fen);
    const move = bookMoveOf(book, chess);
    if (!move) return null;
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    return chess.fen();
  }, [book, fen, myColorToMove, over]);

  const engine = useEngine([fen, bookFen]);
  const here = engine.get(fen);

  /**
   * What following the setup costs, in centipawns. Both scores are side-to-move
   * relative, so the plan's value to him is the negation of the reply position's
   * score, and the difference between the two is the price of the plan.
   */
  const planCost = useMemo(() => {
    if (!bookFen || !here) return null;
    const after = engine.get(bookFen);
    if (!after) return null;
    return {
      cp: here.cp + after.cp,
      /** The plan walks into a mate that wasn't already on the board. */
      mated: after.mate != null && after.mate > 0 && !(here.mate != null && here.mate < 0),
    };
  }, [bookFen, here, engine]);

  /**
   * What to play. The engine's move as soon as its own search resolves — it does
   * not wait on the plan's cost, which arrives later and only annotates. The
   * setup answers until then, and if the engine never loads at all.
   */
  const advice = useMemo<Advice | null>(() => {
    if (!myColorToMove || over) return null;
    const bookSan = bookSanOf(book);
    const engineSan = here?.bestMove ? uciToSan(fen, here.bestMove) : null;
    if (!engineSan) {
      return bookSan ? { san: bookSan, from: "esquema", bookSan, engineSan: null } : null;
    }
    if (bookSan && engineSan === bookSan) {
      return { san: engineSan, from: "ambos", bookSan, engineSan };
    }
    return { san: engineSan, from: "motor", bookSan, engineSan };
  }, [myColorToMove, over, book, here, fen]);

  /** The plan's move is the engine's move: nothing to reconcile. */
  const planIsBest = advice?.from === "ambos";

  /**
   * A reason for the engine's move, derived from the position. Only needed when
   * the engine went somewhere the setup didn't — otherwise the setup's own prose
   * is about the move on screen and says more.
   */
  const engineReason = useMemo(() => {
    if (advice?.from !== "motor") return null;
    return explainMove(system, new Chess(fen), advice.san);
  }, [advice, system, fen]);

  const interactive = !over;
  const canUndo = plies > 0;
  const moveNumber = Math.floor(plies / 2) + 1;
  const phase = gamePhase(moveNumber, fen);
  const theirTurn = !myColorToMove && !over;
  /** The engine was asked and hasn't answered — the plan is standing in. */
  const thinking = !engine.unavailable && !here && myColorToMove && !over;

  /** The evaluation from his side of the board, whoever is to move. */
  const score = useMemo(() => {
    if (!here) return null;
    if (here.mate != null) {
      const moves = Math.abs(here.mate);
      const mine = myColorToMove ? here.mate > 0 : here.mate < 0;
      return mine ? `das mate en ${moves}` : `te dan mate en ${moves}`;
    }
    return pawns(myColorToMove ? here.cp : -here.cp);
  }, [here, myColorToMove]);

  // Grades whatever move just led to `fen`, when both the before and after
  // evals happened to resolve in time. If the search was still running when
  // the next move was played, this quietly stays null — no badge, no error.
  const lastMoveQuality: MoveQuality | null = useMemo(() => {
    if (previousFen === fen) return null;
    const before = engine.get(previousFen);
    const after = engine.get(fen);
    if (!before || !after || before.mate != null || after.mate != null) return null;
    return moveQuality(before.cp, -after.cp);
  }, [engine, fen, previousFen]);

  const highlights = useMemo<Highlight[]>(() => {
    if (!advice) return [];
    const move = new Chess(fen).moves({ verbose: true }).find((m) => m.san === advice.san);
    return move
      ? [
          { square: move.from, tone: "focus" as const },
          { square: move.to, tone: "focus" as const },
        ]
      : [];
  }, [advice, fen]);

  function commit(chess: Chess, move: LastMove | null) {
    setLastMove(move);
    setFen(chess.fen());
    setPlies(chess.history().length);
  }

  function reset() {
    game.reset();
    setPlayed(null);
    commit(game, null);
  }

  function handleMove(move: BoardMove) {
    const chess = game;
    const wanted = chess.turn() === system.color ? (advice?.san ?? null) : null;
    const done = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    if (!done) return;
    // Nothing is ever blocked or called wrong on the spot. The grade arrives a
    // beat later from the engine, in win-probability terms, which is the only
    // honest answer to "¿estuvo mal?" — most non-best moves are perfectly fine.
    setPlayed(wanted ? { san: done.san, wanted } : null);
    commit(chess, { from: done.from, to: done.to, captured: done.captured });
  }

  function undo() {
    if (!canUndo) return;
    game.undo();
    setPlayed(null);
    commit(game, lastMoveOf(game));
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <Board
          fen={fen}
          orientation={system.color}
          interactive={interactive}
          onMove={handleMove}
          lastMove={lastMove}
          highlights={highlights}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="rounded border border-border px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-foreground">
            {PHASE_LABEL[phase]}
          </span>
          <span>
            Jugada {moveNumber} ·{" "}
            <span className="text-foreground">
              {myColorToMove
                ? system.color === "w"
                  ? "movés vos (blancas)"
                  : "movés vos (negras)"
                : "movés por el rival"}
            </span>
          </span>
          {score && <span className="tabular-nums text-foreground">{score}</span>}
          {canUndo && (
            <button
              type="button"
              onClick={undo}
              className="text-primary underline underline-offset-4 hover:opacity-70"
            >
              Deshacer
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-primary underline underline-offset-4 hover:opacity-70"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="min-h-[9rem] rounded-lg border border-border bg-surface p-4">
          {over ? (
            <div className="space-y-3">
              <p className="text-[15px] leading-[1.7] text-foreground">
                Se terminó la partida.
              </p>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
              >
                Empezar de nuevo
              </button>
            </div>
          ) : theirTurn ? (
            <div className="space-y-2">
              <p className="text-[15px] leading-[1.7] text-muted-foreground">
                Movés por el rival. Probá lo que quieras — cuando te toque a vos,
                acá aparece qué conviene y por qué.
              </p>
              <LastMoveLine played={played} quality={lastMoveQuality} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[15px] leading-[1.7] text-foreground">
                {advice ? (
                  <>
                    Jugá{" "}
                    <span className="font-medium text-primary">{sanEs(advice.san)}</span>
                    {advice.from === "ambos" && (
                      <span className="text-muted-foreground">
                        {" "}
                        — el esquema y el motor coinciden
                      </span>
                    )}
                    {advice.from === "esquema" && !advice.engineSan && (
                      <span className="text-muted-foreground"> — por ahora, según el esquema</span>
                    )}
                    .
                  </>
                ) : (
                  "Te toca."
                )}
              </p>

              <Reason
                book={book}
                advice={advice}
                planCost={planCost}
                engineReason={engineReason}
              />

              <LastMoveLine played={played} quality={lastMoveQuality} />

              {/* Faded in on a delay so it only ever appears when the engine is
                  actually taking a moment — the first search of a session pays
                  for a 7MB download and a WASM compile. Once warm it resolves
                  well inside the delay and this never paints. */}
              {thinking && (
                <p className="animate-[fade-in_200ms_ease-out_1.2s_both] text-[13px] text-muted-foreground opacity-70">
                  El motor todavía está mirando esta posición.
                </p>
              )}
              {engine.unavailable && (
                <p className="text-[13px] text-muted-foreground opacity-70">
                  El motor no cargó en este navegador. Queda el esquema, que corre
                  sin descargar nada.
                </p>
              )}
            </div>
          )}
        </div>

        <Plan
          system={system}
          progress={progress}
          book={book}
          planIsBest={planIsBest}
          standing={
            myColorToMove && (book.kind === "done" || book.kind === "out") ? book.idea : null
          }
        />
      </div>
    </div>
  );
}

/** Why that move — the half Stockfish cannot supply. */
function Reason({
  book,
  advice,
  planCost,
  engineReason,
}: {
  book: BookAnswer;
  advice: Advice | null;
  planCost: { cp: number; mated: boolean } | null;
  engineReason: string | null;
}) {
  const warning =
    book.kind === "move" && book.warning ? (
      <p className="text-[14px] leading-[1.6] text-destructive">{book.warning}</p>
    ) : null;

  // The move on screen is the setup's own, so the setup's prose is about it.
  if (!advice || advice.from === "ambos" || advice.from === "esquema") {
    return (
      <div className="space-y-2">
        <p className="text-[14px] leading-[1.7] text-muted-foreground">{book.idea}</p>
        {warning}
      </div>
    );
  }

  // The engine went its own way, so the setup's `idea` describes a *different*
  // move and cannot be the explanation — printing it here was the bug: "jugá d4"
  // over "ésta para el mate", which was about `Cg4`. Once the setup is finished
  // its `idea` is a standing paragraph about the rest of the game, which belongs
  // under the plan, printed once, not repeated on every move.
  const cp = planCost?.cp ?? null;
  const gap = planCost?.mated
    ? "entra en mate forzado"
    : cp == null
      ? "todavía estoy midiendo por cuánto"
      : cp >= PLAN_IS_A_MISTAKE
        ? `cuesta ${(cp / 100).toFixed(1)}: acá el esquema es un error`
        : cp >= PLAN_COSTS_LITTLE
          ? `cuesta ${(cp / 100).toFixed(1)}`
          : cp > 0
            ? `la diferencia es ${(cp / 100).toFixed(1)}, casi nada`
            : "a esta profundidad da lo mismo";

  return (
    <div className="space-y-2">
      <p className="text-[14px] leading-[1.7] text-muted-foreground">
        {engineReason ?? "Es posicional: no hay nada concreto que señalar sin inventarlo."}
      </p>
      {advice.bookSan && (
        <p className="text-[13px] leading-[1.6] text-muted-foreground opacity-80">
          El esquema pedía{" "}
          <span className="text-foreground">{sanEs(advice.bookSan)}</span> y {gap}.
        </p>
      )}
      {warning}
    </div>
  );
}

/** How the move he just played actually turned out, once the engine says so. */
function LastMoveLine({
  played,
  quality,
}: {
  played: Played | null;
  quality: MoveQuality | null;
}) {
  if (!played) return null;
  const matched = played.wanted === played.san;
  const tone = quality ? QUALITY_TONE[quality] : "neutral";
  return (
    <p
      className={`text-[14px] leading-[1.6] ${
        tone === "bad"
          ? "text-destructive"
          : tone === "good"
            ? "text-primary"
            : "text-muted-foreground"
      }`}
    >
      Jugaste {sanEs(played.san)}
      {quality ? `: ${quality}` : ""}
      {!matched && played.wanted ? `. Se sugería ${sanEs(played.wanted)}` : ""}.
    </p>
  );
}

/** The setup, as a plan you can be inside or outside of. */
function Plan({
  system,
  progress,
  book,
  planIsBest,
  standing,
}: {
  system: System;
  progress: ReturnType<typeof setupProgress>;
  book: BookAnswer;
  planIsBest: boolean;
  /** The setup's closing paragraph, once the setup itself is over. */
  standing: string | null;
}) {
  const left = progress.filter((p) => !p.resolved).length;
  const status =
    left === 0
      ? "completo"
      : planIsBest
        ? "en curso, y coincide con el motor"
        : "en curso";

  return (
    <div className="space-y-2">
      <p className="text-[13px] text-muted-foreground">
        <span className="uppercase tracking-wide text-foreground">{system.name}</span>{" "}
        · {status}
      </p>
      <ol className="space-y-1.5">
        {progress.map((item, i) => {
          const current =
            book.kind === "move" && book.source === "setup" && book.step === i + 1;
          return (
            <li
              key={`${item.step.from}${item.step.to}`}
              className={`flex items-baseline gap-3 rounded-md px-2 py-1.5 text-[14px] transition-colors ${
                current ? "bg-surface text-foreground" : ""
              }`}
            >
              <span
                className={`w-4 shrink-0 text-[12px] tabular-nums ${
                  item.resolved ? "text-primary" : "text-muted-foreground opacity-50"
                }`}
                title={
                  item.resolved && !item.placed
                    ? "La pieza salió de su casilla, así que el paso queda cerrado"
                    : undefined
                }
              >
                {item.placed ? "✓" : item.resolved ? "–" : i + 1}
              </span>
              <span
                className={`w-14 shrink-0 font-medium ${
                  item.resolved
                    ? "text-muted-foreground line-through opacity-60"
                    : current
                      ? "text-primary"
                      : "text-foreground"
                }`}
              >
                {item.label}
              </span>
              {current && (
                <span className="text-[13px] leading-[1.6] text-muted-foreground">
                  {item.step.idea}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {standing && (
        <p className="pt-1 text-[13px] leading-[1.7] text-muted-foreground">{standing}</p>
      )}
    </div>
  );
}
