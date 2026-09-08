"use client";

import dynamic from "next/dynamic";
import bio from "@/data/bio.json";
import { OrbSkeleton } from "@/components/voice-orb";
import { ErrorBoundary } from "@/components/error-boundary";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const VoiceOrb = dynamic(
  () => import("@/components/voice-orb").then((mod) => mod.VoiceOrb),
  { ssr: false, loading: () => <OrbSkeleton /> }
);

// Three things and nothing else: the orb, the name, the line. The story moved
// to its own section directly below so the first screen stays a single moment.
export function Hero() {
  return (
    <section className="min-h-[70dvh] flex flex-col items-center justify-center px-4 md:px-0 pt-24 pb-12">
      <Stagger className="flex flex-col items-center gap-5 w-full max-w-[640px]">
        <StaggerItem>
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb />
          </ErrorBoundary>
        </StaggerItem>

        <StaggerItem>
          <h1 className="font-display font-semibold text-[34px] md:text-[48px] tracking-[-0.03em] leading-[1.05] text-center">
            {bio.name}
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="text-[17px] md:text-[20px] text-foreground/90 text-center text-balance max-w-[520px] leading-snug">
            {bio.positioning}
          </p>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
