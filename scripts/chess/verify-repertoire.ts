import { Chess } from "chess.js";
import { consultBook, opponentReply, SYSTEMS } from "@/lib/chess/repertoire";
import { sanEs } from "@/lib/chess/format";

for (const system of [SYSTEMS.london, SYSTEMS.indian]) {
  console.log(`\n=== ${system.name} (${system.color === "w" ? "blancas" : "negras"}) ===`);

  for (const plan of system.plans) {
    const chess = new Chess();
    const log: string[] = [];
    let outcome = "?";

    if (system.color === "b") {
      const san = opponentReply(chess, plan.moves);
      if (san) log.push(san);
    }

    for (let i = 0; i < 24; i++) {
      const book = consultBook(system, chess);

      if (book.kind === "done") { outcome = "LIBRO COMPLETO"; break; }
      if (book.kind === "out") { outcome = `CORTE: ${book.idea.slice(0, 45)}…`; break; }
      if (book.kind === "tactic") { outcome = `TACTICA en ${book.square} (+${book.value})`; break; }

      const move = chess.move(book.san);
      log.push(`${sanEs(move.san)}${book.source === "exception" ? "!" : ""}`);

      const reply = opponentReply(chess, plan.moves);
      if (!reply) { outcome = "sin respuesta"; break; }
      log.push(reply);
    }

    console.log(`\n  vs ${plan.name}`);
    console.log(`    ${log.join(" ")}`);
    console.log(`    -> ${outcome}`);
  }
}
