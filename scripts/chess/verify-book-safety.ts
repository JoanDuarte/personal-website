import { Chess } from "chess.js";
import { consultBook, SYSTEMS } from "@/lib/chess/repertoire";
import { bestExchange } from "@/lib/chess/see";
import { sanEs } from "@/lib/chess/format";

/**
 * The book must never recommend a move that hangs material. A setup is a
 * plan, not a licence: developing a piece to its book square only makes sense
 * while nothing hangs once it gets there.
 */

type Case = {
  name: string;
  system: "italian" | "indian";
  moves: string[];
  /** The move the plain setup order would have produced. */
  naive: string;
  expect: string;
};

const cases: Case[] = [
  {
    // No hand-coded exception for this — the generic "something is already
    // hanging" rescue handles it, and picks whatever legal retreat loses
    // least (not necessarily b3 specifically). The pawn needs a defender
    // (here, ...a6), or "take the free pawn" would correctly outrank any
    // retreat: there'd be nothing wrong with just winning it instead.
    name: "b5 ataca el alfil de c4, defendido por a6: se retira, no ignora el ataque",
    system: "italian",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "d3", "a6", "O-O", "b5"],
    naive: "c3",
    expect: "un retiro del alfil, no c3 ignorando el ataque",
  },
  {
    // Turns out White has a real extra shot here (dxe5 dxe5 Nxe5 nets a clean
    // pawn — two attackers on e5 against one defender), so tactics correctly
    // outrank the fallback's own Bf4 step before it's even reached. Confirms
    // the fallback runs through the same tactics-first gate as everything
    // else, not that Bf4 specifically gets skipped — see the next case for that.
    name: "Fallback (rival no juega e5): la táctica sigue mandando sobre el Londres interno",
    system: "italian",
    moves: ["e4", "c6", "d4", "d6", "Nf3", "e5"],
    naive: "Bf4",
    expect: "no una jugada colgada, sea táctica o desarrollo",
  },
  {
    // White's own e2-e4 already vacates e2, so the fallback's e3 step resolves
    // for free — the next real decision is Bd3, which needs to arrive before
    // Black's own c-pawn does, or it hangs to it.
    name: "Fallback: peón negro en c4 ataca d3 antes de que el alfil llegue",
    system: "italian",
    moves: ["e4", "c6", "d4", "d5", "Nf3", "c5", "Bf4", "c4"],
    naive: "Bd3",
    expect: "cualquier cosa menos Ad3",
  },
  {
    name: "Indio: peón blanco en h6 ataca g7, y enrocar tampoco entra",
    system: "indian",
    moves: ["h4", "Nf6", "h5", "d6", "h6", "g6", "Nf3"],
    naive: "Bg7",
    expect: "no recomendar Ag7; el esquema no entra acá",
  },
];

let failures = 0;

for (const c of cases) {
  const chess = new Chess();
  let ok = true;
  for (const san of c.moves) {
    try {
      chess.move(san);
    } catch {
      console.log(`\n${c.name}\n  SECUENCIA INVÁLIDA en ${san} — revisar el caso`);
      ok = false;
      break;
    }
  }
  if (!ok) { failures += 1; continue; }

  const system = SYSTEMS[c.system];
  const book = consultBook(system, chess);

  console.log(`\n${c.name}`);
  console.log(`  posición : ${c.moves.join(" ")}`);
  console.log(`  esperado : ${c.expect}`);

  if (book.kind !== "move") {
    console.log(`  libro    : ${book.kind} — ${book.idea.slice(0, 80)}…`);
    console.log(`  ✓ no recomienda la jugada colgada`);
    continue;
  }

  const recommends = book.san.replace(/[+#]/, "");
  const hangs = recommends === c.naive;
  console.log(`  libro    : ${sanEs(book.san)}${book.warning ? `  [${book.warning.slice(0, 90)}…]` : ""}`);

  // The real assertion: play the book's move and confirm nothing is left hanging.
  const probe = new Chess(chess.fen());
  probe.move(book.san);
  const threat = bestExchange(probe.fen());
  const loses = threat && threat.value >= 200;

  if (hangs || loses) {
    console.log(`  ✗ FALLA: ${loses ? `el rival gana ${threat!.value / 100} en ${threat!.square}` : "recomienda la jugada colgada"}`);
    failures += 1;
  } else {
    console.log(`  ✓ seguro`);
  }
}

// --- Checks -----------------------------------------------------------------
//
// Being in check must always produce a move. The book used to shrug at ...Qa4+
// against the Indian — one of the most common checks at this level — and the
// trainer rendered that shrug as "round over", which read as checkmate.

// Check-handling doesn't care which system.setup() is active — these three
// Indian cases already proved the mechanism works; this one just confirms it
// generalises to a system that was never specifically written with it in mind.
const checkCases: { moves: string; system: "italian" | "indian"; name: string }[] = [
  { moves: "a3 Nf6 h3 g6 c3 Bg7 Qc2 d6 Qa4+", system: "indian", name: "Da4+ contra el indio" },
  { moves: "c4 Nf6 d4 g6 h3 Bg7 a3 d6 Qa4+", system: "indian", name: "Da4+ con c4 y d4" },
  { moves: "e3 Nf6 g3 g6 f3 Bg7 c3 d6 Qa4+", system: "indian", name: "Da4+ tercera variante" },
  {
    moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Bxf2+",
    system: "italian",
    name: "Axf2+ (sacrificio) contra la Italiana",
  },
];

console.log("\n--- En jaque, el libro siempre tiene que dar una jugada ---");
for (const c of checkCases) {
  const chess = new Chess();
  for (const san of c.moves.split(" ")) chess.move(san);
  const book = consultBook(SYSTEMS[c.system], chess);
  const ok = chess.isCheck() && book.kind === "move";
  console.log(
    `  ${ok ? "✓" : "✗"} ${c.name.padEnd(30)} jaque=${chess.isCheck()} -> ${book.kind === "move" ? sanEs(book.san) : book.kind.toUpperCase()}`
  );
  if (!ok) failures += 1;
}

console.log(
  `\n${failures === 0 ? "TODOS OK" : `${failures} FALLAS`} — ${cases.length + checkCases.length} casos`
);
if (failures > 0) process.exit(1);
