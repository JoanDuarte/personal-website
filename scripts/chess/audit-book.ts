import { Chess } from "chess.js";
import { consultBook, SYSTEMS, type System } from "@/lib/chess/repertoire";
import { bestExchange, PIECE_VALUE } from "@/lib/chess/see";
import { sanEs } from "@/lib/chess/format";

/**
 * Audits every move the book recommends against a real engine.
 *
 * The book's own safety check uses static exchange evaluation, which sees a
 * capture sequence on one square and nothing else — no forks, no pins, no
 * discovered attacks, no mate. This asks Stockfish what those moves actually
 * cost, so the gap between "does not hang to a simple capture" and "is a good
 * move" is a measured number rather than an assumption.
 *
 *   STOCKFISH=/path/to/stockfish bun run scripts/chess/audit-book.ts [games] [depth]
 */

const ENGINE = process.env.STOCKFISH;
if (!ENGINE) {
  console.error("Falta STOCKFISH=/ruta/al/binario");
  process.exit(1);
}
const GAMES = Number(process.argv[2] ?? 60);
const DEPTH = Number(process.argv[3] ?? 14);

// --- UCI ------------------------------------------------------------------

type Eval = { cp: number; mate: number | null; best: string };

class Engine {
  private proc = Bun.spawn([ENGINE!], { stdin: "pipe", stdout: "pipe" });
  private buffer = "";
  private reader = this.proc.stdout.getReader();
  private decoder = new TextDecoder();

  private send(cmd: string) {
    this.proc.stdin.write(`${cmd}\n`);
    this.proc.stdin.flush();
  }

  private async readUntil(marker: string): Promise<string[]> {
    const lines: string[] = [];
    for (;;) {
      const nl = this.buffer.indexOf("\n");
      if (nl === -1) {
        const { value, done } = await this.reader.read();
        if (done) return lines;
        this.buffer += this.decoder.decode(value, { stream: true });
        continue;
      }
      const line = this.buffer.slice(0, nl).trim();
      this.buffer = this.buffer.slice(nl + 1);
      lines.push(line);
      if (line.startsWith(marker)) return lines;
    }
  }

  async start() {
    this.send("uci");
    await this.readUntil("uciok");
    this.send("setoption name Threads value 4");
    this.send("setoption name Hash value 256");
    this.send("isready");
    await this.readUntil("readyok");
  }

  /** Score from the side-to-move's perspective. */
  async evaluate(fen: string): Promise<Eval> {
    this.send(`position fen ${fen}`);
    this.send(`go depth ${DEPTH}`);
    const lines = await this.readUntil("bestmove");
    let cp = 0;
    let mate: number | null = null;
    for (const line of lines) {
      if (!line.startsWith("info ") || !line.includes(" score ")) continue;
      const m = line.match(/ score (cp|mate) (-?\d+)/);
      if (!m) continue;
      if (m[1] === "cp") { cp = Number(m[2]); mate = null; }
      else { mate = Number(m[2]); cp = mate > 0 ? 10000 - mate * 10 : -10000 - mate * 10; }
    }
    const best = lines.at(-1)?.split(" ")[1] ?? "";
    return { cp, mate, best };
  }

  stop() {
    this.send("quit");
    this.proc.kill();
  }
}

// --- Position generation ---------------------------------------------------

/** Deterministic PRNG so a failing audit can be reproduced exactly. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Sample = {
  fen: string;
  uci: string;
  san: string;
  warned: boolean;
  kind: "move" | "tactic";
  system: System["id"];
  pool: "aleatorio" | "plausible";
};

/**
 * `plausible` keeps the opponent to developing moves and central pawns, which is
 * what a real game looks like. `aleatorio` lets it play anything legal, which is
 * where a setup-based book is most likely to be caught out.
 */
