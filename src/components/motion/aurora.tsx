"use client";

import { motion, useReducedMotion } from "motion/react";

// Three blurred amber radials drifting slowly behind the hero. Transform only,
// so it stays on the GPU. It replaces the static radial that used to sit at the
// top of the page and is the atmosphere that ties the neutral base to the orb.
const blobs = [
  { left: "18%", top: "-12%", size: 540, duration: 22, x: [0, 70, -40, 0], y: [0, 30, -24, 0] },
  { left: "58%", top: "-22%", size: 640, duration: 26, x: [0, -60, 40, 0], y: [0, 44, 8, 0] },
  { left: "42%", top: "4%", size: 380, duration: 18, x: [0, 36, -64, 0], y: [0, -20, 34, 0] },
];

export function Aurora() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[85vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
    >
      {blobs.map((b) => (
        <motion.div
          key={b.left}
          className="absolute rounded-full bg-primary/[0.13] blur-[90px] will-change-transform"
          style={{ left: b.left, top: b.top, width: b.size, height: b.size }}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
