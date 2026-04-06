"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-4 md:px-0" id={id}>
      <div className="max-w-[640px] mx-auto border-t border-border">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-4 text-left group"
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground group-hover:text-muted-foreground/70 transition-colors">
            {title}
          </p>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          className={`grid transition-all duration-200 ease-out ${
            open
              ? "grid-rows-[1fr] opacity-100 pb-6"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </section>
  );
}
