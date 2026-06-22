"use client";

import { useEffect, useState } from "react";
import { OBSERVING_TEXTS } from "@/lib/prompts";

export function ObservingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % OBSERVING_TEXTS.length);
        setVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[80px] items-center justify-center px-6">
      <p
        className={`text-center text-lg text-text transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {OBSERVING_TEXTS[index]}
      </p>
    </div>
  );
}
