"use client";

import Script from "next/script";
import { createElement, useMemo, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type WidgetState = "loading" | "ready" | "error";

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
const defaultAvatarImageUrl = "/images/joan-avatar.jpg";
const avatarImageUrl =
  process.env.NEXT_PUBLIC_ELEVENLABS_AVATAR_IMAGE_URL ?? defaultAvatarImageUrl;

function getStatusLabel(state: WidgetState): string {
  if (!agentId) return "Voice not configured";
  if (state === "loading") return "Loading voice interface...";
  if (state === "error") return "Voice unavailable";
  return "Talk to Joan";
}

function WidgetFallback({
  status,
}: {
  status: WidgetState | "unconfigured";
}) {
  const label =
    status === "unconfigured"
      ? "Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID to enable voice."
      : status === "error"
        ? "The ElevenLabs widget failed to load."
        : "Loading the official ElevenLabs voice UI.";

  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-[24px] border border-border/70 bg-background/35 px-6 py-8 text-center">
      <div
        className={cn(
          "relative h-[96px] w-[96px] rounded-full",
          "animate-[orb-breathe_4s_ease-in-out_infinite]"
        )}
        style={{
          background:
            "radial-gradient(circle, oklch(0.837 0.128 66.29 / 0.16) 0%, oklch(0.837 0.128 66.29 / 0.06) 45%, transparent 72%)",
          boxShadow: "0 0 60px 18px oklch(0.837 0.128 66.29 / 0.08)",
        }}
      />
      <div className="space-y-2">
        <p className="text-[15px] font-medium text-foreground">{label}</p>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          The site will fall back here until the widget script is ready.
        </p>
      </div>
    </div>
  );
}

export function VoiceOrb() {
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");

  const widget = useMemo(() => {
    if (!agentId || widgetState !== "ready") return null;

    const props: Record<string, string | CSSProperties> = {
      "agent-id": agentId,
      variant: "full",
      dismissible: "false",
      transcript: "false",
      "text-input": "false",
      "avatar-when-collapsed": "true",
      "avatar-orb-color-1": "#c6884a",
      "avatar-orb-color-2": "#f2c995",
      style: {
        display: "block",
        width: "100%",
        height: "100%",
      },
    };

    if (avatarImageUrl) {
      props["avatar-image-url"] = avatarImageUrl;
    }

    return createElement("elevenlabs-convai", props);
  }, [widgetState]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        onReady={() => setWidgetState("ready")}
        onError={() => setWidgetState("error")}
      />
      <div className="w-full max-w-[min(360px,calc(100vw-2rem))] rounded-[28px] border border-border/70 bg-surface/65 p-3 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="relative min-h-[420px] overflow-hidden rounded-[22px]">
          {agentId ? (
            widgetState === "ready" && widget ? (
              widget
            ) : (
              <WidgetFallback status={widgetState} />
            )
          ) : (
            <WidgetFallback status="unconfigured" />
          )}
        </div>
      </div>
      <span className="text-[13px] text-muted-foreground select-none">
        {getStatusLabel(widgetState)}
      </span>
    </div>
  );
}

/** Static orb for SSR / loading / error boundary fallback */
export function OrbSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[min(360px,calc(100vw-2rem))] rounded-[28px] border border-border/70 bg-surface/65 p-3 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <WidgetFallback status="loading" />
      </div>
      <span className="text-[13px] text-muted-foreground select-none">
        Loading voice interface...
      </span>
    </div>
  );
}
