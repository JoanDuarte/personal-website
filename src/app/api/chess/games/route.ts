import { NextResponse } from "next/server";
import { scorecard } from "@/lib/chess/analyze";
import {
  CHESS_USERNAME,
  fetchAnalyzedGames,
  fetchStats,
} from "@/lib/chess/chesscom";

export const runtime = "nodejs";
/** Analysis is ~0.3s per game; 40 games needs more than the default budget. */
export const maxDuration = 60;

const MAX_GAMES = 40;

export async function GET(request: Request) {
  const requested = Number(new URL(request.url).searchParams.get("limit") ?? 20);
  const limit = Math.min(
    Math.max(Number.isFinite(requested) ? requested : 20, 1),
    MAX_GAMES
  );

  try {
    const [games, stats] = await Promise.all([
      fetchAnalyzedGames(CHESS_USERNAME, limit),
      fetchStats(CHESS_USERNAME).catch(() => null),
    ]);

    return NextResponse.json({
      games,
      scorecard: scorecard(games),
      puzzles: games.flatMap((g) => g.puzzles),
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
