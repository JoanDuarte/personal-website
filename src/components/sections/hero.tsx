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
    <section className="min-h-[80dvh] flex flex-col items-center justify-center px-4 md:px-0">
      <div
        className="flex flex-col items-center gap-6 w-full max-w-[640px]"
        style={{ animation: "fade-in-up 300ms ease-out both" }}
      >
        {/* Mobile: orb above name */}
        <div className="md:hidden">
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb />
          </ErrorBoundary>
        </div>

        {/* Name */}
        <h1 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.02em] text-center leading-tight">
          Joan Mateo Duarte Politi
        </h1>

        {/* Positioning */}
        <p className="text-[16px] md:text-[18px] text-text-secondary text-center max-w-[480px] leading-relaxed">
          I build products where AI, systems, and interface design meet.
        </p>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-2">
          <a
            href="#selected-work"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] md:text-[15px] font-medium border border-[rgba(255,255,255,0.15)] rounded-lg opacity-100 hover:border-[rgba(255,255,255,0.4)] active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See my work
          </a>
          <a
            href="#how-i-think"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] md:text-[15px] font-medium border border-[rgba(255,255,255,0.15)] rounded-lg opacity-100 hover:border-[rgba(255,255,255,0.4)] active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read my story
          </a>
        </div>

        {/* Desktop: orb below CTAs */}
        <div className="hidden md:block mt-6">
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb />
          </ErrorBoundary>
        </div>
      </div>
    </section>
  );
}
