import { Chess } from "chess.js";
import { bookMoveOf, consultBook, SYSTEMS, type System } from "@/lib/chess/repertoire";
import { bestExchange, PIECE_VALUE } from "@/lib/chess/see";

/**
 * The book must never recommend a move that leaves material hanging.
 *
 * This is the number that matters most on any change to `repertoire.ts` or
 * `see.ts` — the book's whole purpose is to stop him hanging pieces, and 48% of
 * his own serious errors are material given to a one-move capture. `verify-
 * book-safety.ts` checks the same rule against hand-picked positions; this one
 * checks it across hundreds of played-out games.
 *
 * It uses the same playout generator as `audit-book.ts`, but "hangs material"
 * is a static-exchange figure, not an engine one, so this runs in seconds and
 * needs no Stockfish binary. Use the audit for centipawn quality; use this for
 * the guarantee.
 *
 *   bun run scripts/chess/verify-no-hanging.ts [games]
 */

const GAMES = Number(process.argv[2] ?? 60);
/** Losing this much to a simple capture counts as hanging. */
const HANGS = 200;

/** Deterministic PRNG, so a failure can be reproduced exactly. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Sample = { fen: string; san: string; kind: string; hangs: number };

function playout(system: System, seed: number, pool: "plausible" | "aleatorio"): Sample[] {
  const random = rng(seed);
  const chess = new Chess();
  const samples: Sample[] = [];

  for (let ply = 0; ply < 30; ply++) {
    if (chess.isGameOver()) break;

    if (chess.turn() === system.color) {
      const book = consultBook(system, chess);
      const move = bookMoveOf(book, chess);
      if (!move) break;
      const probe = new Chess(chess.fen());
      probe.move({ from: move.from, to: move.to, promotion: move.promotion });
      // A move only *hangs* material if what the opponent wins exceeds what the
      // move just captured — without that offset every even trade reads as one.
      const gained = move.captured ? PIECE_VALUE[move.captured] : 0;
      samples.push({
        fen: chess.fen(),
        san: move.san,
        kind: book.kind,
        hangs: Math.max(0, (bestExchange(probe.fen())?.value ?? 0) - gained),
      });
      chess.move(move.san);
      continue;
    }

    const legal = chess.moves({ verbose: true });
    if (legal.length === 0) break;
    let choices = legal;
    if (pool === "plausible") {
      const developing = legal.filter(
        (m) =>
          m.flags.includes("k") ||
          ((m.piece === "n" || m.piece === "b") && ["1", "8"].includes(m.from[1])) ||
          (m.piece === "p" && "cdef".includes(m.to[0])) ||
          Boolean(m.captured)
      );
      if (developing.length > 0) choices = developing;
    }
    chess.move(choices[Math.floor(random() * choices.length)].san);
  }
  return samples;
}

const samples: Sample[] = [];
for (let i = 0; i < GAMES; i++) {
  for (const system of [SYSTEMS.italian, SYSTEMS.indian]) {
    samples.push(...playout(system, i * 2654435761 + 7, "plausible"));
    samples.push(...playout(system, i * 40503 + 991, "aleatorio"));
  }
}

const hung = samples.filter((s) => s.hangs >= HANGS);
const share = (n: number) => `${((100 * n) / samples.length).toFixed(1)}%`;

console.log(`${samples.length} recomendaciones · cuelgan ≥${HANGS}cp: ${hung.length} (${share(hung.length)})`);
for (const kind of ["move", "tactic"]) {
  const of = samples.filter((s) => s.kind === kind);
  const bad = hung.filter((s) => s.kind === kind);
  console.log(`  ${kind.padEnd(7)}: ${bad.length} de ${of.length}`);
}

for (const h of hung.slice(0, 10)) {
  console.log(`\n  ✗ ${h.san} (${h.kind}) deja ${h.hangs}cp\n    ${h.fen}`);
}

console.log(hung.length === 0 ? "\nTODO OK" : `\n${hung.length} FALLAS`);
if (hung.length > 0) process.exit(1);
