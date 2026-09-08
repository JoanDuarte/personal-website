import { Chess, type Square } from "chess.js";
import { consultBook, bookMoveOf, SYSTEMS, type System } from "@/lib/chess/repertoire";

/**
 * Can an opponent force mate against someone who just follows the book?
 *
 * The book is a deterministic policy, so this needs no engine and no sampling:
 * try every opponent move, let the book answer, recurse. Anything this finds is
 * a real forced mate, not a maybe — which is what "me recomendó y me hizo jaque
 * mate" turned out to be:
 *
 *   1.e4 e5 2.Cf3 Ac5 3.Cxe5 Dh4 4.Ac4?? Dxf2#
 *
 * The last opponent ply is restricted to checks, since only a check can be
 * mate. Everything before it is full width.
 *
 *   bun run scripts/chess/verify-no-forced-mate.ts [depth]
 */

const DEPTH = Number(process.argv[2] ?? 4);

let consultations = 0;

function bookReply(system: System, chess: Chess) {
  const answer = consultBook(system, chess);
  consultations += 1;
  const move = bookMoveOf(answer, chess);
  // A silent book is not a book recommendation: the trainer hands the position
  // to the engine there, so a mate reached past this point is not its doing.
  return move ? { from: move.from as Square, to: move.to as Square, san: move.san, promotion: move.promotion } : null;
}

function hunt(system: System, chess: Chess, depth: number): string[] | null {
  const moves = chess.moves({ verbose: true });
  const candidates = depth === 1 ? moves.filter((m) => m.san.endsWith("#")) : moves;

  for (const m of candidates) {
    chess.move({ from: m.from, to: m.to, promotion: m.promotion });
    if (chess.isCheckmate()) {
      chess.undo();
      return [m.san];
    }
    if (depth > 1 && !chess.isGameOver()) {
      const reply = bookReply(system, chess);
      if (reply) {
        chess.move({ from: reply.from, to: reply.to, promotion: reply.promotion });
        if (!chess.isGameOver()) {
          const rest = hunt(system, chess, depth - 1);
          if (rest) {
            chess.undo();
            chess.undo();
            return [m.san, reply.san, ...rest];
          }
        }
        chess.undo();
      }
    }
    chess.undo();
  }
  return null;
}

let failures = 0;

for (const system of Object.values(SYSTEMS) as System[]) {
  const chess = new Chess();
  const prefix: string[] = [];
  // Let the book open when it has White.
  if (chess.turn() === system.color) {
    const first = bookReply(system, chess);
    if (first) {
      chess.move({ from: first.from, to: first.to, promotion: first.promotion });
      prefix.push(first.san);
    }
  }

  const started = Date.now();
  const line = hunt(system, chess, DEPTH);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (line) {
    console.log(`✗ ${system.name}: MATE FORZADO en ${[...prefix, ...line].join(" ")}`);
    failures += 1;
  } else {
    console.log(
      `✓ ${system.name}: sin mate forzado a ${DEPTH} jugadas del rival (${consultations} consultas, ${seconds}s)`
    );
  }
}

if (failures > 0) process.exit(1);
