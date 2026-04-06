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
      className="inline-flex items-center gap-2 px-4 py-2.5 text-[15px] font-medium border border-border rounded-full hover:border-border-hover hover:bg-muted/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
      <span className={copied ? "text-primary" : ""}>
        {copied ? "Copied!" : "Email"}
      </span>
    </button>
  );
}
