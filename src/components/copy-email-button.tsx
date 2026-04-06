"use client";

import { useState, useCallback } from "react";

const EMAIL = "hello@jmduarte.com";

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
    <button
      onClick={handleClick}
      className="text-muted-foreground hover:text-foreground transition-colors relative"
      aria-label={copied ? "Email copied!" : "Copy email"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] text-primary whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}
