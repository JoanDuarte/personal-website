"use client";

import { Conversation, type VoiceConversation } from "@elevenlabs/client";
import { useCallback, useEffect, useRef, useState } from "react";
import agents from "../../agents.json";
import { Orb, type AgentState } from "@/components/ui/orb";

export type OrbStatus = "idle" | "connecting" | "listening" | "talking" | "error";

const fallbackAgentId = agents.agents[0]?.id ?? "";
const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? fallbackAgentId;

// The orb only moves while someone is talking; between words the grid would
// go flat, so the activity the grid sees never drops under this while a
// session is open.
const ACTIVITY_FLOOR = 0.35;

function getAgentState(status: OrbStatus): AgentState {
  switch (status) {
    case "connecting":
      return "thinking";
    case "listening":
      return "listening";
    case "talking":
      return "talking";
    default:
      return null;
  }
}

// The disc the page shows while the orb's module loads, if the agent id is
// missing, or if the orb throws. Same size, same place, so nothing shifts.
export function OrbSkeleton() {
  return <div aria-hidden className="h-14 w-14 rounded-full bg-primary/25" />;
}

export function VoiceOrb({
  onStatusChange,
  activityRef,
}: {
  onStatusChange: (status: OrbStatus, detail?: string) => void;
  activityRef: React.RefObject<number>;
}) {
  const conversationRef = useRef<VoiceConversation | null>(null);
  const [status, setStatusState] = useState<OrbStatus>("idle");
  const open = status === "listening" || status === "talking";

  const setStatus = useCallback(
    (next: OrbStatus, detail?: string) => {
      setStatusState(next);
      onStatusChange(next, detail);
    },
    [onStatusChange]
  );

  const endConversation = useCallback(async () => {
    const current = conversationRef.current;
    conversationRef.current = null;
    try {
      await current?.endSession();
    } catch {
      // The session may already be closed. Keep the UI deterministic.
    } finally {
      setStatus("idle");
    }
  }, [setStatus]);

  const handleActivate = useCallback(async () => {
    if (status === "connecting") return;

    if (status === "listening" || status === "talking") {
      await endConversation();
      return;
    }

    if (
      typeof window !== "undefined" &&
      (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
    ) {
      setStatus(
        "error",
        "This browser does not expose microphone access. Try Safari, Chrome or Firefox over HTTPS."
      );
      return;
    }

    setStatus("connecting");

    try {
      const conversation = await Conversation.startSession({
        agentId,
        connectionType: "webrtc",
        onConnect: () => setStatus("listening"),
        onDisconnect: () => {
          conversationRef.current = null;
          setStatus("idle");
        },
        onError: (message) => {
          conversationRef.current = null;
          setStatus(
            "error",
            typeof message === "string" ? message : "The voice session could not start."
          );
        },
        onModeChange: ({ mode }) => {
          if (mode === "speaking") setStatus("talking");
          else if (mode === "listening") setStatus("listening");
        },
      });
      conversationRef.current = conversation as VoiceConversation;
    } catch (error) {
      conversationRef.current = null;
      const msg = error instanceof Error ? error.message : "";
      const isRateLimit =
        msg.includes("limit") ||
        msg.includes("capacity") ||
        msg.includes("concurrent") ||
        msg.includes("429");
      setStatus(
        "error",
        isRateLimit
          ? "Joan's voice is busy right now. Try again in a moment."
          : msg || "The voice session could not start."
      );
    }
  }, [status, endConversation, setStatus]);

  // Feed the grid. One requestAnimationFrame loop while a session is open,
  // nothing otherwise.
  useEffect(() => {
    if (!open) {
      activityRef.current = 0;
      return;
    }
    let frame = 0;
    const tick = () => {
      const volume = conversationRef.current?.getOutputVolume() ?? 0;
      activityRef.current = Math.max(ACTIVITY_FLOOR, volume);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      activityRef.current = 0;
    };
  }, [open, activityRef]);

  useEffect(() => {
    return () => {
      const current = conversationRef.current;
      if (!current) return;
      conversationRef.current = null;
      void current.endSession().catch(() => {
        // Ignore cleanup errors during unmount.
      });
    };
  }, []);

  if (!agentId) return <OrbSkeleton />;

  return (
    <button
      type="button"
      onClick={() => void handleActivate()}
      aria-label={open ? "End the conversation" : "Talk to Joan"}
      aria-pressed={open}
      className="group h-14 w-14 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Orb
        className="h-full w-full"
        colors={["#a86a37", "#f1d2a4"]}
        agentState={getAgentState(status)}
        getInputVolume={() => conversationRef.current?.getInputVolume() ?? 0}
        getOutputVolume={() => conversationRef.current?.getOutputVolume() ?? 0}
      />
    </button>
  );
}
