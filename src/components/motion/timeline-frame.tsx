"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";

// The vertical line of the timeline draws itself as the reader scrolls through
// the section. Story: the order matters, and the scroll is the reader's pace.
export function TimelineFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
      <motion.div
        aria-hidden
        data-reveal
        className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-primary"
        style={{ scaleY }}
      />
      {children}
    </div>
  );
}
