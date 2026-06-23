"use client";

import { useCallback, useState } from "react";
import type { ReportCardData } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ReportCard } from "./ReportCard";

interface ReportSwiperProps {
  cards: ReportCardData[];
}

export function ReportSwiper({ cards }: ReportSwiperProps) {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, cards.length - 1));
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

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
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Card
          variant="gradient"
          className={`transition-all duration-300 ${
            cards[current].type === "letter"
              ? "max-h-[70vh] min-h-[480px] overflow-y-auto"
              : "min-h-[420px]"
          }`}
        >
          <ReportCard data={cards[current]} index={0} />
        </Card>
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
              onClick={() => setCurrent(i)}
              aria-label={`第 ${i + 1} 张`}
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
          下一张
        </button>
      </div>
    </div>
  );
}
