"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  labelsNamespace?: string;
  variant?: "report" | "marketing";
  autoDemo?: boolean;
  className?: string;
}

import { CompareHandleIcon, CompareSwipeIcon } from "@/components/ui/CompareIcons";

/** Marketing demo: before-heavy → reveal after → rest at 50% for exploration */
const DEMO_START = 14;
const DEMO_REVEAL_END = 72;
const DEMO_REST = 50;

function CompareHandle({
  marketing,
  pulse,
}: {
  marketing: boolean;
  pulse: boolean;
}) {
  if (!marketing) {
    return <CompareHandleIcon className="h-4 w-4 text-white" />;
  }

  return (
    <div className={pulse ? "animate-handle-hint rounded-full" : "rounded-full"}>
      <CompareHandleIcon className="h-5 w-5 text-text" />
    </div>
  );
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  labelsNamespace = "report.renovation",
  variant = "report",
  autoDemo = false,
  className = "",
}: BeforeAfterSliderProps) {
  const t = useTranslations(labelsNamespace);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(variant === "marketing" && autoDemo ? DEMO_START : 50);
  const [handlePulse, setHandlePulse] = useState(false);
  const dragging = useRef(false);
  const demoRan = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(96, Math.max(4, next)));
  }, []);

  useEffect(() => {
    if (!autoDemo || variant !== "marketing" || demoRan.current) return;
    demoRan.current = true;

    let frame = 0;
    let cancelled = false;
    let pauseTimer: ReturnType<typeof setTimeout> | undefined;

    const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
    const easeOutQuad = (p: number) => p * (2 - p);

    const animate = (
      from: number,
      to: number,
      duration: number,
      ease: (p: number) => number,
      onDone?: () => void
    ) => {
      const startAt = performance.now();
      const step = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, (now - startAt) / duration);
        setPosition(from + (to - from) * ease(p));
        if (p < 1) {
          frame = requestAnimationFrame(step);
        } else {
          onDone?.();
        }
      };
      frame = requestAnimationFrame(step);
    };

    setPosition(DEMO_START);
    // Phase 1: 旧照 → 新照（左→右，揭示改造）
    animate(DEMO_START, DEMO_REVEAL_END, 2400, easeOutCubic, () => {
      // Phase 2: 短暂停留后回到 50%，方便用户继续左右探索
      pauseTimer = setTimeout(() => {
        animate(DEMO_REVEAL_END, DEMO_REST, 650, easeOutQuad, () => {
          setHandlePulse(true);
        });
      }, 400);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [autoDemo, variant]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    setHandlePulse(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isMarketing = variant === "marketing";

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-muted`}
      >
        <span>{t("before")}</span>
        {isMarketing ? (
          <CompareSwipeIcon className="h-4 w-4 text-muted/50" />
        ) : (
          <CompareSwipeIcon className="h-4 w-4 text-muted/40" aria-hidden />
        )}
        <span>{t("after")}</span>
      </div>

      <div
        ref={containerRef}
        className={`relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-surface shadow-lg ${
          isMarketing ? "rounded-2xl ring-1 ring-black/5" : "rounded-none shadow-2xl sm:rounded-2xl"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={t("compareAria")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt={afterAlt}
          className={`absolute inset-0 h-full w-full object-cover object-center ${
            isMarketing ? "brightness-105 saturate-110" : ""
          }`}
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className={`absolute inset-0 h-full w-full object-cover object-center ${
              isMarketing ? "brightness-90 saturate-75 contrast-105" : ""
            }`}
            draggable={false}
          />
          {isMarketing ? (
            <div className="absolute inset-0 bg-stone-600/10 mix-blend-multiply" aria-hidden />
          ) : null}
        </div>

        <div
          className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_20px_rgba(0,0,0,0.45)]"
          style={{ left: `${position}%` }}
        >
          <div
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md ${
              isMarketing
                ? "h-11 w-11 border border-white/90 bg-white/95 shadow-xl shadow-black/20"
                : "h-10 w-10 border-2 border-white bg-text/85"
            }`}
          >
            <CompareHandle marketing={isMarketing} pulse={handlePulse && isMarketing} />
          </div>
        </div>

        {isMarketing ? (
          <>
            <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
              {t("before")}
            </span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-plant/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
              {t("after")}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
