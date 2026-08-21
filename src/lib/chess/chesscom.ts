import { analyzeGame, type ChessComGame, type GameAnalysis } from "./analyze";

export const CHESS_USERNAME = "joanmduarte";

/**
 * chess.com blocks requests with a generic or missing User-Agent, so it has to
 * identify the app. Public endpoints only — no auth, no credentials.
 */
const HEADERS = {
  "User-Agent": "joanduarte.vercel.app/chess (contact: joanduartepoliti@gmail.com)",
};

/**
 * Both listings get the same short TTL. The archive list only changes when a
 * month rolls over, but caching it for an hour means the first games of a new
 * month sit in an archive URL the cached list doesn't mention, and a sync that
 * day silently finds nothing. It is a few KB; the round trip is not worth saving.
 */
const ARCHIVE_TTL = 60;
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

/** Months fetched per round trip. He plays few enough that 4 usually suffices. */
const ARCHIVE_BATCH = 4;

/**
 * The most recent rapid games newer than `since`, newest first, already analyzed.
 *
 * Walks archives backwards in parallel batches: a strictly sequential walk cost
 * one round trip per month, and he has sparse months, so reaching 20 games meant
 * four serial fetches before any analysis started.
 *
 * `since` is what makes a repeat sync cheap. Analysis is the expensive half and
 * a game's analysis never changes, so the client keeps what it already has and
 * only the games played since the last sync are re-derived.
 */
export async function fetchAnalyzedGames(
  username: string,
  limit: number,
  since = 0
): Promise<GameAnalysis[]> {
  const archives = await fetchArchives(username);
  const newestFirst = [...archives].reverse();
  const collected: ChessComGame[] = [];

  for (let i = 0; i < newestFirst.length; i += ARCHIVE_BATCH) {
    const months = await Promise.all(
      newestFirst
        .slice(i, i + ARCHIVE_BATCH)
        .map((url) => getJson<{ games: ChessComGame[] }>(url, GAMES_TTL))
    );

    const rapid = months.flatMap((m) =>
      m.games.filter((g) => g.rules === "chess" && g.time_class === "rapid")
    );
    collected.push(...rapid);

    // Archives are chronological, so once a whole batch predates the last sync
    // every older month does too.
    if (since > 0 && rapid.every((g) => g.end_time <= since)) break;
    if (collected.filter((g) => g.end_time > since).length >= limit) break;
  }

  return collected
    .filter((game) => game.end_time > since)
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, limit)
    .map((game) => analyzeGame(game, username))
    .filter((game): game is GameAnalysis => game !== null);
}
