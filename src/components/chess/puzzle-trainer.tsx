"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Board, type BoardMove, type Highlight } from "./board";
import type { Puzzle } from "@/lib/chess/analyze";
import { pawns, relativeDay, sanEs } from "@/lib/chess/format";

type Answer = {
  correct: boolean;
  fen: string;
  san: string | null;
  lastMove: { from: Square; to: Square } | null;
};

type Filter = "all" | "defend" | "attack";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Mezclado" },
  { id: "defend", label: "¿Qué me captura?" },
  { id: "attack", label: "¿Qué gano yo?" },
];

/** Deterministic shuffle so the order is stable across re-renders. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function PuzzleTrainer({ puzzles }: { puzzles: Puzzle[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const deck = useMemo(() => {
    const pool = puzzles.filter((p) => filter === "all" || p.kind === filter);
    return shuffle(pool, pool.length * 7919 + 13);
  }, [puzzles, filter]);

  const puzzle = deck[index] ?? null;

  function choose(next: Filter) {
    setFilter(next);
    setIndex(0);
    setAnswer(null);
    setScore({ right: 0, total: 0 });
  }

  function record(correct: boolean, result: Omit<Answer, "correct">) {
    setAnswer({ correct, ...result });
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function handleMove(move: BoardMove) {
    if (!puzzle || answer) return;
    const chess = new Chess(puzzle.fen);
    const played = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    if (!played) return;
    record(puzzle.answers.includes(played.san), {
      fen: chess.fen(),
      san: played.san,
      lastMove: { from: played.from, to: played.to },
    });
  }

  function handleNothing() {
    if (!puzzle || answer) return;
    record(puzzle.answers.length === 0, {
      fen: puzzle.fen,
      san: null,
      lastMove: null,
    });
  }

  function next() {
    setAnswer(null);
    setIndex((n) => n + 1);
  }

  if (puzzles.length === 0) {
    return (
      <p className="text-[15px] leading-[1.7] text-muted-foreground">
        Sincronizá tus partidas y los puzzles salen de ahí: tus propias
        posiciones, no las de un libro.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => choose(f.id)}
            className={`min-h-11 rounded-md border px-3 text-[13px] transition-colors ${
              f.id === filter
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:border-border-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
        {score.total > 0 && (
          <span className="ml-auto text-[13px] tabular-nums text-muted-foreground">
            {score.right}/{score.total}
          </span>
        )}
      </div>

      {!puzzle ? (
        <div className="space-y-3">
          <p className="text-[15px] leading-[1.7] text-foreground">
            Terminaste la tanda: {score.right} de {score.total}.
          </p>
          <button
            type="button"
            onClick={() => choose(filter)}
            className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
          >
            Empezar de nuevo
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Board
            fen={answer ? answer.fen : puzzle.fen}
            orientation={puzzle.orientation}
            interactive={!answer}
            onMove={handleMove}
            lastMove={answer?.lastMove ?? null}
            highlights={
              answer && !answer.correct && puzzle.answers.length > 0
                ? ([
                    {
                      square: new Chess(puzzle.fen).move(puzzle.answers[0])
                        .to as Square,
                      tone: "danger",
                    },
                  ] as Highlight[])
                : []
            }
          />

          <div className="space-y-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {puzzle.kind === "defend" ? "Defensa" : "Ataque"} ·{" "}
              {index + 1} de {deck.length}
            </p>

            <p className="text-[16px] leading-[1.7] text-foreground">
              {puzzle.kind === "defend" ? (
                <>
                  Jugada {puzzle.moveNumber}: jugaste{" "}
                  <span className="text-primary">{sanEs(puzzle.playedSan)}</span>.
                  ¿Qué te contesta el rival?
                </>
              ) : (
                <>
                  Jugada {puzzle.moveNumber}, te toca mover. ¿Hay material
                  gratis?
                </>
              )}
            </p>

            {!answer ? (
              <button
                type="button"
                onClick={handleNothing}
                className="min-h-11 rounded-md border border-border px-4 text-[14px] text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
              >
                No hay nada
              </button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <p
                  className={`text-[15px] font-medium ${
                    answer.correct ? "text-primary" : "text-destructive"
                  }`}
                >
                  {answer.correct ? "Correcto." : "No."}
                </p>
                <p className="text-[15px] leading-[1.7] text-muted-foreground">
                  {puzzle.answers.length === 0 ? (
                    <>
                      No había nada colgado. Estas posiciones están mezcladas a
                      propósito: si supieras que siempre hay algo, estarías
                      entrenando a adivinar en vez de a mirar.
                    </>
                  ) : (
                    <>
                      <span className="text-foreground">
                        {sanEs(puzzle.answers[0])}
                      </span>{" "}
                      {puzzle.kind === "defend"
                        ? `te ganaba ${puzzle.target}`
                        : `ganaba ${puzzle.target}`}{" "}
                      ({pawns(puzzle.value)}).
                      {puzzle.answers.length > 1 &&
                        ` También servía ${sanEs(puzzle.answers[1])}.`}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={next}
                    className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
                  >
                    Siguiente
                  </button>
                  <a
                    href={puzzle.gameUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Ver la partida ({relativeDay(puzzle.date)})
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
