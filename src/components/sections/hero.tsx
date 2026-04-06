"use client";

import dynamic from "next/dynamic";
import { OrbSkeleton } from "@/components/voice-orb";
import { ErrorBoundary } from "@/components/error-boundary";

const VoiceOrb = dynamic(
  () => import("@/components/voice-orb").then((mod) => mod.VoiceOrb),
  { ssr: false, loading: () => <OrbSkeleton /> }
);

export function Hero() {
  return (
    <section className="min-h-[50dvh] flex flex-col items-center justify-center px-4 md:px-0 pt-12 pb-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-[640px]">
        {/* Orb */}
        <div style={{ animation: "fade-in-up 400ms ease-out both" }}>
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb />
          </ErrorBoundary>
        </div>

        {/* Name */}
        <h1
          className="text-[28px] md:text-[42px] font-semibold tracking-[-0.02em] text-center leading-tight"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "100ms" }}
        >
          Joan Mateo Duarte Politi
        </h1>

        {/* Subtitle */}
        <p
          className="text-[15px] md:text-[17px] text-muted-foreground text-center max-w-[480px] leading-relaxed"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "200ms" }}
        >
          I build products where AI, systems, and interface design meet.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-1"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "300ms" }}
        >
          <a
            href="#work"
            className="inline-flex items-center justify-center px-5 py-2 text-[14px] font-medium border border-border rounded-lg hover:border-border-hover active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See my work
          </a>
          <a
            href="#how-i-think"
            className="inline-flex items-center justify-center px-5 py-2 text-[14px] font-medium border border-border rounded-lg hover:border-border-hover active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read my story
          </a>
        </div>
      </div>
    </section>
  );
}
