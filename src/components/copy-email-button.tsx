"use client";

import { useState, useCallback } from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMAIL = "joan@heyflare.app";

// The one action the page asks for, as an amber pill. Copies on click and says
// so for two seconds; without a clipboard it opens a mail link instead.
export function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    if (copied) return;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        window.location.href = `mailto:${EMAIL}`;
      }
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  }, [copied]);

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="h-11 rounded-full px-5 text-[14px] active:scale-[0.98]"
      aria-label={copied ? "Email copied!" : "Copy email"}
    >
      {copied ? <Check /> : <Mail />}
      {copied ? "Copied!" : "Copy email"}
    </Button>
  );
}
