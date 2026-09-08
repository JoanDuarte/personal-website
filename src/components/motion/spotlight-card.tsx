"use client";

import type { PointerEvent, ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// A shadcn Card with a radial amber highlight that follows the pointer while it
// is over the panel. Feedback: the panel under the cursor is the live one. Under
// reduced motion, or without a pointer, it is the plain Card with its hover.
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const reduce = useReducedMotion();
  const highlight = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, var(--spot), transparent 70%)`;

  function track(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  function leave() {
    x.set(-600);
    y.set(-600);
  }

  return (
    <Card
      className={cn("group/spot relative", className)}
      onPointerMove={reduce ? undefined : track}
      onPointerLeave={reduce ? undefined : leave}
    >
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
          style={{ background: highlight }}
        />
      )}
      <div className="relative flex flex-1 flex-col gap-(--card-spacing) px-(--card-spacing)">{children}</div>
    </Card>
  );
}
