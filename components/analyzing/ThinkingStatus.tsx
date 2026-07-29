"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DesignProcessSteps } from "@/components/analyzing/DesignProcessSteps";

function ThinkingMascot() {
  const t = useTranslations("analyzing");
  const tCommon = useTranslations("common");

  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/40 to-wood/20 animate-pulse-soft" />
      <div className="relative flex h-24 w-24 animate-float-cute flex-col items-center justify-center rounded-[1.75rem] border-2 border-white bg-white shadow-lg">
        <span className="text-4xl leading-none animate-wiggle-cute">🐮</span>
        <span className="mt-0.5 text-[10px] font-medium text-muted">
          {tCommon("mascotName")}
        </span>
      </div>
      <span
        className="absolute -right-1 bottom-2 rounded-full bg-wood/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm animate-pulse-soft"
        aria-hidden
      >
        {t("reasoning")}
      </span>
    </div>
  );
}

function PersonaThinkingStatus() {
  const t = useTranslations("analyzing.persona");
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
      <div className="mt-10 w-full px-2">
        <div className="relative min-h-[4.5rem] overflow-hidden">
          <p
            key={index}
            className="animate-fade-in text-center text-lg font-medium leading-relaxed text-text"
            aria-live="polite"
          >
            {texts[index]}
          </p>
        </div>
      </div>
      <p className="mt-8 flex items-center gap-1.5 text-xs text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-plant animate-pulse-soft" />
        {t("engine")}
      </p>
    </div>
  );
}

function RenovationThinkingStatus() {
  const t = useTranslations("analyzing");

  return (
    <div className="flex w-full flex-col items-center px-2">
      <p className="mb-8 text-center text-lg font-medium text-text">{t("headline")}</p>
      <DesignProcessSteps />
    </div>
  );
}

export function ThinkingStatus({ mode = "renovation" }: { mode?: "renovation" | "persona" }) {
  if (mode === "persona") {
    return <PersonaThinkingStatus />;
  }
  return <RenovationThinkingStatus />;
}
