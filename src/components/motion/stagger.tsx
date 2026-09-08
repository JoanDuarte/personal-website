"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const parent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

// The hero's entrance: children arrive in order, 80ms apart. The order is the
// hierarchy (orb, then name, then the line), which is the only reason this
// animation exists.
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={parent}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div data-reveal className={className} variants={item}>
      {children}
    </motion.div>
  );
}
