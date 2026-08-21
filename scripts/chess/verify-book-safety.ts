import { Chess } from "chess.js";
import { consultBook, SYSTEMS } from "@/lib/chess/repertoire";
import { bestExchange } from "@/lib/chess/see";
import { sanEs } from "@/lib/chess/format";

/**
 * The book must never recommend a move that hangs material. A setup is a plan,
 * not a licence: 3.Bf4 is the London's whole point right up until Black has a
 * pawn on e5, at which point it is a bishop for nothing.
 */

type Case = {
  name: string;
  system: "london" | "indian";
  moves: string[];
  /** The move the plain setup order would have produced. */
  naive: string;
  expect: string;
};

const cases: Case[] = [
  {
    name: "Peón en e5 ataca f4: el alfil no puede ir",
    system: "london",
    moves: ["d4", "d6", "Nf3", "e5"],
    naive: "Bf4",
    expect: "cualquier cosa menos Af4",
  },
  {
    name: "Peón en e5 con el caballo ya en f3 y d4 cambiado",
    system: "london",
    moves: ["d4", "e5", "dxe5", "Nc6"],
    naive: "Bf4",
    expect: "no debe colgar nada",
  },
  {
    name: "Peón negro en c4 ataca d3: el alfil no puede ir",
    system: "london",
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4", "c5", "e3", "c4"],
    naive: "Bd3",
    expect: "cualquier cosa menos Ad3",
  },
  {
    name: "Peón negro en g4 ataca f3: el caballo no puede ir",
    system: "london",
    moves: ["d4", "h5", "e3", "g5", "c3", "g4"],
    naive: "Nf3",
    expect: "cualquier cosa menos Cf3",
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

const checkCases: { moves: string; system: "london" | "indian"; name: string }[] = [
  { moves: "a3 Nf6 h3 g6 c3 Bg7 Qc2 d6 Qa4+", system: "indian", name: "Da4+ contra el indio" },
  { moves: "c4 Nf6 d4 g6 h3 Bg7 a3 d6 Qa4+", system: "indian", name: "Da4+ con c4 y d4" },
  { moves: "e3 Nf6 g3 g6 f3 Bg7 c3 d6 Qa4+", system: "indian", name: "Da4+ tercera variante" },
  { moves: "d4 c5 dxc5 Qa5+", system: "london", name: "Da5+ contra el Londres" },
  { moves: "d4 h6 Nf3 e5 dxe5 Be7 Bf4 Nf6 exf6 Bb4+", system: "london", name: "Ab4+ con peón en f6" },
  { moves: "d4 e6 Nf3 Bb4+", system: "london", name: "Ab4+ temprano" },
];

console.log("\n--- En jaque, el libro siempre tiene que dar una jugada ---");
for (const c of checkCases) {
  const chess = new Chess();
  for (const san of c.moves.split(" ")) chess.move(san);
  const book = consultBook(SYSTEMS[c.system], chess);
  const ok = chess.isCheck() && book.kind === "move";
  console.log(
    `  ${ok ? "✓" : "✗"} ${c.name.padEnd(26)} jaque=${chess.isCheck()} -> ${book.kind === "move" ? sanEs(book.san) : book.kind.toUpperCase()}`
  );
  if (!ok) failures += 1;
}

console.log(
  `\n${failures === 0 ? "TODOS OK" : `${failures} FALLAS`} — ${cases.length + checkCases.length} casos`
);
if (failures > 0) process.exit(1);
