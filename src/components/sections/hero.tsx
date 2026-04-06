"use client";

import dynamic from "next/dynamic";
import bio from "@/data/bio.json";
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

        {/* Story */}
        <div
          className="max-w-[520px]"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "200ms" }}
        >
          {bio.story.map((paragraph, i) => (
            <p
              key={i}
              className="text-[14px] md:text-[15px] text-muted-foreground text-center leading-relaxed mb-3 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-1"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "300ms" }}
        >
          <a
            href="#work"
            className="inline-flex items-center justify-center px-5 py-2 text-[14px] font-medium border border-border rounded-lg hover:border-border-hover active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See my work
          </a>
        </div>
      </div>
    </section>
  );
}
