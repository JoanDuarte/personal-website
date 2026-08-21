import { analyzeGame, type ChessComGame, type GameAnalysis } from "./analyze";

export const CHESS_USERNAME = "joanmduarte";

/**
 * chess.com blocks requests with a generic or missing User-Agent, so it has to
 * identify the app. Public endpoints only — no auth, no credentials.
 */
const HEADERS = {
  "User-Agent": "joanduarte.vercel.app/chess (contact: joanduartepoliti@gmail.com)",
};

/** Archive listings change only when a new month starts. */
const ARCHIVE_TTL = 60 * 60;
/** Games within a month change whenever he plays. */
const GAMES_TTL = 60;

async function getJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, { headers: HEADERS, next: { revalidate } });
  if (!response.ok) {
    throw new Error(`chess.com responded ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchArchives(username: string): Promise<string[]> {
  const { archives } = await getJson<{ archives: string[] }>(
    `https://api.chess.com/pub/player/${username}/games/archives`,
    ARCHIVE_TTL
  );
  return archives;
}

export type PlayerStats = {
  chess_rapid?: { last?: { rating: number }; best?: { rating: number } };
  tactics?: { highest?: { rating: number } };
};

export async function fetchStats(username: string): Promise<PlayerStats> {
  return getJson<PlayerStats>(
    `https://api.chess.com/pub/player/${username}/stats`,
    GAMES_TTL
  );
}

/**
 * The most recent `limit` rated rapid games, newest first, already analyzed.
 *
 * Walks archives backwards so a sync after a session reads one month, not
 * thirty. Analysis is ~0.3s per game, so the limit is what keeps this inside a
 * sane response time.
 */
export async function fetchAnalyzedGames(
  username: string,
  limit: number
): Promise<GameAnalysis[]> {
  const archives = await fetchArchives(username);
  const collected: ChessComGame[] = [];

  for (const url of [...archives].reverse()) {
    if (collected.length >= limit) break;
    const { games } = await getJson<{ games: ChessComGame[] }>(url, GAMES_TTL);
    const rapid = games.filter(
      (g) => g.rules === "chess" && g.time_class === "rapid"
    );
    collected.push(...rapid);
  }

  return collected
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, limit)
    .map((game) => analyzeGame(game, username))
    .filter((game): game is GameAnalysis => game !== null);
}
