"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STEP_MS = 5500;

export function DesignProcessSteps() {
  const t = useTranslations("analyzing");
  const steps = t.raw("designSteps") as string[];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!steps?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, steps.length - 1));
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [steps]);

  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 h-0.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wood to-plant transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="space-y-4">
        {steps.map((label, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li
              key={label}
              className={`flex items-start gap-3 transition-opacity duration-500 ${
                i > activeIndex ? "opacity-35" : "opacity-100"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                  done
                    ? "bg-plant text-white"
                    : active
                      ? "bg-text text-white ring-2 ring-plant/30 ring-offset-2 ring-offset-background"
                      : "bg-surface text-muted"
                }`}
                aria-hidden
              >
                {done ? "✓" : i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm leading-snug ${
                    active ? "font-medium text-text" : "text-muted"
                  }`}
                >
                  {label}
                </p>
                {active ? (
                  <p className="mt-1 text-xs text-plant animate-pulse-soft">{t("stepActive")}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-plant animate-pulse-soft" />
        {t("engine")}
      </p>
    </div>
  );
}
