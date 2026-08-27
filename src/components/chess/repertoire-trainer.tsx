"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board, type BoardMove, type Highlight } from "./board";
import { useEngine } from "./use-engine";
import { consultBook, setupProgress, SYSTEMS, type System } from "@/lib/chess/repertoire";
import { bestExchange, pieceEs, PIECE_VALUE } from "@/lib/chess/see";
import { uciToSan } from "@/lib/chess/engine";
import { sanEs, pawns } from "@/lib/chess/format";
import {
  gamePhase,
  moveQuality,
  PHASE_LABEL,
  QUALITY_TONE,
  type MoveQuality,
} from "@/lib/chess/phase";

type Feedback = { tone: "good" | "bad"; text: string };
type LastMove = { from: Square; to: Square; captured?: string };

function lastMoveOf(chess: Chess): LastMove | null {
  const last = chess.history({ verbose: true }).at(-1);
  return last
    ? { from: last.from, to: last.to, captured: last.captured }
    : null;
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
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [plies, setPlies] = useState(0);

  const engine = useEngine(fen);
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

  // Derived from state rather than a mutable ref, so what the panel shows
  // is always the same verdict that handleMove grades against.
  const book = useMemo(() => consultBook(system, new Chess(fen)), [system, fen]);
  const progress = useMemo(() => setupProgress(system, new Chess(fen)), [system, fen]);

  const position = useMemo(() => new Chess(fen), [fen]);
  const myColorToMove = position.turn() === system.color;
  const over = position.isGameOver();
  const bookDone = myColorToMove && book.kind === "done";
  const bookSilent = myColorToMove && book.kind === "out";
  const finished = bookDone || bookSilent || over;

  const interactive = !over;
  const canUndo = plies > 0;
  const moveNumber = Math.floor(plies / 2) + 1;
  const phase = gamePhase(moveNumber, fen);

  // Once the book has nothing left to say, this is what replaces "pensá vos":
  // the engine's own top choice for the position, in plain terms. Silent while
  // the engine hasn't resolved yet or is unavailable — the fixed book already
  // covers the position, this is strictly additive.
  const engineNote = useMemo(() => {
    if (!myColorToMove || (book.kind !== "done" && book.kind !== "out")) return null;
    const result = engine.current;
    if (!result || !result.bestMove) return null;
    const san = uciToSan(fen, result.bestMove);
    if (!san) return null;
    const scoreText =
      result.mate != null ? `mate en ${Math.abs(result.mate)}` : pawns(result.cp);
    return `El motor sugiere ${sanEs(san)} (${scoreText}).`;
  }, [myColorToMove, book, engine, fen]);

  // Grades whatever move just led to `fen`, when both the before and after
  // evals happened to resolve in time. If the search was still running when
  // the next move was played, this quietly stays null — no badge, no error.
  const lastMoveQuality: MoveQuality | null = useMemo(() => {
    if (previousFen === fen) return null;
    const before = engine.get(previousFen);
    const after = engine.current;
    if (!before || !after || before.mate != null || after.mate != null) return null;
    return moveQuality(before.cp, -after.cp);
  }, [engine, fen, previousFen]);

  const highlights = useMemo<Highlight[]>(() => {
    if (!revealed) return [];
    if (book.kind === "move") {
      return [
        { square: book.from, tone: "focus" },
        { square: book.to, tone: "focus" },
      ];
    }
    if (book.kind === "tactic") return [{ square: book.square, tone: "danger" }];
    return [];
  }, [revealed, book]);

  function commit(chess: Chess, move: LastMove | null) {
    setLastMove(move);
    setFen(chess.fen());
    setPlies(chess.history().length);
  }

  function reset() {
    game.reset();
    setFeedback(null);
    setRevealed(false);
    commit(game, null);
  }

  function handleMove(move: BoardMove) {
    const chess = game;

    // Playing the "other hand": nothing to grade, the book speaks on its turn.
    if (chess.turn() !== system.color) {
      const played = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      if (!played) return;
      setFeedback(null);
      setRevealed(false);
      commit(chess, lastMoveOf(chess));
      return;
    }

    const expected = consultBook(system, chess);
    const played = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    if (!played) return;

    const correct =
      expected.kind === "move"
        ? played.san === expected.san
        : expected.kind === "tactic"
          ? played.to === expected.square && Boolean(played.captured)
          : true;

    if (!correct) {
      // The move stands — seeing a bishop get stuck is the lesson; being
      // blocked from playing it only asserts that the lesson exists.
      const exposed = bestExchange(chess.fen());
      const hangingPiece = exposed ? chess.get(exposed.square)?.type : null;
      const warning =
        exposed && exposed.value >= PIECE_VALUE.n && hangingPiece
          ? ` Y ojo con ${sanEs(played.san)}: deja ${pieceEs(hangingPiece)} sin defensa en ${exposed.square}.`
          : "";
      const says =
        expected.kind === "move"
          ? `El libro dice ${sanEs(expected.san)}.`
          : expected.kind === "tactic"
            ? `Antes de seguir el esquema: hay material gratis en ${expected.square}.`
            : "Esa no está en el esquema.";
      setRevealed(false);
      setFeedback({
        tone: "bad",
        text: `${says} Jugaste ${sanEs(played.san)} — seguimos desde acá.${warning}`,
      });
      commit(chess, { from: played.from, to: played.to, captured: played.captured });
      return;
    }

    setRevealed(false);
    setFeedback({
      tone: "good",
      text: expected.kind === "move" || expected.kind === "tactic" ? expected.idea : "",
    });
    commit(chess, { from: played.from, to: played.to, captured: played.captured });
  }

  function undo() {
    if (!canUndo) return;
    game.undo();
    setFeedback(null);
    setRevealed(false);
    commit(game, lastMoveOf(game));
  }

  const theirTurn = !myColorToMove && !over;

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
          {lastMoveQuality && (
            <span
              className={
                QUALITY_TONE[lastMoveQuality] === "bad"
                  ? "text-destructive"
                  : QUALITY_TONE[lastMoveQuality] === "good"
                    ? "text-primary"
                    : "text-muted-foreground"
              }
            >
              última jugada: {lastMoveQuality}
            </span>
          )}
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

        <div className="min-h-[7rem] rounded-lg border border-border bg-surface p-4">
          {finished ? (
            <div className="space-y-3">
              <p className="text-[15px] leading-[1.7] text-foreground">
                {over ? "Se terminó la partida." : book.idea}
              </p>
              {!over && myColorToMove && engineNote && (
                <p className="text-[14px] leading-[1.7] text-primary">{engineNote}</p>
              )}
              {!over && (
                <p className="text-[13px] text-muted-foreground">
                  Podés seguir moviendo desde acá.
                </p>
              )}
              <button
                type="button"
                onClick={reset}
                className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
              >
                Empezar de nuevo
              </button>
            </div>
          ) : (
            // The hint stays available every move, not just the first: the
            // point is to be told, then to need telling less.
            <div className="space-y-3">
              <p
                className={`text-[15px] leading-[1.7] ${
                  feedback
                    ? feedback.tone === "bad"
                      ? "text-destructive"
                      : "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {feedback
                  ? feedback.text
                  : theirTurn
                    ? "Movés por el rival. Probá lo que quieras: la respuesta del libro aparece acá."
                    : "Te toca. Jugá la del esquema."}
              </p>
              {/* Shown before the move is revealed: it names the move that
                  does NOT work here, which is a read on the position rather
                  than the answer. */}
              {book.kind === "move" && book.warning && myColorToMove && (
                <p className="text-[14px] leading-[1.6] text-destructive">{book.warning}</p>
              )}
              {myColorToMove && !revealed && (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="min-h-11 text-[14px] text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Mostrarme la jugada
                </button>
              )}
            </div>
          )}
        </div>

        {revealed && book.kind === "move" && (
          <p className="text-[14px] leading-[1.7] text-muted-foreground">
            <span className="font-medium text-primary">{sanEs(book.san)}</span>
            {" — "}
            {book.idea}
          </p>
        )}
      </div>
    </div>
  );
}
