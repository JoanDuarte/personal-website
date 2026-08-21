import { analyzeGame, scorecard, type ChessComGame } from "@/lib/chess/analyze";
import { sanEs, clock, pawns, percent } from "@/lib/chess/format";

const UA = {
  "User-Agent": "joanduarte.vercel.app/chess (contact: joanduartepoliti@gmail.com)",
};
const USER = "joanmduarte";

const { archives } = await (
  await fetch(`https://api.chess.com/pub/player/${USER}/games/archives`, { headers: UA })
).json();

const collected: ChessComGame[] = [];
for (const url of [...archives].reverse()) {
  if (collected.length >= 20) break;
  const { games } = await (await fetch(url as string, { headers: UA })).json();
  collected.push(
    ...games.filter((g: ChessComGame) => g.rules === "chess" && g.time_class === "rapid")
  );
}

const start = Date.now();
const rows = collected
  .sort((a, b) => b.end_time - a.end_time)
  .slice(0, 20)
  .map((g) => analyzeGame(g, USER))
  .filter((g) => g !== null);
console.log(`analizadas ${rows.length} en ${((Date.now() - start) / 1000).toFixed(1)}s\n`);

const card = scorecard(rows);
console.log("=== SCORECARD (ultimas 20) ===");
console.log(`  ${card.wins}V ${card.draws}T ${card.losses}D   elo ${card.rating}`);
console.log(`  seg sin usar al perder : ${card.timeLeftInLosses?.toFixed(0)}s   (base 426)`);
console.log(`  ganadas y tiradas      : ${card.threwAwayRate != null ? percent(card.threwAwayRate) : "-"} (${card.threwAway}/${card.wasWinning})  (base 40%)`);
console.log(`  colgadas por partida   : ${card.hangsPerGame?.toFixed(2)}   (base 2.63)`);
console.log(`  dentro del repertorio  : ${card.onBookRate != null ? percent(card.onBookRate) : "-"}`);

console.log("\n=== PARTIDAS ===");
for (const g of rows.slice(0, 8)) {
  console.log(
    `\n  ${g.date} ${g.result.padEnd(4)} ${g.color === "w" ? "blancas" : "negras "} ${g.rating}v${g.opponentRating} ${g.termination}`
  );
  console.log(
    `    reloj ${g.timeLeft != null ? clock(g.timeLeft) : "?"} | pico ${pawns(g.peakMaterial)} en ${g.peakMoveNumber} | colgó ${g.hung.length} | dejó ${g.missed.length} gratis${g.threwItAway ? "  <-- TIRADA" : ""}`
  );
  console.log(
    g.deviation
      ? `    libro: se fue en la ${g.deviation.moveNumber}, jugó ${sanEs(g.deviation.played)} en vez de ${sanEs(g.deviation.book)}`
      : `    libro: completo`
  );
  const kinds = g.puzzles.reduce<Record<string, number>>((acc, p) => {
    const key = `${p.kind}${p.answers.length === 0 ? "-vacio" : ""}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`    puzzles: ${JSON.stringify(kinds)}`);
}

const all = rows.flatMap((g) => g.puzzles);
console.log(`\n=== PUZZLES: ${all.length} total ===`);
console.log(`  defensa con respuesta : ${all.filter((p) => p.kind === "defend" && p.answers.length).length}`);
console.log(`  defensa vacia         : ${all.filter((p) => p.kind === "defend" && !p.answers.length).length}`);
console.log(`  ataque con respuesta  : ${all.filter((p) => p.kind === "attack" && p.answers.length).length}`);
console.log(`  ataque vacio          : ${all.filter((p) => p.kind === "attack" && !p.answers.length).length}`);

const sample = all.filter((p) => p.answers.length > 0).slice(0, 4);
console.log("\n=== MUESTRA ===");
for (const p of sample) {
  console.log(`  [${p.kind}] j${p.moveNumber} jugó ${sanEs(p.playedSan)} -> respuesta ${p.answers.map(sanEs).join("/")} gana ${p.target} (${pawns(p.value)})`);
  console.log(`     ${p.fen}`);
}
