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

/**
 * "drill" has the opponent answer from a fixed plan, which is what you want when
 * the goal is to make the setup automatic. "libre" hands both sides over, which
 * is what you want when the goal is to understand it: play the opponent's try
 * yourself and read what the book says about it.
 */
type Mode = "drill" | "libre";

const MODES: { id: Mode; label: string; hint: string }[] = [
  {
    id: "drill",
    label: "Practicar",
    hint: "El rival responde solo, con un plan distinto cada ronda.",
  },
  {
    id: "libre",
    label: "Explorar",
    hint: "Movés las dos manos y nada te frena. El libro comenta en vez de corregir.",
  },
];

function playOpponent(chess: Chess, plan: string[]): LastMove | null {
  if (chess.isGameOver()) return null;
  const san = opponentReply(chess, plan);
  if (!san) return null;
  const last = chess.history({ verbose: true }).at(-1);
  return last
    ? { from: last.from, to: last.to, captured: last.captured }
    : null;
}

function lastMoveOf(chess: Chess): LastMove | null {
  const last = chess.history({ verbose: true }).at(-1);
  return last
    ? { from: last.from, to: last.to, captured: last.captured }
    : null;
}

export function RepertoireTrainer() {
  const [systemId, setSystemId] = useState<System["id"]>("london");
  const [planIndex, setPlanIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState<Mode>("drill");
  /** Has anything been played in the current round? */
  const [touched, setTouched] = useState(false);
  const system = SYSTEMS[systemId];

  function startFresh(change: () => void) {
    change();
    setRound((n) => n + 1);
    setTouched(false);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Switching mid-position is the point of Explorar, so the position is kept.
    // But before a single move it is not "mid-position" — and as Black the
    // opponent's first move has already been auto-played, which meant Explorar
    // handed you a board with a move on it you never chose.
    if (!touched) startFresh(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SYSTEMS) as System["id"][]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => startFresh(() => setSystemId(id))}
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => switchMode(m.id)}
              className={`min-h-11 rounded-md border px-3 text-[13px] transition-colors ${
                m.id === mode
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-border-hover"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {MODES.find((m) => m.id === mode)!.hint}
        </p>
      </div>

      {/* `round` is bumped by startFresh, never by the mode toggle on its own,
          so switching to Explorar mid-position keeps the position. */}
      <Drill
        key={`${systemId}:${planIndex}:${round}`}
        system={system}
        planIndex={planIndex}
        mode={mode}
        onReset={() => startFresh(() => setPlanIndex((n) => n + 1))}
        onPlay={() => setTouched(true)}
      />
    </div>
  );
}

function Drill({
  system,
  planIndex,
  mode,
  onReset,
  onPlay,
}: {
  system: System;
  planIndex: number;
  mode: Mode;
  onReset: () => void;
  onPlay: () => void;
}) {
  const plan = system.plans[planIndex % system.plans.length];
  const free = mode === "libre";

  // The Chess object is the mutable game model and lives in state, not a ref:
  // `fen` is the render-visible projection of it, updated on every mutation.
  const [initial] = useState(() => {
    const chess = new Chess();
    // Playing Black means the opponent opens — but only the bot does that. In
    // Explorar both sides are yours, including move one.
    const opened =
      system.color === "b" && mode === "drill"
        ? playOpponent(chess, plan.moves)
        : null;
    return { chess, fen: chess.fen(), opened, plies: chess.history().length };
  });
  const game = initial.chess;

  const [fen, setFen] = useState(initial.fen);
  const [lastMove, setLastMove] = useState<LastMove | null>(initial.opened);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [plies, setPlies] = useState(initial.plies);

  // Derived from state rather than a mutable ref, so what the panel shows
  // is always the same verdict that handleMove grades against.
  const book = useMemo(
    () => consultBook(system, new Chess(fen), { lastMove }),
    [system, fen, lastMove]
  );
  const progress = useMemo(
    () => setupProgress(system, new Chess(fen)),
    [system, fen]
  );

  const position = useMemo(() => new Chess(fen), [fen]);
  const myColorToMove = position.turn() === system.color;
  const over = position.isGameOver();
  // While the opponent is thinking the book has nothing to say, and that must
  // not read as "the book is over".
  const bookDone = myColorToMove && book.kind === "done";
  const bookSilent = myColorToMove && book.kind === "out";

  // The board only locks when the game is actually over. The book running out —
  // which includes being in check — is the end of the guidance, not the end of
  // the position, and locking there read as "checkmate, start again".
  const interactive = !over && !thinking && (free || myColorToMove);
  const canUndo = plies > (free ? 0 : initial.plies);

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
    onPlay();
    setLastMove(move);
    setFen(chess.fen());
    setPlies(chess.history().length);
  }

  function handleMove(move: BoardMove) {
    const chess = game;
    if (thinking) return;

    // Playing the opponent's side: nothing to grade, the book speaks next turn.
    if (chess.turn() !== system.color) {
      if (!free) return;
      const played = chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      if (!played) return;
      setFeedback(null);
      setRevealed(false);
      commit(chess, lastMoveOf(chess));
      return;
    }

    const expected = consultBook(system, chess, { lastMove });
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

      // Exploring lets the move stand. Seeing the bishop get stuck behind e3 is
      // the lesson; being blocked from playing it only says the lesson exists.
      if (free) {
        setRevealed(false);
        setFeedback({
          tone: "bad",
          text: `${says} Jugaste ${sanEs(played.san)} — seguimos desde acá.${warning}`,
        });
        commit(chess, {
          from: played.from,
          to: played.to,
          captured: played.captured,
        });
        return;
      }

      chess.undo();
      setFen(chess.fen());
      setRevealed(true);
      setFeedback({ tone: "bad", text: says + warning });
      setMistakes((n) => n + 1);
      return;
    }

    setRevealed(false);
    setFeedback({
      tone: "good",
      text: expected.kind === "move" || expected.kind === "tactic" ? expected.idea : "",
    });
    commit(chess, { from: played.from, to: played.to, captured: played.captured });

    if (free) return;

    setThinking(true);
    window.setTimeout(() => {
      const reply = playOpponent(chess, plan.moves);
      commit(chess, reply ?? lastMoveOf(chess));
      setThinking(false);
    }, 420);
  }

  function undo() {
    const chess = game;
    if (!canUndo || thinking) return;
    chess.undo();
    // In practice mode a single ply would land on the opponent's turn with no
    // one to answer, so it steps back to the last position that was his.
    if (!free && chess.turn() !== system.color && chess.history().length > initial.plies - 1) {
      chess.undo();
    }
    setFeedback(null);
    setRevealed(false);
    commit(chess, lastMoveOf(chess));
  }

  const theirTurn = free && !myColorToMove && !over;

  return (
    <div className="space-y-6">
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            {free ? (
              <span>
                Jugada {Math.floor(plies / 2) + 1} ·{" "}
                <span className="text-foreground">
                  {myColorToMove
                    ? system.color === "w"
                      ? "movés vos (blancas)"
                      : "movés vos (negras)"
                    : "movés por el rival"}
                </span>
              </span>
            ) : (
              <span>
                El rival juega el plan{" "}
                <span className="text-foreground">{plan.name}</span>.
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
              onClick={onReset}
              className="text-primary underline underline-offset-4 hover:opacity-70"
            >
              {free ? "Empezar de nuevo" : "Otro plan"}
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
            {bookDone || bookSilent || over ? (
              <div className="space-y-3">
                <p className="text-[15px] leading-[1.7] text-foreground">
                  {over ? "Se terminó la partida." : book.idea}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {mistakes === 0
                    ? "Sin errores hasta acá."
                    : `${mistakes} ${mistakes === 1 ? "error" : "errores"}.`}
                  {!over && " Podés seguir moviendo desde acá."}
                </p>
                <button
                  type="button"
                  onClick={onReset}
                  className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70"
                >
                  {free ? "Empezar de nuevo" : "Otra ronda"}
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
                  <p className="text-[14px] leading-[1.6] text-destructive">
                    {book.warning}
                  </p>
                )}
                {myColorToMove && !revealed && !thinking && (
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
