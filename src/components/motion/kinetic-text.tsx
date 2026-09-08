"use client";

import { motion } from "motion/react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

// The name enters one word at a time, from blurred to sharp. Hierarchy: it is
// the first thing on the page and it should arrive like it.
export function KineticText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          data-reveal
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: delay + i * 0.07, ease }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
