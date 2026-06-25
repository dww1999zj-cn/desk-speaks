"use client";

import { useCallback, useState } from "react";
import type { DeskReport, ReportCardData } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ReportCard } from "./ReportCard";

const SLIDE_LABELS = ["初见", "MBTI", "星座", "来信", "鉴定卡"];

interface ReportSwiperProps {
  cards: ReportCardData[];
  report: DeskReport;
  deskThumb?: string | null;
  onIndexChange?: (index: number) => void;
}

export function ReportSwiper({
  cards,
  report,
  deskThumb,
  onIndexChange,
}: ReportSwiperProps) {
  const [current, setCurrent] = useState(0);
  const isShareSlide = cards[current]?.type === "share";

  const setSlide = useCallback(
    (next: number | ((c: number) => number)) => {
      setCurrent((c) => {
        const value = typeof next === "function" ? next(c) : next;
        onIndexChange?.(value);
        return value;
      });
    },
    [onIndexChange]
  );

  const goNext = useCallback(() => {
    setSlide((c) => Math.min(c + 1, cards.length - 1));
  }, [cards.length, setSlide]);

  const goPrev = useCallback(() => {
    setSlide((c) => Math.max(c - 1, 0));
  }, [setSlide]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    (e.currentTarget as HTMLElement).dataset.touchX = String(
      e.touches[0].clientX
    );
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const startX = Number(
        (e.currentTarget as HTMLElement).dataset.touchX ?? 0
      );
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 50) goNext();
      if (diff < -50) goPrev();
    },
    [goNext, goPrev]
  );

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs text-muted">
        {current + 1}/{cards.length} · {SLIDE_LABELS[current]}
        {cards[current]?.type === "letter" && " · 还剩一张鉴定卡"}
      </p>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {isShareSlide ? (
          <ReportCard
            data={cards[current]}
            index={0}
            report={report}
            deskThumb={deskThumb}
            onGoNext={goNext}
          />
        ) : (
          <Card
            variant="gradient"
            className={`transition-all duration-300 ${
              cards[current].type === "letter"
                ? "max-h-[70vh] min-h-[480px] overflow-y-auto"
                : "min-h-[420px]"
            }`}
          >
            <ReportCard
              data={cards[current]}
              index={0}
              report={report}
              deskThumb={deskThumb}
              onGoNext={goNext}
            />
          </Card>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between px-2">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-text disabled:opacity-30"
        >
          上一张
        </button>

        <div className="flex gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`第 ${i + 1} 张 · ${SLIDE_LABELS[i]}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={current === cards.length - 1}
          className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-text disabled:opacity-30"
        >
          {isShareSlide ? "已是最后" : "下一张"}
        </button>
      </div>
    </div>
  );
}
