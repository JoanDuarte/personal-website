"use client";

import { useEffect, useRef, useState } from "react";

export function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);

    // Eager reveal on anchor click: listen for hash changes
    // and immediately reveal all sections between current and target
    const handleHashChange = () => {
      setRevealed(true);
    };

    // Also listen for click on anchor links to reveal before smooth scroll
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href^='#']");
      if (anchor) {
        setRevealed(true);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleClick);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="reveal-section"
      style={{
        opacity: revealed ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
}
