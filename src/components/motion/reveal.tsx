"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Fades a section in once as it enters the viewport: opacity, a 16px rise and
// blur to sharp, nothing else. `once` so scrolling back up does not replay it. The trigger is a
// margin rather than a fraction of the element, because a section taller than
// the viewport can never show 20% of itself at once and would never appear.
// `data-reveal` is what the reduced-motion and <noscript> rules key on.
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const Tag = as === "section" ? motion.section : motion.div;
  return (
    <Tag
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -64px 0px" }}
      transition={{ duration: 0.6, ease }}
    >
      {children}
    </Tag>
  );
}
