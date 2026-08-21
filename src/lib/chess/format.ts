const PIECE_ES: Record<string, string> = {
  N: "C", // caballo
  B: "A", // alfil
  R: "T", // torre
  Q: "D", // dama
  K: "R", // rey
};

/** English SAN to the Spanish notation chess.com shows him. */
export function sanEs(san: string): string {
  if (san.startsWith("O-O")) return san;
  let out = san;
  const lead = PIECE_ES[out[0]];
  if (lead) out = lead + out.slice(1);
  return out.replace(/=([NBRQ])/, (_, piece: string) => `=${PIECE_ES[piece]}`);
}

/** Seconds as a clock reading: 432 -> "7:12". */
export function clock(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

/** Centipawns as a piece count: 500 -> "+5". */
export function pawns(centipawns: number): string {
  return `${centipawns > 0 ? "+" : ""}${(centipawns / 100).toFixed(centipawns % 100 === 0 ? 0 : 1)}`;
}

export function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function relativeDay(iso: string, today = new Date()): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const days = Math.round(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())) /
      86_400_000
  );
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  return iso;
}
