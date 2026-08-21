"use client";

import { useMemo, useState } from "react";
import { Chess, type Color, type Square } from "chess.js";
import { Piece } from "./pieces";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export type Highlight = { square: Square; tone: "danger" | "focus" };

export type BoardMove = { from: Square; to: Square; promotion?: string };

/** a1 is dark; a light square has an odd file+rank sum. */
function isLight(square: Square) {
  const file = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rank = RANKS.indexOf(square[1] as (typeof RANKS)[number]);
  return (file + rank) % 2 === 1;
}

export function Board({
  fen,
  orientation = "w",
  interactive = false,
  onMove,
  lastMove = null,
  highlights = [],
}: {
  fen: string;
  orientation?: Color;
  interactive?: boolean;
  onMove?: (move: BoardMove) => void;
  lastMove?: { from: Square; to: Square } | null;
  highlights?: Highlight[];
}) {
  const chess = useMemo(() => new Chess(fen), [fen]);

  // The selection is tagged with the position it was made in, so a new position
  // drops it without needing an effect to clear it.
  const [selection, setSelection] = useState<{ fen: string; square: Square } | null>(null);
  const selected = selection?.fen === fen ? selection.square : null;
  const setSelected = (square: Square | null) =>
    setSelection(square ? { fen, square } : null);

  const squares = useMemo(() => {
    const files = orientation === "w" ? [...FILES] : [...FILES].reverse();
    const ranks = orientation === "w" ? [...RANKS].reverse() : [...RANKS];
    return ranks.flatMap((rank, row) =>
      files.map((file, col) => ({ square: `${file}${rank}` as Square, row, col }))
    );
  }, [orientation]);

  const legal = useMemo(
    () => (selected ? chess.moves({ square: selected, verbose: true }) : []),
    [chess, selected]
  );
  const targets = useMemo(
    () => new Map(legal.map((m) => [m.to, m])),
    [legal]
  );

  const checkedKing = useMemo(() => {
    if (!chess.isCheck()) return null;
    const turn = chess.turn();
    return (
      chess
        .board()
        .flat()
        .find((p) => p && p.type === "k" && p.color === turn)?.square ?? null
    );
  }, [chess]);

  const tones = useMemo(
    () => new Map(highlights.map((h) => [h.square, h.tone])),
    [highlights]
  );

  function handleSquare(square: Square) {
    if (!interactive) return;

    const target = targets.get(square);
    if (selected && target) {
      // Underpromotion is never the right answer at this level.
      const promotion = target.promotion ? "q" : undefined;
      onMove?.({ from: selected, to: square, promotion });
      setSelected(null);
      return;
    }

    const piece = chess.get(square);
    setSelected(piece && piece.color === chess.turn() ? square : null);
  }

  return (
    <div
      className="grid aspect-square w-full select-none overflow-hidden rounded-lg border border-border"
      style={{ gridTemplateColumns: "repeat(8, 1fr)", touchAction: "manipulation" }}
    >
      {squares.map(({ square, row, col }) => {
        const piece = chess.get(square);
        const light = isLight(square);
        const tone = tones.get(square);
        const isTarget = targets.has(square);
        const isSelected = selected === square;
        const isLast =
          lastMove && (lastMove.from === square || lastMove.to === square);

        const background = tone
          ? tone === "danger"
            ? "var(--chess-danger)"
            : "var(--chess-focus)"
          : isSelected
            ? "var(--chess-selected)"
            : isLast
              ? "var(--chess-last)"
              : undefined;

        const Tag = interactive ? "button" : "div";

        return (
          <Tag
            key={square}
            {...(interactive
              ? { type: "button" as const, onClick: () => handleSquare(square) }
              : {})}
            aria-label={interactive ? square : undefined}
            className="relative flex items-center justify-center p-[6%]"
            style={{
              backgroundColor: light
                ? "var(--chess-light)"
                : "var(--chess-dark)",
              cursor: interactive ? "pointer" : "default",
            }}
          >
            {background && (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundColor: background }}
              />
            )}
            {square === checkedKing && (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundColor: "var(--chess-danger)" }}
              />
            )}

            {piece && (
              <span className="relative z-10 h-full w-full">
                <Piece type={piece.type} color={piece.color} />
              </span>
            )}

            {isTarget && (
              <span
                aria-hidden
                className="pointer-events-none absolute z-20"
                style={
                  piece
                    ? {
                        inset: "6%",
                        borderRadius: "9999px",
                        border: "0.35rem solid var(--chess-selected)",
                      }
                    : {
                        width: "28%",
                        height: "28%",
                        borderRadius: "9999px",
                        backgroundColor: "var(--chess-selected)",
                      }
                }
              />
            )}

            {col === 0 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-[6%] top-[4%] text-[9px] font-medium leading-none opacity-60 md:text-[10px]"
                style={{
                  color: light ? "var(--chess-dark)" : "var(--chess-light)",
                }}
              >
                {square[1]}
              </span>
            )}
            {row === 7 && (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-[4%] right-[6%] text-[9px] font-medium leading-none opacity-60 md:text-[10px]"
                style={{
                  color: light ? "var(--chess-dark)" : "var(--chess-light)",
                }}
              >
                {square[0]}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
