"use client";

import { useEffect, useRef, useState } from "react";
import { OBSERVING_TEXTS } from "@/lib/prompts";

export function ObservingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % OBSERVING_TEXTS.length);
        setVisible(true);
      }, 400);
    }, 3200);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-sm px-2">
      <p className="mb-4 text-center text-4xl leading-none text-secondary/25">
        &ldquo;
      </p>
      <div className="relative min-h-[5.5rem]">
        <p
          className={`text-center text-xl leading-relaxed text-text transition-opacity duration-300 md:text-2xl ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          aria-live="polite"
        >
          {OBSERVING_TEXTS[index]}
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-muted">—— 你的工位</p>
    </div>
  );
}
