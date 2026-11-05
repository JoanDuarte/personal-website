"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import bio from "@/data/bio.json";
import { ErrorBoundary } from "@/components/error-boundary";
import { Facts } from "@/components/facts";
import { OrbSkeleton, type OrbStatus } from "@/components/voice-orb";

// The orb needs the browser (WebGL, microphone), so it is loaded after
// hydration with the skeleton in its place. If the module never arrives the
// page keeps its layout and the label stays "Talk to me".
// The grid is an enhancement: no WebGL, no canvas, same page. Loading it
// client-side only also means it can read the color tokens off the document.
const GridBackground = dynamic(
  () => import("@/components/grid-background").then((m) => m.GridBackground),
  { ssr: false }
);

const VoiceOrb = dynamic(
  () => import("@/components/voice-orb").then((m) => m.VoiceOrb),
  { ssr: false, loading: () => <OrbSkeleton /> }
);

const labels: Record<OrbStatus, string> = {
  idle: "Talk to me",
  connecting: "Requesting microphone…",
  listening: "Listening",
  talking: "Joan is talking",
  error: "Voice unavailable",
};

const social = [
  { label: "GitHub", href: "https://github.com/JoanDuarte" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/joanmateoduarte/" },
  { label: "X", href: "https://x.com/jotyduarte" },
];

// The entrance: top to bottom, a fade and a small rise, nothing else. The
// MotionProvider collapses it under prefers-reduced-motion.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Home() {
  const [status, setStatus] = useState<OrbStatus>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  // 0..1, written by the orb while a session is open and read by the grid
  // every frame. A ref so volume never goes through React state.
  const activityRef = useRef(0);
  const open = status === "listening" || status === "talking";

  return (
    <main className="relative flex h-dvh items-center overflow-hidden px-6 text-[15px] leading-[1.6] max-[480px]:text-[14px]">
      <ErrorBoundary fallback={null}>
        <GridBackground activityRef={activityRef} />
      </ErrorBoundary>

      <motion.div
        className="vignette relative mx-auto w-full max-w-[560px]"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={item}
          data-reveal
          className="mb-6 flex flex-col items-center gap-2.5 text-center"
        >
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb
              activityRef={activityRef}
              onStatusChange={(s, d) => {
                setStatus(s);
                setDetail(d ?? null);
              }}
            />
          </ErrorBoundary>
          <p
            className={
              open ? "text-primary" : "text-text-tertiary"
            }
            aria-live="polite"
          >
            {labels[status]}
          </p>
          {status === "error" && detail ? (
            <p className="max-w-full truncate text-[13px] text-text-tertiary">
              {detail}
            </p>
          ) : null}
        </motion.div>

        <motion.h1
          variants={item}
          data-reveal
          className="mb-1 text-center text-[22px] font-medium tracking-[-0.01em]"
        >
          {bio.name}
        </motion.h1>
        <motion.p
          variants={item}
          data-reveal
          className="mx-auto mb-9 max-w-[420px] text-center text-text-secondary"
        >
          {bio.positioning}
        </motion.p>

        <Facts item={item} />

        <motion.nav
          variants={item}
          data-reveal
          className="flex flex-wrap justify-center gap-[18px]"
        >
          {social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-text-tertiary underline decoration-border underline-offset-[3px] hover:text-text-secondary hover:decoration-primary"
            >
              {s.label}
            </a>
          ))}
        </motion.nav>
      </motion.div>
    </main>
  );
}