function playout(
  system: System,
  seed: number,
  pool: Sample["pool"]
): Sample[] {
  const random = rng(seed);
  const chess = new Chess();
  const samples: Sample[] = [];

  for (let ply = 0; ply < 30; ply++) {
    if (chess.isGameOver()) break;

    if (chess.turn() === system.color) {
      const book = consultBook(system, chess);

      // "Take the free material" is a recommendation too, and was going
      // unaudited: the first version of this script stopped the playout here.
      let legal;
      if (book.kind === "tactic") {
        legal = chess
          .moves({ verbose: true })
          .filter((m) => m.to === book.square && m.captured)
          .sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece])[0];
      } else if (book.kind === "move") {
        legal = chess
          .moves({ verbose: true })
          .find((m) => m.from === book.from && m.to === book.to);
      } else {
        break;
      }
      if (!legal) break;

      samples.push({
        fen: chess.fen(),
        uci: `${legal.from}${legal.to}${legal.promotion ?? ""}`,
        san: legal.san,
        warned: book.kind === "move" && Boolean(book.warning),
        kind: book.kind,
        system: system.id,
        pool,
      });
      chess.move(legal.san);
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

// --- Run -------------------------------------------------------------------

const samples: Sample[] = [];
for (let i = 0; i < GAMES; i++) {
  for (const system of [SYSTEMS.london, SYSTEMS.indian]) {
    samples.push(...playout(system, i * 2654435761 + 7, "plausible"));
    samples.push(...playout(system, i * 40503 + 991, "aleatorio"));
  }
}

console.log(`${samples.length} recomendaciones del libro, profundidad ${DEPTH}\n`);

const engine = new Engine();
await engine.start();

type Verdict = Sample & {
  loss: number;
  decided: boolean;
  missedMate: boolean;
  mateAllowed: boolean;
  /** Does the recommended move leave material to a simple capture? This is the
   *  book's own guarantee, and unlike engine preference it is checkable. */
  hangs: number;
  best: string;
};
const verdicts: Verdict[] = [];

/**
 * Evaluations are clamped and already-decided positions are dropped, the same
 * rule the original Stockfish study used. Without it a position that was already
 * mate-in-4 scores the book at -9500 for playing a developing move instead of
 * the mate, which says nothing about whether the recommendation was sound.
 */
const CAP = 1000;
const DECIDED = 900;
const clamp = (x: number) => Math.max(-CAP, Math.min(CAP, x));

for (const [i, s] of samples.entries()) {
  const before = await engine.evaluate(s.fen);
  const after = new Chess(s.fen);
  after.move(s.san);
  const post = await engine.evaluate(after.fen());
  // Both scores are side-to-move relative, and the side flipped between them.
  const loss = clamp(before.cp) - -clamp(post.cp);
  verdicts.push({
    ...s,
    loss,
    decided: Math.abs(before.cp) >= DECIDED,
    missedMate: before.mate !== null && before.mate > 0 && post.mate === null,
    mateAllowed: post.mate !== null && post.mate > 0,
    hangs: Math.max(
      0,
      (bestExchange(after.fen())?.value ?? 0) -
        (new Chess(s.fen).moves({ verbose: true }).find((m) => m.san === s.san)?.captured
          ? PIECE_VALUE[
              new Chess(s.fen).moves({ verbose: true }).find((m) => m.san === s.san)!
                .captured as string
            ]
          : 0)
    ),
    best: before.best,
  });
  if ((i + 1) % 100 === 0) process.stderr.write(`  ${i + 1}/${samples.length}\n`);
}
engine.stop();

// --- Report ----------------------------------------------------------------

const MISTAKE = 150;
const BLUNDER = 300;

function report(label: string, all: Verdict[]) {
  const rows = all.filter((v) => !v.decided);
  if (rows.length === 0) return;
  const mistakes = rows.filter((v) => v.loss >= MISTAKE);
  const blunders = rows.filter((v) => v.loss >= BLUNDER);
  const mates = rows.filter((v) => v.mateAllowed);
  const losses = rows.map((v) => v.loss).sort((a, b) => a - b);
  const median = losses[Math.floor(losses.length / 2)];
  const pct = (n: number) => `${((100 * n) / rows.length).toFixed(1)}%`;
  console.log(`\n=== ${label} (${rows.length} abiertas de ${all.length}) ===`);
  console.log(`  pérdida mediana : ${median} cp`);
  console.log(`  imprecisión ≥${MISTAKE} : ${mistakes.length} (${pct(mistakes.length)})`);
  console.log(`  blunder ≥${BLUNDER}     : ${blunders.length} (${pct(blunders.length)})`);
  console.log(`  permite mate      : ${mates.length} (${pct(mates.length)})`);
  console.log(`  deja pasar un mate: ${rows.filter((v) => v.missedMate).length}`);
  const hung = rows.filter((v) => v.hangs >= 200);
  console.log(`  deja material colgado: ${hung.length} (${pct(hung.length)})`);
}

report("TODO", verdicts);
report("Londres", verdicts.filter((v) => v.system === "london"));
report("Indio", verdicts.filter((v) => v.system === "indian"));
report("rival plausible", verdicts.filter((v) => v.pool === "plausible"));
report("rival aleatorio", verdicts.filter((v) => v.pool === "aleatorio"));
report("jugadas del esquema", verdicts.filter((v) => v.kind === "move"));
report("capturas señaladas", verdicts.filter((v) => v.kind === "tactic"));

const worst = [...verdicts].filter((v) => !v.decided).sort((a, b) => b.loss - a.loss).slice(0, 12);
console.log(`\n=== PEORES RECOMENDACIONES ===`);
for (const v of worst) {
  if (v.loss < MISTAKE) break;
  console.log(
    `  -${v.loss}cp  ${v.system}/${v.pool}  libro: ${sanEs(v.san)}  motor: ${v.best}${v.mateAllowed ? "  [PERMITE MATE]" : ""}`
  );
  console.log(`     ${v.fen}`);
}

const open = verdicts.filter((v) => !v.decided);
const bad = open.filter((v) => v.loss >= BLUNDER || v.mateAllowed).length;
console.log(
  `\nVEREDICTO: ${bad} de ${open.length} recomendaciones en posiciones abiertas pierden ${BLUNDER}cp o permiten mate (${((100 * bad) / open.length).toFixed(1)}%)\n           ${verdicts.length - open.length} descartadas por estar ya decididas (|eval| >= ${DECIDED}cp)`
);
