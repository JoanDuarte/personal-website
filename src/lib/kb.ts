import { readFileSync } from "node:fs";
import { join } from "node:path";

// joan-kb.md is the one document about who Joan is. Two sections of the home
// page are read from it here, at build time (the page is prerendered), instead
// of being copied into a second file. bio.json was that second file once, and
// it drifted; this is the alternative the constitution asks for. If a heading
// moves, the build fails with the heading's name rather than shipping an empty
// section.

export type KbSections = {
  howIThink: string[];
  buildsWithIntro: string;
  buildsWith: { label: string; value: string }[];
};

function sectionBody(md: string, heading: string): string {
  const marker = `\n## ${heading}\n`;
  const start = md.indexOf(marker);
  if (start === -1) throw new Error(`joan-kb.md: missing heading "${heading}"`);
  const from = start + marker.length;
  const next = md.indexOf("\n## ", from);
  return md.slice(from, next === -1 ? undefined : next).trim();
}

// Paragraphs are separated by blank lines; hard wraps inside one are joined.
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function getKbSections(): KbSections {
  const md = readFileSync(join(process.cwd(), "joan-kb.md"), "utf8");

  const howIThink = paragraphs(sectionBody(md, "How I Think"));

  const tech = sectionBody(md, "Technical Identity");
  const lines = tech.split("\n");
  const buildsWithIntro = paragraphs(
    lines.filter((l) => !l.startsWith("- ")).join("\n"),
  ).join(" ");
  const buildsWith = lines
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const m = l.slice(2).match(/^\*\*(.+?)\*\*:\s*(.+)$/);
      if (!m) throw new Error(`joan-kb.md: cannot parse stack line "${l}"`);
      return { label: m[1], value: m[2].trim() };
    });
  if (buildsWith.length === 0) {
    throw new Error('joan-kb.md: "Technical Identity" has no "- **Label**: value" lines');
  }

  return { howIThink, buildsWithIntro, buildsWith };
}
