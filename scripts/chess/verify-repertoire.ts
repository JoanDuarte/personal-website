import { Chess } from "chess.js";
import { consultBook, opponentReply, SYSTEMS } from "@/lib/chess/repertoire";
import { sanEs } from "@/lib/chess/format";
import { PIECE_VALUE } from "@/lib/chess/see";

for (const system of [SYSTEMS.italian, SYSTEMS.indian]) {
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
      if (book.kind === "tactic") {
        // Taking free material is the book working, not the book stopping.
        const take = chess.moves({ verbose: true })
          .filter((m) => m.to === book.square && m.captured)
          .sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece])[0];
        if (!take) { outcome = `TACTICA sin captura en ${book.square}`; break; }
        chess.move(take.san);
        log.push(`${sanEs(take.san)}*`);
        const answer = opponentReply(chess, plan.moves);
        if (!answer) { outcome = "sin respuesta"; break; }
        log.push(answer);
        continue;
      }

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
