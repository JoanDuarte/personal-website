"use client";

import { motion, type Variants } from "motion/react";
import projects from "@/data/projects.json";

// The five rows of the page. Project names are looked up in projects.json so
// the links and the dates come from the data; the sentence after the names is
// the only prose typed here. A row that names a project the file does not
// have fails the build with the name, rather than shipping a dead link.

type FactRow = {
  label?: string;
  projects: string[];
  text: string;
};

const rows: FactRow[] = [
  {
    projects: ["Catherby"],
    text: "— with Franco Quattroqui. Agents running a farm's back office.",
  },
  {
    projects: ["Verelyn", "Flare", "Privé"],
    text: "— three products shipped this year. Two still earn.",
  },
  {
    projects: ["Inception Crypto"],
    text: "— started at 21, dropped out for it. 150 ASICs. It funded everything after.",
  },
  {
    projects: ["Stevay", "DL3ARN", "Clikan", "Aequsy", "Bloorfy"],
    text: ". The ones that didn't make it.",
  },
  {
    label: "Argentine",
    projects: [],
    text: "Math olympiads as a kid. Chess, still.",
  },
];

type Project = (typeof projects)[number];

function project(name: string): Project {
  const found = projects.find((p) => p.name === name);
  if (!found) throw new Error(`facts: unknown project ${name}`);
  return found;
}

// "2026–present" → [2026, null]; "2020–2026" → [2020, 2026]; "2025" → [2025, 2025]
function span(date: string): [number, number | null] {
  const [a, b] = date.split("–");
  const start = Number(a);
  if (b === undefined) return [start, start];
  if (b === "present") return [start, null];
  return [start, Number(b)];
}

export function dateLabel(row: FactRow): string {
  if (row.label) return row.label;
  const spans = row.projects.map((n) => span(project(n).date));
  const start = Math.min(...spans.map(([s]) => s));
  if (spans.some(([, e]) => e === null)) return `${start}–`;
  const end = Math.max(...spans.map(([, e]) => e as number));
  return end === start ? `${start}` : `${start}–${String(end).slice(2)}`;
}

function Name({ name }: { name: string }) {
  const p = project(name);
  if (!("link" in p) || !p.link) return <span className="text-text-secondary">{name}</span>;
  return (
    <a
      href={p.link}
      target="_blank"
      rel="noreferrer"
      className={
        p.status === "active"
          ? "text-foreground underline decoration-text-tertiary underline-offset-[3px] hover:decoration-primary"
          : "text-text-secondary underline decoration-border underline-offset-[3px] hover:decoration-primary"
      }
    >
      {name}
    </a>
  );
}

export function Facts({ item }: { item?: Variants }) {
  return (
    <ul className="mb-7 list-none p-0">
      {rows.map((row) => (
        <motion.li
          key={row.text}
          variants={item}
          data-reveal
          className="mb-1.5 text-foreground max-[480px]:mb-3"
        >
          <span className="inline-block w-[10ch] text-text-tertiary max-[480px]:block max-[480px]:w-auto">
            {dateLabel(row)}
          </span>
          {row.projects.map((name, i) => (
            <span key={name}>
              {i > 0 ? ", " : null}
              <Name name={name} />
            </span>
          ))}
          <span className="text-text-secondary">
            {row.projects.length > 0 && !row.text.startsWith(".") ? " " : ""}
            {row.text}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
