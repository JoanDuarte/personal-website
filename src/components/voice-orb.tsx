"use client";

import Image from "next/image";
import {
  Conversation,
  type VoiceConversation,
} from "@elevenlabs/client";
import { Mic, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import agents from "../../agents.json";
import { Orb, type AgentState } from "@/components/ui/orb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrbStatus = "idle" | "connecting" | "listening" | "talking" | "error";

const fallbackAgentId = agents.agents[0]?.id ?? "";
const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? fallbackAgentId;
const defaultAvatarImageUrl = "/images/joan-avatar.jpg";
const avatarImageUrl =
  process.env.NEXT_PUBLIC_ELEVENLABS_AVATAR_IMAGE_URL ?? defaultAvatarImageUrl;

function getStatusLabel(status: OrbStatus): string {
  switch (status) {
    case "idle":
      return "Talk to Joan";
    case "connecting":
      return "Requesting microphone...";
    case "listening":
      return "Listening";
    case "talking":
      return "Joan is talking";
    case "error":
      return "Voice unavailable";
  }
}

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

function OrbFallback({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-[240px] w-[240px] items-center justify-center md:h-[320px] md:w-[320px]">
        <div
          className={cn(
            "h-[180px] w-[180px] rounded-full md:h-[240px] md:w-[240px]",
            "animate-[orb-breathe_4s_ease-in-out_infinite]"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.837 0.128 66.29 / 0.18) 0%, oklch(0.837 0.128 66.29 / 0.07) 40%, transparent 72%)",
            boxShadow: "0 0 80px 24px oklch(0.837 0.128 66.29 / 0.08)",
          }}
        />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        <p className="max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
          {detail}
        </p>
      </div>
    </div>
  );
}

export function VoiceOrb() {
  const conversationRef = useRef<VoiceConversation | null>(null);
  const [status, setStatus] = useState<OrbStatus>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const agentState = useMemo(() => getAgentState(status), [status]);
  const hasConversation =
    status === "connecting" || status === "listening" || status === "talking";

  const endConversation = useCallback(async () => {
    const current = conversationRef.current;
    conversationRef.current = null;

    if (!current) {
      setStatus("idle");
      return;
    }

    try {
      await current.endSession();
    } catch {
      // The session may already be closed. Keep the UI deterministic.
    } finally {
      setStatus("idle");
    }
  }, []);

  const handleActivate = useCallback(async () => {
    if (!agentId) {
      setStatus("error");
      setErrorDetail("Missing ElevenLabs agent ID.");
      return;
    }

    if (hasConversation) {
      await endConversation();
      return;
    }

    setErrorDetail(null);
    setStatus("connecting");

    try {
      const conversation = await Conversation.startSession({
        agentId,
        connectionType: "webrtc",
        onConnect: () => {
          setStatus("listening");
        },
        onDisconnect: () => {
          conversationRef.current = null;
          setStatus("idle");
        },
        onError: (message) => {
          conversationRef.current = null;
          setStatus("error");
          setErrorDetail(
            typeof message === "string"
              ? message
              : "The voice session could not start."
          );
        },
        onModeChange: ({ mode }) => {
          if (mode === "speaking") {
            setStatus("talking");
            return;
          }

          if (mode === "listening") {
            setStatus("listening");
          }
        },
      });

      conversationRef.current = conversation as VoiceConversation;
    } catch (error) {
      conversationRef.current = null;
      setStatus("error");
      setErrorDetail(
        error instanceof Error
          ? error.message
          : "The voice session could not start."
      );
    }
  }, [endConversation, hasConversation]);

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

  if (!agentId) {
    return (
      <OrbFallback
        title="Voice not configured"
        detail="Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID to enable the live voice session."
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex h-[240px] w-[240px] items-center justify-center md:h-[320px] md:w-[320px]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.837_0.128_66.29_/_0.12)_0%,transparent_70%)] blur-3xl" />
        <Orb
          className="relative h-full w-full"
          colors={["#a86a37", "#f1d2a4"]}
          agentState={agentState}
          getInputVolume={() => conversationRef.current?.getInputVolume() ?? 0}
          getOutputVolume={() => conversationRef.current?.getOutputVolume() ?? 0}
        />
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border/70 bg-background/78 px-3 py-2 shadow-lg backdrop-blur-xl">
          <Image
            src={avatarImageUrl}
            alt="Joan Duarte"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            priority
          />
          <div className="pr-1 text-left leading-tight">
            <p className="text-[12px] font-medium text-foreground">Joan</p>
            <p className="text-[11px] text-muted-foreground">Actual human.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <Button
          onClick={() => void handleActivate()}
          size="lg"
          className="h-10 min-w-[160px] rounded-full px-5"
        >
          {hasConversation ? (
            <>
              <PhoneOff />
              End call
            </>
          ) : (
            <>
              <Mic />
              Start call
            </>
          )}
        </Button>
        <span className="text-[13px] text-muted-foreground">
          {getStatusLabel(status)}
        </span>
        {errorDetail ? (
          <p className="max-w-[320px] text-[12px] leading-relaxed text-muted-foreground/90">
            {errorDetail}
          </p>
        ) : (
          <p className="max-w-[320px] text-[12px] leading-relaxed text-muted-foreground/90">
            Grant microphone access when the browser asks. The orb reacts live
            to both your voice and Joan&apos;s.
          </p>
        )}
      </div>
    </div>
  );
}

export function OrbSkeleton() {
  return (
    <OrbFallback
      title="Loading voice interface..."
      detail="Preparing the orb and voice session controls."
    />
  );
}
