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
      }, 350);
    }, 2800);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative mx-auto h-20 w-full max-w-xs sm:max-w-sm">
      <p
        className={`absolute inset-0 flex items-center justify-center px-2 text-center text-base leading-relaxed text-text transition-opacity duration-300 sm:text-lg ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        {OBSERVING_TEXTS[index]}
      </p>
    </div>
  );
}
