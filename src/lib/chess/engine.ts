"use client";

import { Chess, type Square } from "chess.js";

/**
 * A thin wrapper around Stockfish running as a Web Worker in the browser.
 *
 * Deliberately client-side rather than a server route: the position changes on
 * every move, so a server round trip would add real latency for zero benefit,
 * and a Vercel function would pay to run a WASM engine with nobody else able
 * to share the warm instance. The browser already has the CPU sitting idle.
 *
 * `stockfish-18-lite-single` was picked specifically because it runs without
 * the COOP/COEP headers the multi-threaded build requires — those headers
 * would break the ElevenLabs voice widget elsewhere on this site, which needs
 * to load cross-origin resources the isolation policy would block.
 *
 * The engine is a progressive enhancement, never a requirement: every caller
 * of `evaluate()` is expected to handle it staying pending or rejecting, and
 * the book + SEE safety net in repertoire.ts works identically whether or not
 * this ever loads.
 */

export type EngineEval = {
  /** Centipawns from the side-to-move's perspective. 0 when `mate` is set. */
  cp: number;
  /** Moves to mate, or null. Positive = side to move mates. */
  mate: number | null;
  bestMove: string;
  depth: number;
};

const ENGINE_URL = "/engine/stockfish-18-lite-single.js";

function parseInfoLine(line: string, current: Omit<EngineEval, "bestMove">) {
  if (!line.startsWith("info ") || !line.includes(" score ")) return current;
  const match = line.match(/ score (cp|mate) (-?\d+)/);
  const depthMatch = line.match(/ depth (\d+)/);
  if (!match) return current;
  const value = Number(match[2]);
  return match[1] === "cp"
    ? { cp: value, mate: null, depth: depthMatch ? Number(depthMatch[1]) : current.depth }
    : {
        cp: value > 0 ? 10000 - value * 10 : -10000 - value * 10,
        mate: value,
        depth: depthMatch ? Number(depthMatch[1]) : current.depth,
      };
}

class Engine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  /** Serializes evaluate() calls: the engine can only search one position at a time. */
  private queue: Promise<unknown> = Promise.resolve();

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(ENGINE_URL);
    this.worker = worker;
    return worker;
  }

  private send(cmd: string) {
    this.ensureWorker().postMessage(cmd);
  }

  private readUntil(predicate: (line: string) => boolean): Promise<string[]> {
    const worker = this.ensureWorker();
    const lines: string[] = [];
    return new Promise((resolve, reject) => {
      const onMessage = (e: MessageEvent<string>) => {
        lines.push(e.data);
        if (predicate(e.data)) {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          resolve(lines);
        }
      };
      const onError = (e: ErrorEvent) => {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        reject(e.error ?? new Error(e.message || "Stockfish worker error"));
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
    });
  }

  private async start(): Promise<void> {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      throw new Error("No hay Worker disponible en este entorno.");
    }
    if (typeof WebAssembly === "undefined") {
      throw new Error("Este navegador no soporta WebAssembly.");
    }
    this.send("uci");
    await this.readUntil((l) => l === "uciok");
    this.send("isready");
    await this.readUntil((l) => l === "readyok");
  }

  private async warm(): Promise<void> {
    if (!this.ready) this.ready = this.start();
    return this.ready;
  }

  /** Best move and evaluation for `fen`, run one at a time. */
  evaluate(fen: string, depth = 12): Promise<EngineEval> {
    const task = this.queue.then(async () => {
      await this.warm();
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
      const lines = await this.readUntil((l) => l.startsWith("bestmove"));

      let acc: Omit<EngineEval, "bestMove"> = { cp: 0, mate: null, depth: 0 };
      for (const line of lines) acc = parseInfoLine(line, acc);
      const bestMove = lines.at(-1)?.split(" ")[1] ?? "";

      return { ...acc, bestMove };
    });
    // Keep the chain alive even if this particular evaluation rejects, so a
    // single failed search doesn't wedge every call after it.
    this.queue = task.catch(() => undefined);
    return task;
  }

  terminate() {
    this.worker?.postMessage("quit");
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }
}

/**
 * One engine for the whole page — a fresh Worker per board would mean paying
 * the ~7MB download and WASM compile more than once for no reason.
 */
let shared: Engine | null = null;

export function getEngine(): Engine {
  if (!shared) shared = new Engine();
  return shared;
}

/**
 * The engine speaks UCI (`e2e4`, `e7e8q`); the rest of the app speaks SAN
 * (`e4`, `e8=Q`). `fen` must be the position the move was found in.
 */
export function uciToSan(fen: string, uci: string): string | null {
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length > 4 ? uci[4] : undefined;
  const move = new Chess(fen)
    .moves({ verbose: true })
    .find(
      (m) => m.from === from && m.to === to && (m.promotion ?? undefined) === promotion
    );
  return move ? move.san : null;
}
