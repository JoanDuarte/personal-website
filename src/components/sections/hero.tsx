"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "motion/react";
import bio from "@/data/bio.json";
import { OrbSkeleton } from "@/components/voice-orb";
import { ErrorBoundary } from "@/components/error-boundary";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { KineticText } from "@/components/motion/kinetic-text";
import { Aurora } from "@/components/motion/aurora";

const VoiceOrb = dynamic(
  () => import("@/components/voice-orb").then((mod) => mod.VoiceOrb),
  { ssr: false, loading: () => <OrbSkeleton /> }
);

// Three things: the orb, the name, the line. The name arrives word by word;
// the whole block shrinks and fades as it scrolls out, handing off to the story.
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <section
      ref={ref}
      className="relative min-h-[88dvh] flex flex-col items-center justify-center overflow-hidden px-4 md:px-0 pt-24 pb-16"
    >
      <Aurora />
      <motion.div
        data-reveal
        style={{ scale, opacity, y }}
        className="relative w-full max-w-[880px] will-change-transform"
      >
        <Stagger className="flex flex-col items-center gap-6">
          <StaggerItem>
            <ErrorBoundary fallback={<OrbSkeleton />}>
              <VoiceOrb />
            </ErrorBoundary>
          </StaggerItem>

          <h1 className="font-display font-semibold text-[40px] md:text-[60px] tracking-[-0.035em] leading-[1.02] text-center text-balance">
            <KineticText text={bio.name} delay={0.2} />
          </h1>

          <StaggerItem>
            <p className="text-[18px] md:text-[22px] text-foreground/90 text-center text-balance max-w-[560px] leading-snug">
              {bio.positioning}
            </p>
          </StaggerItem>
        </Stagger>
      </motion.div>
    </section>
  );
}
