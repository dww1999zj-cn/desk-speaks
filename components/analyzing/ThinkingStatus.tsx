"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function ThinkingMascot() {
  const t = useTranslations("analyzing");
  const tCommon = useTranslations("common");

  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/40 to-primary/20 animate-pulse-soft" />
      <div className="relative flex h-24 w-24 animate-float-cute flex-col items-center justify-center rounded-[1.75rem] border-[3px] border-white bg-white shadow-lg shadow-primary/15">
        <span className="text-4xl leading-none animate-wiggle-cute">🐮</span>
        <span className="mt-0.5 text-[10px] font-medium text-primary/80">
          {tCommon("mascotName")}
        </span>
      </div>
      <span
        className="absolute -right-2 top-0 text-2xl animate-bounce-cute"
        aria-hidden
      >
        💻
      </span>
      <span
        className="absolute -bottom-1 -left-2 text-lg animate-bounce-cute"
        style={{ animationDelay: "0.4s" }}
        aria-hidden
      >
        ☕
      </span>
      <span
        className="absolute -right-1 bottom-2 rounded-full bg-accent/90 px-1.5 py-0.5 text-[10px] font-bold text-text shadow-sm animate-pulse-soft"
        aria-hidden
      >
        {t("reasoning")}
      </span>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="mt-4 inline-flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-primary/70 animate-think-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

export function ThinkingStatus() {
  const t = useTranslations("analyzing");
  const texts = t.raw("thinkingTexts") as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!texts?.length) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [texts]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <ThinkingMascot />

      <div className="mt-10 w-full rounded-3xl border-2 border-white/80 bg-white/90 px-5 py-6 shadow-md shadow-secondary/20 md:bg-white/75 md:backdrop-blur-sm">
        <div className="relative min-h-[4rem] overflow-hidden">
          <p
            key={index}
            className="animate-fade-in text-center text-lg font-medium leading-relaxed text-text"
            aria-live="polite"
          >
            {texts[index]}
          </p>
        </div>
        <div className="flex justify-center">
          <ThinkingDots />
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
        {t("engine")}
      </p>
    </div>
  );
}
