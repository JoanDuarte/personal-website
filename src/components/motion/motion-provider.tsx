"use client";

import { MotionConfig } from "motion/react";

// One place for the site's motion policy. `reducedMotion="user"` makes every
// Motion animation below it collapse to its final state when the visitor has
// asked the OS for reduced motion, so the individual components don't have to
// check.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
