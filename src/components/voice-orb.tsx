"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type OrbStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

function getStatusLabel(status: OrbStatus): string {
  switch (status) {
    case "idle":
      return "Tap to talk";
    case "connecting":
      return "Connecting...";
    case "listening":
      return "Listening...";
    case "speaking":
      return "Speaking...";
    case "error":
      return "Voice unavailable";
  }
}

export function VoiceOrb() {
  const [orbStatus, setOrbStatus] = useState<OrbStatus>("idle");

  const conversation = useConversation({
    onConnect: () => setOrbStatus("listening"),
    onDisconnect: () => setOrbStatus("idle"),
    onError: () => setOrbStatus("error"),
    onModeChange: ({ mode }) => {
      if (mode === "speaking") setOrbStatus("speaking");
      else if (mode === "listening") setOrbStatus("listening");
    },
  });

  const handleActivate = useCallback(async () => {
    if (orbStatus === "connecting" || orbStatus === "listening" || orbStatus === "speaking") {
      await conversation.endSession();
      setOrbStatus("idle");
      return;
    }

    setOrbStatus("connecting");

    try {
      const res = await fetch("/api/conversation-token");
      if (!res.ok) {
        setOrbStatus("error");
        return;
      }

      const { signedUrl } = await res.json();
      await conversation.startSession({ signedUrl });
    } catch {
      setOrbStatus("error");
    }
  }, [orbStatus, conversation]);

  // Recover from error state after 3 seconds
  useEffect(() => {
    if (orbStatus === "error") {
      const timer = setTimeout(() => setOrbStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [orbStatus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      } else if (e.key === "Escape" && orbStatus !== "idle") {
        conversation.endSession();
        setOrbStatus("idle");
      }
    },
    [handleActivate, orbStatus, conversation]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={
          orbStatus === "idle"
            ? "Start voice conversation"
            : "End voice conversation"
        }
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative w-[48px] h-[48px] md:w-[120px] md:h-[120px] rounded-full cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-all select-none",
          orbStatus === "idle" && "animate-[orb-breathe_4s_ease-in-out_infinite]",
          orbStatus === "connecting" && "animate-[orb-connecting_2s_ease-in-out_infinite]",
          orbStatus === "listening" && "opacity-100",
          orbStatus === "speaking" && "animate-[orb-active_1.5s_ease-in-out_infinite]",
          orbStatus === "error" && "opacity-30 animate-none"
        )}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
          boxShadow:
            orbStatus === "speaking" || orbStatus === "listening"
              ? "0 0 60px 20px rgba(255,255,255,0.1)"
              : "0 0 60px 20px rgba(255,255,255,0.06)",
        }}
      />
      <span className="text-[13px] text-text-tertiary select-none">
        {getStatusLabel(orbStatus)}
      </span>
    </div>
  );
}

/** Static orb for SSR / loading / error boundary fallback */
export function OrbSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-[48px] h-[48px] md:w-[120px] md:h-[120px] rounded-full animate-[orb-breathe_4s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
          boxShadow: "0 0 60px 20px rgba(255,255,255,0.06)",
        }}
      />
      <span className="text-[13px] text-text-tertiary select-none">
        Tap to talk
      </span>
    </div>
  );
}
