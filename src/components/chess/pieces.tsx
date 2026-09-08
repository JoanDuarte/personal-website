import type { Color, PieceSymbol } from "chess.js";

/**
 * A minimal piece set drawn to match the site rather than imported from a
 * chess library: solid silhouettes, one path each, stroked so they stay legible
 * on both square colours.
 */

type Shape = { d: string; evenOdd?: boolean } | { circle: [number, number, number] };

const SHAPES: Record<PieceSymbol, Shape[]> = {
  p: [
    { circle: [22.5, 12.5, 4.8] },
    {
      d: "M17.6 18h9.8c-.7 2.7-2.2 4.3-2.2 6.4 0 3.2 3 4.8 4.2 8.6H16.1c1.2-3.8 4.2-5.4 4.2-8.6 0-2.1-1.5-3.7-2.2-6.4z",
    },
    { d: "M12.8 33h19.4l2.2 5H10.6z" },
  ],
  r: [
    { d: "M11.5 10.5h4.4v3.3h4.2v-3.3h4.8v3.3h4.2v-3.3h4.4v7.4h-22z" },
    { d: "M13.8 18h17.4l-1.2 12.5H15z" },
    { d: "M12.5 30.5h20l2.4 6.5H10.1z" },
  ],
  n: [
    {
      d: "M20.6 9.8l.4-4 3.1 3.3zM21.8 9.4c1.4-.1 2.4.7 3.5 2.3 2.6.5 5 2.1 6.6 4.7 1.8 2.9 2.6 6.9 2.6 11.9 0 1.4-.1 2.7-.3 3.9H13.6c-.2-2.9.6-5.5 2.4-8.3.6-1 .9-1.7.9-2.3 0-.8-.5-1.3-1.3-1.3-.9 0-1.7.6-2.5 1.7-.7 1-1.4 1.5-2.1 1.5-1.2 0-1.9-1.1-1.9-2.8 0-3 1.5-5.4 4.3-7.5 1.9-1.5 2.9-2.5 4.1-4.3.9-1.3 1.9-2 3-2.1zM17.9 18.4a1.25 1.25 0 1 0 .01 0z",
      evenOdd: true,
    },
    { d: "M12.5 31.5h20.5l2.3 5.8H10.2z" },
  ],
  b: [
    { circle: [22.5, 8.8, 2.4] },
    {
      d: "M22.5 11.6c4.6 2.6 7.2 6.4 7.2 10 0 2.6-1.4 4.7-3.2 6H18.5c-1.8-1.3-3.2-3.4-3.2-6 0-3.6 2.6-7.4 7.2-10z",
    },
    { d: "M16.2 28.4h12.6l1.1 3.3H15.1z" },
    { d: "M12.8 31.7h19.4l2.3 5.6H10.5z" },
  ],
  q: [
    { circle: [9.8, 10, 2.2] },
    { circle: [16.1, 7.6, 2.2] },
    { circle: [22.5, 6.8, 2.2] },
    { circle: [28.9, 7.6, 2.2] },
    { circle: [35.2, 10, 2.2] },
    {
      d: "M9.8 12.4l3.4 14.8h18.6l3.4-14.8-5.4 7.6-2.8-9.4-4.5 10-4.5-10-2.8 9.4z",
    },
    { d: "M13.2 27.2h18.6l1 3.4H12.2z" },
    { d: "M11.8 30.6h21.4l2.4 6.4H9.4z" },
  ],
  k: [
    { d: "M20.9 5.2h3.2v3.2h3.2v3.2h-3.2v3.6h-3.2v-3.6h-3.2V8.4h3.2z" },
    {
      d: "M22.5 14.6c5.7 0 9.9 3.7 9.9 8.4 0 3-1.4 5.7-3.3 7.7H15.9c-1.9-2-3.3-4.7-3.3-7.7 0-4.7 4.2-8.4 9.9-8.4z",
    },
    { d: "M15.3 30.7h14.4l1.1 3.2H14.2z" },
    { d: "M12.4 33.9h20.2l2.3 5.1H10.1z" },
  ],
};

export function Piece({
  type,
  color,
  className,
}: {
  type: PieceSymbol;
  color: Color;
  className?: string;
}) {
  const fill = color === "w" ? "var(--chess-piece-light)" : "var(--chess-piece-dark)";
  const stroke = color === "w" ? "var(--chess-piece-dark)" : "var(--chess-piece-light)";

  return (
    <svg
      viewBox="0 0 45 45"
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <g
        fill={fill}
        stroke={stroke}
        strokeWidth={1.1}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {SHAPES[type].map((shape, i) =>
          "circle" in shape ? (
            <circle
              key={i}
              cx={shape.circle[0]}
              cy={shape.circle[1]}
              r={shape.circle[2]}
            />
          ) : (
            <path
              key={i}
              d={shape.d}
              fillRule={shape.evenOdd ? "evenodd" : undefined}
            />
          )
        )}
      </g>
    </svg>
  );
}
