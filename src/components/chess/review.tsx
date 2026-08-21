"use client";

import type { GameAnalysis } from "@/lib/chess/analyze";
import type { Scorecard } from "@/lib/chess/scorecard";
import { clock, pawns, percent, relativeDay, sanEs } from "@/lib/chess/format";

/**
 * Where he started, measured over the 311 rapid games of 2026 before any of
 * this existed. Every number on this page is only meaningful against it.
 */
export const BASELINE = {
  timeLeftInLosses: 426,
  threwAwayRate: 0.4,
  hangsPerGame: 2.63,
};

const TARGET = {
  timeLeftInLosses: 300,
  threwAwayRate: 0.2,
};

function Metric({
  label,
  value,
  baseline,
  target,
  hint,
  better,
}: {
  label: string;
  value: string | null;
  baseline: string;
  target: string;
  hint: string;
  /** null when there isn't enough data to say. */
  better: boolean | null;
}) {
  return (
    <div className="space-y-2 border-t border-border py-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="flex items-baseline gap-3">
        <span
          className={`text-[28px] font-medium tabular-nums ${
            better === null
              ? "text-muted-foreground"
              : better
                ? "text-primary"
                : "text-foreground"
          }`}
        >
          {value ?? "—"}
        </span>
        <span className="text-[13px] text-muted-foreground">
          base {baseline} · objetivo {target}
        </span>
      </p>
      <p className="text-[14px] leading-[1.6] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function Review({
  games,
  card,
  loading,
  error,
  onSync,
  syncedAt,
  fresh,
}: {
  games: GameAnalysis[];
  card: Scorecard | null;
  loading: boolean;
  error: string | null;
  onSync: () => void;
  syncedAt: number | null;
  /** Games the last sync brought in, null before any sync this session. */
  fresh: number | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSync}
          disabled={loading}
          className="min-h-11 rounded-md border border-primary px-4 text-[14px] text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {loading
            ? "Analizando…"
            : syncedAt
              ? "Buscar partidas nuevas"
              : "Sincronizar con chess.com"}
        </button>
        {loading && (
          <span className="text-[13px] text-muted-foreground">
            La primera vez tarda: analiza cada jugada de cada partida. Después
            solo mira las nuevas.
          </span>
        )}
        {syncedAt && !loading && (
          <span className="text-[13px] text-muted-foreground">
            {fresh === 0
              ? `Sin partidas nuevas. ${games.length} en la ventana.`
              : fresh != null
                ? `${fresh} ${fresh === 1 ? "partida nueva" : "partidas nuevas"}. ${games.length} en la ventana.`
                : `${games.length} partidas rapid analizadas.`}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[15px] leading-[1.7] text-destructive">{error}</p>
      )}

      {card && card.games > 0 && (
        <>
          <div>
            <Metric
              label="Segundos sin usar al perder"
              value={card.timeLeftInLosses != null ? `${Math.round(card.timeLeftInLosses)}s` : null}
              baseline={`${BASELINE.timeLeftInLosses}s`}
              target={`${TARGET.timeLeftInLosses}s`}
              better={
                card.timeLeftInLosses == null
                  ? null
                  : card.timeLeftInLosses < BASELINE.timeLeftInLosses
              }
              hint="De 600. Perdés con más de la mitad del reloj en el bolsillo: el problema nunca fue el tiempo, fue no usarlo."
            />
            <Metric
              label="Ganadas que terminaste perdiendo"
              value={card.threwAwayRate != null ? percent(card.threwAwayRate) : null}
              baseline={percent(BASELINE.threwAwayRate)}
              target={percent(TARGET.threwAwayRate)}
              better={
                card.threwAwayRate == null
                  ? null
                  : card.threwAwayRate < BASELINE.threwAwayRate
              }
              hint={
                card.wasWinning > 0
                  ? `Llegaste a +3 de material en ${card.wasWinning} partidas y no ganaste ${card.threwAway}. Esta es tu fuga principal.`
                  : "Todavía no hay partidas con ventaja de +3 en esta muestra."
              }
            />
            <Metric
              label="Piezas colgadas por partida"
              value={card.hangsPerGame != null ? card.hangsPerGame.toFixed(2) : null}
              baseline={BASELINE.hangsPerGame.toFixed(2)}
              target="1.00"
              better={
                card.hangsPerGame == null
                  ? null
                  : card.hangsPerGame < BASELINE.hangsPerGame
              }
              hint="Jugadas que dejan una pieza o más a una captura simple. Cada una es un puzzle en la pestaña Entrenador."
            />
            <Metric
              label="Partidas dentro del repertorio"
              value={card.onBookRate != null ? percent(card.onBookRate) : null}
              baseline="—"
              target="80%"
              better={card.onBookRate == null ? null : card.onBookRate > 0.5}
              hint="Cuántas veces seguiste el Londres o el esquema indio hasta el final del libro sin desviarte."
            />
          </div>

          <ul className="divide-y divide-border border-t border-border">
            {games.map((game) => (
              <li key={game.url} className="py-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`text-[14px] font-medium ${
                      game.result === "win"
                        ? "text-primary"
                        : game.result === "loss"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {game.result === "win"
                      ? "Ganada"
                      : game.result === "loss"
                        ? "Perdida"
                        : "Tablas"}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {game.color === "w" ? "blancas" : "negras"} · {game.rating} vs{" "}
                    {game.opponentRating} · {game.termination} ·{" "}
                    {relativeDay(game.date)}
                  </span>
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    ver
                  </a>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
                  {game.timeLeft != null && (
                    <span>
                      Te sobraron{" "}
                      <span
                        className={
                          game.result === "loss" && game.timeLeft > 300
                            ? "text-destructive"
                            : "text-foreground"
                        }
                      >
                        {clock(game.timeLeft)}
                      </span>
                    </span>
                  )}
                  {game.hung.length > 0 && (
                    <span>
                      Colgaste{" "}
                      <span className="text-foreground">{game.hung.length}</span>
                    </span>
                  )}
                  {game.missed.length > 0 && (
                    <span>
                      Dejaste{" "}
                      <span className="text-foreground">
                        {game.missed.length}
                      </span>{" "}
                      gratis
                    </span>
                  )}
                </div>

                {game.threwItAway && (
                  <p className="mt-2 text-[14px] leading-[1.6] text-destructive">
                    Estuviste {pawns(game.peakMaterial)} en la jugada{" "}
                    {game.peakMoveNumber} y no la ganaste.
                  </p>
                )}

                {game.deviation ? (
                  <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                    Te saliste del libro en la {game.deviation.moveNumber}:
                    jugaste{" "}
                    <span className="text-foreground">
                      {sanEs(game.deviation.played)}
                    </span>{" "}
                    en vez de{" "}
                    <span className="text-primary">
                      {sanEs(game.deviation.book)}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-[14px] text-muted-foreground">
                    Repertorio completo, sin desviarte.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
