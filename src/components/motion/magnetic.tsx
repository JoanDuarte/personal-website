"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const spring = { stiffness: 220, damping: 18, mass: 0.4 };
const limit = 18;

// Pulls its child a few pixels toward the pointer and springs back. Feedback
// on the one action the page asks for. Inert under reduced motion.
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const reduce = useReducedMotion();

  function move(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.35;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
    x.set(Math.max(-limit, Math.min(limit, dx)));
    y.set(Math.max(-limit, Math.min(limit, dy)));
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={reduce ? undefined : { x: sx, y: sy }}
      onPointerMove={reduce ? undefined : move}
      onPointerLeave={reduce ? undefined : reset}
    >
      {children}
    </motion.div>
  );
}
