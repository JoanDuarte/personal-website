import { Chess } from "chess.js";
import { bestExchange, moveNetValue, winningCaptures } from "@/lib/chess/see";
import { sanEs } from "@/lib/chess/format";

const cases: { name: string; fen: string; expect: string }[] = [
  {
    name: "Torre colgada, nada la defiende",
    fen: "4k3/8/8/4r3/8/8/8/4R1K1 w - - 0 1",
    expect: "Txe5 gana torre entera (+5)",
  },
  {
    name: "Torre defendida por un peon: cambio parejo, no hay ganancia",
    fen: "4k3/8/5p2/4r3/8/8/8/4R1K1 w - - 0 1",
    expect: "nada: Txe5 fxe5 es torre por torre",
  },
  {
    name: "Alfil defendido por un peon: solo gana el cambio",
    fen: "4k3/8/2p5/3b4/8/2N5/8/4K3 w - - 0 1",
    expect: "Cxd5 cxd5 -> alfil por caballo, +0.2",
  },
  {
    name: "Peon clavado no puede recapturar",
    fen: "4k3/8/8/8/8/3b4/4P3/4K3 w - - 0 1",
    expect: "exd3 gana alfil limpio (+3.2)",
  },
  {
    name: "Partida real: dxe6 gana alfil aunque parezca recapturable",
    fen: "r3k2r/pp3ppp/1b1pb2n/3Pn2q/2Q5/3B1N1P/PP1N1PP1/R1B1R1K1 w kq - 1 17",
    expect: "+3.2 — si fxe6, Dxe6 recupera el peon, asi que la recaptura no compensa",
  },
  {
    name: "Partida real: Axf6 gana caballo porque Dxf6 pierde la dama",
    fen: "r1bq1rk1/ppp2p1p/3p1np1/n1b1p1B1/2B1P3/2PP1Q1P/PP3PP1/RN2K1NR w KQ - 3 9",
    expect: "+3 — la recaptura Dxf6 cae en Dxf6, asi que no hay recaptura",
  },
];

for (const c of cases) {
  const best = bestExchange(c.fen);
  const chess = new Chess(c.fen);
  console.log(`\n${c.name}`);
  console.log(`  esperado: ${c.expect}`);
  if (!best) {
    console.log(`  SEE     : nada gana material`);
  } else {
    console.log(
      `  SEE     : ${sanEs(best.move.san)} en ${best.square} -> +${(best.value / 100).toFixed(2)}`
    );
    console.log(
      `  aceptadas: ${winningCaptures(c.fen, best.value).map((m) => sanEs(m.san)).join(", ")}`
    );
  }
  const caps = chess.moves({ verbose: true }).filter((m) => m.captured);
  if (caps.length > 0) {
    console.log(
      `  todas   : ${caps.map((m) => `${sanEs(m.san)}=${(moveNetValue(c.fen, m) / 100).toFixed(2)}`).join("  ")}`
    );
  }
}
