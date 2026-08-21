import { NextResponse } from "next/server";
import {
  CHESS_USERNAME,
  fetchAnalyzedGames,
  fetchStats,
} from "@/lib/chess/chesscom";

export const runtime = "nodejs";
/** Exchange evaluation over a full backfill runs well past the default budget. */
export const maxDuration = 60;

const MAX_GAMES = 40;

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(Math.max(positiveInt(params.get("limit"), 20), 1), MAX_GAMES);
  /** Unix seconds of the newest game the caller already holds. */
  const since = positiveInt(params.get("since"), 0);

  try {
    const [games, stats] = await Promise.all([
      fetchAnalyzedGames(CHESS_USERNAME, limit, since),
      fetchStats(CHESS_USERNAME).catch(() => null),
    ]);

    // The scorecard is computed by the caller: on an incremental sync it owns
    // the merged window, and only it knows what it already had.
    return NextResponse.json({
      games,
      incremental: since > 0,
      ratings: {
        rapid: stats?.chess_rapid?.last?.rating ?? null,
        rapidBest: stats?.chess_rapid?.best?.rating ?? null,
        tactics: stats?.tactics?.highest?.rating ?? null,
      },
      syncedAt: Date.now(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo leer chess.com";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
