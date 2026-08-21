"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board, type BoardMove, type Highlight } from "./board";
import {
  consultBook,
  opponentReply,
  setupProgress,
  SYSTEMS,
  type System,
} from "@/lib/chess/repertoire";
import { bestExchange, pieceEs, PIECE_VALUE } from "@/lib/chess/see";
import { sanEs } from "@/lib/chess/format";

type Feedback = { tone: "good" | "bad"; text: string };

type LastMove = { from: Square; to: Square; captured?: string };

function playOpponent(chess: Chess, plan: string[]): LastMove | null {
  if (chess.isGameOver()) return null;
  const san = opponentReply(chess, plan);
  if (!san) return null;
  const last = chess.history({ verbose: true }).at(-1);
  return last
    ? { from: last.from, to: last.to, captured: last.captured }
    : null;
}

export function RepertoireTrainer() {
  const [systemId, setSystemId] = useState<System["id"]>("london");
  const [planIndex, setPlanIndex] = useState(0);
  const system = SYSTEMS[systemId];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SYSTEMS) as System["id"][]).map((id) => (
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

      {/* Keyed so switching system or plan remounts a fresh round: the reset
          lives in mount, not in an effect that would cascade renders. */}
      <Drill
        key={`${systemId}:${planIndex}`}
        system={system}
        planIndex={planIndex}
        onNewPlan={() => setPlanIndex((n) => n + 1)}
      />
    </div>
  );
}

function Drill({
  system,
  planIndex,
  onNewPlan,
}: {
  system: System;
  planIndex: number;
  onNewPlan: () => void;
}) {
  const plan = system.plans[planIndex % system.plans.length];

  // The Chess object is the mutable game model and lives in state, not a ref:
  // `fen` is the render-visible projection of it, updated on every mutation.
  const [initial] = useState(() => {
    const chess = new Chess();
    const opened = system.color === "b" ? playOpponent(chess, plan.moves) : null;
    return { chess, fen: chess.fen(), opened };
  });
  const game = initial.chess;

  const [fen, setFen] = useState(initial.fen);
  const [lastMove, setLastMove] = useState<LastMove | null>(initial.opened);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Derived from state rather than a mutable ref, so what the panel shows
  // is always the same verdict that handleMove grades against.
  const book = useMemo(
    () => consultBook(system, new Chess(fen), lastMove),
    [system, fen, lastMove]
  );
  const progress = useMemo(
    () => setupProgress(system, new Chess(fen)),
    [system, fen]
  );

  const position = useMemo(() => new Chess(fen), [fen]);
  const myColorToMove = position.turn() === system.color;
  // While the opponent is thinking the book has nothing to say, and that must
  // not read as "the book is over".
  const bookOver =
    myColorToMove && (book.kind === "done" || book.kind === "out");
  const finished = bookOver || position.isGameOver();
  const myTurn = !thinking && !finished && myColorToMove;

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

  function handleMove(move: BoardMove) {
    const chess = game;
    if (chess.turn() !== system.color || thinking) return;

    const expected = consultBook(system, chess, lastMove);
    const played = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    if (!played) return;

    const correct =
      expected.kind === "move"
        ? played.san === expected.san
        : expected.kind === "tactic"
          ? played.to === expected.square && Boolean(played.captured)
          : true;

    if (!correct) {
      const exposed = bestExchange(chess.fen());
      const hangingPiece = exposed ? chess.get(exposed.square)?.type : null;
      chess.undo();
      setFen(chess.fen());
      setRevealed(true);

      const head =
        expected.kind === "move"
          ? `El libro dice ${sanEs(expected.san)}.`
          : expected.kind === "tactic"
            ? `Antes de seguir el esquema: hay material gratis en ${expected.square}.`
            : "Esa no.";
      const tail =
        exposed && exposed.value >= PIECE_VALUE.n && hangingPiece
          ? ` Y ojo con ${sanEs(played.san)}: deja ${pieceEs(hangingPiece)} sin defensa en ${exposed.square}.`
          : "";

      setFeedback({ tone: "bad", text: head + tail });
      setMistakes((n) => n + 1);
      return;
    }

    setLastMove({ from: played.from, to: played.to });
    setFen(chess.fen());
    setRevealed(false);
    setFeedback({
      tone: "good",
      text: expected.kind === "move" || expected.kind === "tactic" ? expected.idea : "",
    });

    setThinking(true);
    window.setTimeout(() => {
      const reply = playOpponent(chess, plan.moves);
      if (reply) setLastMove(reply);
      setFen(chess.fen());
      setThinking(false);
    }, 420);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Board
            fen={fen}
            orientation={system.color}
            interactive={myTurn}
            onMove={handleMove}
            lastMove={lastMove}
            highlights={highlights}
          />
          <p className="text-[13px] text-muted-foreground">
            El rival juega el plan{" "}
            <span className="text-foreground">{plan.name}</span>.{" "}
            <button
              type="button"
              onClick={() => onNewPlan()}
              className="text-primary underline underline-offset-4 hover:opacity-70"
            >
              Otro plan
            </button>
          </p>
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
                      item.resolved
                        ? "text-primary"
                        : "text-muted-foreground opacity-50"
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
                  {bookOver ? book.idea : "Se terminó la ronda."}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {mistakes === 0
                    ? "Ronda limpia, sin errores."
                    : `${mistakes} ${mistakes === 1 ? "error" : "errores"} en esta ronda.`}
                </p>
                <button
                  type="button"
                  onClick={() => onNewPlan()}
                  className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
                >
                  Otra ronda
                </button>
              </div>
            ) : (
              // The hint stays available every move, not just the first: the
              // point of the drill is to be told, then to need telling less.
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
                  {feedback ? feedback.text : "Te toca. Jugá la del esquema."}
                </p>
                {myTurn && !revealed && (
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
    </div>
  );
}
