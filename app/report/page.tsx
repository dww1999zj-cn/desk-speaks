"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { ReportSwiper } from "@/components/report/ReportSwiper";
import { reportToCards, formatMbtiType, STORAGE_KEYS } from "@/lib/report";
import type { DeskReport, ReportCardData } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<DeskReport | null>(null);
  const [cards, setCards] = useState<ReportCardData[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [matchQuestion, setMatchQuestion] = useState<string>("");
  const [slideIndex, setSlideIndex] = useState(0);
  const isShareSlide = slideIndex === cards.length - 1;

  useEffect(() => {
    const reportRaw = sessionStorage.getItem(STORAGE_KEYS.report);
    const imageRaw =
      sessionStorage.getItem(STORAGE_KEYS.imageThumb) ??
      sessionStorage.getItem(STORAGE_KEYS.image);

    if (!reportRaw) {
      router.replace("/upload");
      return;
    }

    const parsed: DeskReport = JSON.parse(reportRaw);
    setReport(parsed);
    setCards(reportToCards(parsed));
    setMatchQuestion(
      `${formatMbtiType(parsed.mbtiDesk.type)} × ${parsed.zodiacDesk.sign}——这是工位眼中的你。像吗？`
    );
    if (imageRaw) setImage(imageRaw);
  }, [router]);

  if (cards.length === 0 || !report) {
    return (
      <GradientBackground>
        <main className="flex min-h-dvh items-center justify-center">
          <p className="text-muted animate-pulse-soft">工位正在整理信件…</p>
        </main>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        {!isShareSlide && (
          <header className="mb-6">
            <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary shadow-sm">
              🐮 工位牛马报告
            </p>
            <h1 className="text-2xl font-bold text-text">工位眼中的你</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {matchQuestion}
            </p>
          </header>
        )}

        {!isShareSlide && image && (
          <div className="mb-6 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="你的工位"
              className="h-28 w-full object-cover opacity-80"
            />
          </div>
        )}

        <ReportSwiper
          cards={cards}
          report={report}
          deskThumb={image}
          onIndexChange={setSlideIndex}
        />

        <footer className="mt-8 flex flex-col gap-3">
          {!isShareSlide && (
            <p className="text-center text-xs text-muted">
              滑到「鉴定卡」可预览并保存分享图
            </p>
          )}
          <Button href="/upload" variant="secondary" size="md" className="w-full">
            换张工位，再认一次
          </Button>
          <Button href="/" variant="ghost" size="sm" className="w-full">
            回到首页
          </Button>
        </footer>
      </main>
    </GradientBackground>
  );
}
