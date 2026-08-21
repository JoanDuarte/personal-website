"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameAnalysis } from "@/lib/chess/analyze";
import { mergeGames, scorecard } from "@/lib/chess/scorecard";
import { RepertoireTrainer } from "./repertoire-trainer";
import { PuzzleTrainer } from "./puzzle-trainer";
import { Review } from "./review";

const STORAGE_KEY = "chess-sync-v2";
/** Games kept for the rolling metrics. Wide enough to be stable, narrow enough to move. */
const WINDOW = 40;
/** Games requested when there is nothing stored yet. */
const BACKFILL = 20;

type Synced = {
  games: GameAnalysis[];
  syncedAt: number;
};

const TABS = [
  {
    id: "repertorio",
    step: "Antes de jugar",
    label: "Repertorio",
    blurb:
      "Dos minutos de repaso y jugás sin la pantalla abierta. Tener el esquema en la cabeza en vez de en el monitor es lo que te deja el reloj entero para las jugadas 11 a 25, que es donde se te van las partidas.",
  },
  {
    id: "repaso",
    step: "Después de jugar",
    label: "Repaso",
    blurb:
      "Traé las partidas de hoy y mirá las dos cifras que importan, contra la línea de base de tus 311 partidas de 2026.",
  },
  {
    id: "entrenador",
    step: "Cuando tengas diez minutos",
    label: "Entrenador",
    blurb:
      "Los puzzles salen de las partidas que acabás de sincronizar. Son tus posiciones, no las de un libro, y la mitad no tiene nada que encontrar.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ChessWorkspace() {
  const [tab, setTab] = useState<TabId>("repertorio");
  const [data, setData] = useState<Synced | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** How many games the last sync actually brought in. */
  const [fresh, setFresh] = useState<number | null>(null);

  const card = useMemo(
    () => (data ? scorecard(data.games) : null),
    [data]
  );
  const puzzles = useMemo(
    () => data?.games.flatMap((g) => g.puzzles) ?? [],
    [data]
  );

  // A sync costs a chess.com round trip plus a few seconds of analysis, so the
  // last one is kept: reloading the page shouldn't mean re-earning the puzzles.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored) as Synced);
    } catch {
      // Corrupt or unavailable storage just means starting empty.
    }
  }, []);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFresh(null);
    try {
      // Only ask for what is missing. Analysis is the slow half and a finished
      // game's analysis never changes, so a sync after a session costs one
      // session's worth of work rather than a full re-derivation.
      const held = data?.games ?? [];
      const since = held.length > 0 ? Math.max(...held.map((g) => g.endTime)) : 0;
      const limit = since > 0 ? WINDOW : BACKFILL;

      const response = await fetch(
        `/api/chess/games?limit=${limit}&since=${since}`
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error ?? "chess.com no respondió");
      }

      const merged = mergeGames(body.games as GameAnalysis[], held, WINDOW);
      const next: Synced = { games: merged, syncedAt: body.syncedAt };
      setData(next);
      setFresh(body.games.length);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Over quota: the sync still worked for this session.
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudieron traer las partidas: ${err.message}`
          : "No se pudieron traer las partidas."
      );
    } finally {
      setLoading(false);
    }
  }, [data]);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px min-h-11 border-b-2 px-1 text-[14px] transition-colors ${
              t.id === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id === "entrenador" && puzzles.length > 0 && (
              <span className="ml-2 text-[12px] tabular-nums text-primary">
                {puzzles.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="space-y-2">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {active.step}
        </p>
        <p className="text-[16px] leading-[1.7] text-muted-foreground">
          {active.blurb}
        </p>
      </div>

      {tab === "repertorio" && <RepertoireTrainer />}
      {tab === "repaso" && (
        <Review
          games={data?.games ?? []}
          card={card}
          loading={loading}
          error={error}
          onSync={sync}
          syncedAt={data?.syncedAt ?? null}
          fresh={fresh}
        />
      )}
      {tab === "entrenador" && <PuzzleTrainer puzzles={puzzles} />}
    </div>
  );
}
