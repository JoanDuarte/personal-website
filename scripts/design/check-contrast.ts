// Measures the WCAG contrast of every text/background token pair the home page
// relies on, straight from the :root block of globals.css. Exits non-zero when a
// pair is under its minimum, so a token change cannot quietly break legibility.
//
//   bun run design:contrast
//
// The conversion is oklch -> oklab -> linear sRGB (Björn Ottosson's matrices),
// then WCAG relative luminance from the linear channels. Tokens with an alpha
// are composited over --background before measuring, in linear light.

import { readFileSync } from "node:fs";
import { join } from "node:path";

type Rgb = [number, number, number];

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const rootStart = css.indexOf(":root {");
const rootEnd = css.indexOf("\n}", rootStart);
const root = css.slice(rootStart, rootEnd);

// Two token shapes are allowed: a literal oklch(...) or a var(--other) alias.
const literal = /--([\w-]+):\s*oklch\(([^)]+)\)/g;
const alias = /--([\w-]+):\s*var\(--([\w-]+)\)/g;

const raw = new Map<string, string>();
for (const m of root.matchAll(literal)) raw.set(m[1], `oklch(${m[2]})`);
const aliases = new Map<string, string>();
for (const m of root.matchAll(alias)) aliases.set(m[1], m[2]);

function resolve(name: string, depth = 0): string {
  if (depth > 5) throw new Error(`token --${name}: alias loop`);
  const v = raw.get(name);
  if (v) return v;
  const a = aliases.get(name);
  if (a) return resolve(a, depth + 1);
  throw new Error(`token --${name} not found in :root`);
}

function parseOklch(v: string): { l: number; c: number; h: number; alpha: number } {
  const inner = v.slice("oklch(".length, -1);
  const [color, alphaPart] = inner.split("/").map((s) => s.trim());
  const [l, c, h] = color.split(/\s+/).map(Number);
  const alpha = alphaPart === undefined ? 1 : Number(alphaPart);
  if ([l, c, h, alpha].some((n) => Number.isNaN(n))) throw new Error(`cannot parse ${v}`);
  return { l, c, h, alpha };
}

function oklchToLinearSrgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  const r = 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bb = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [clamp(r), clamp(g), clamp(bb)];
}

function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return [0, 1, 2].map((i) => fg[i] * alpha + bg[i] * (1 - alpha)) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const background = (() => {
  const { l, c, h } = parseOklch(resolve("background"));
  return oklchToLinearSrgb(l, c, h);
})();

function linear(name: string): Rgb {
  const { l, c, h, alpha } = parseOklch(resolve(name));
  const rgb = oklchToLinearSrgb(l, c, h);
  return alpha < 1 ? composite(rgb, alpha, background) : rgb;
}

function contrast(fg: string, bg: string): number {
  const a = luminance(linear(fg));
  const b = luminance(linear(bg));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// The pairs from specs/001-premium-home-redesign/contracts/tokens.md. `min` of 0
// means "report only": the border is not a text pair and WCAG has no rule for it.
const pairs: { fg: string; bg: string; min: number; use: string }[] = [
  { fg: "foreground", bg: "background", min: 4.5, use: "headings, body on page" },
  { fg: "foreground", bg: "surface", min: 4.5, use: "panel titles" },
  { fg: "muted-foreground", bg: "background", min: 4.5, use: "body text" },
  { fg: "muted-foreground", bg: "surface", min: 4.5, use: "panel descriptions" },
  { fg: "text-tertiary", bg: "background", min: 4.5, use: "metadata" },
  { fg: "text-tertiary", bg: "surface", min: 4.5, use: "periods, tags on panels" },
  { fg: "primary", bg: "background", min: 4.5, use: "amber links, Active badge text" },
  { fg: "primary", bg: "surface", min: 4.5, use: "Active badge on panels" },
  { fg: "primary-foreground", bg: "primary", min: 4.5, use: "text on amber buttons" },
  { fg: "border", bg: "background", min: 0, use: "hairline visibility (reported only)" },
];

let failed = false;
const rows = pairs.map((p) => {
  const ratio = contrast(p.fg, p.bg);
  const ok = p.min === 0 ? true : ratio >= p.min;
  if (!ok) failed = true;
  return {
    pair: `--${p.fg} on --${p.bg}`,
    ratio: ratio.toFixed(2),
    min: p.min === 0 ? "-" : p.min.toFixed(1),
    result: p.min === 0 ? "info" : ok ? "PASS" : "FAIL",
    use: p.use,
  };
});

const width = Math.max(...rows.map((r) => r.pair.length));
for (const r of rows) {
  console.log(
    `${r.pair.padEnd(width)}  ${r.ratio.padStart(6)}  min ${r.min.padStart(3)}  ${r.result.padEnd(4)}  ${r.use}`,
  );
}
console.log(failed ? "\nFAIL: at least one pair is under its minimum" : "\nOK");
process.exit(failed ? 1 : 0);
