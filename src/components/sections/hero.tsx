"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { OrbSkeleton } from "@/components/voice-orb";
import { ErrorBoundary } from "@/components/error-boundary";

const VoiceOrb = dynamic(
  () => import("@/components/voice-orb").then((mod) => mod.VoiceOrb),
  { ssr: false, loading: () => <OrbSkeleton /> }
);

export function Hero() {
  const [chevronVisible, setChevronVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setChevronVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const hero = document.getElementById("hero-section");
    if (hero) observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero-section"
      className="min-h-[60dvh] flex flex-col items-center justify-center px-4 md:px-0 relative"
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-[640px]">
        {/* Orb — single instance, always above name */}
        <div style={{ animation: "fade-in-up 400ms ease-out both" }}>
          <ErrorBoundary fallback={<OrbSkeleton />}>
            <VoiceOrb />
          </ErrorBoundary>
        </div>

        {/* Name */}
        <h1
          className="text-[32px] md:text-[48px] font-semibold tracking-[-0.02em] text-center leading-tight"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "100ms" }}
        >
          Joan Mateo Duarte Politi
        </h1>

        {/* Subtitle */}
        <p
          className="text-[16px] md:text-[18px] text-muted-foreground text-center max-w-[480px] leading-relaxed"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "200ms" }}
        >
          I build products where AI, systems, and interface design meet.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-2"
          style={{ animation: "fade-in-up 400ms ease-out both", animationDelay: "300ms" }}
        >
          <a
            href="#selected-work"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-medium border border-border rounded-lg hover:border-border-hover active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See my work
          </a>
          <a
            href="#how-i-think"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-medium border border-border rounded-lg hover:border-border-hover active:translate-y-px transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read my story
          </a>
        </div>
      </div>

      {/* Scroll-down chevron */}
      <a
        href="#selected-work"
        aria-label="Scroll to selected work"
        className="absolute bottom-8 transition-opacity duration-500"
        style={{ opacity: chevronVisible ? 1 : 0 }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
