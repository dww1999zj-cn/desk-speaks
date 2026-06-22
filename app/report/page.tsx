"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { ReportSwiper } from "@/components/report/ReportSwiper";
import { reportToCards, STORAGE_KEYS } from "@/lib/report";
import type { DeskReport, DeskStats, ReportCardData } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [cards, setCards] = useState<ReportCardData[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const reportRaw = sessionStorage.getItem(STORAGE_KEYS.report);
    const imageRaw = sessionStorage.getItem(STORAGE_KEYS.image);

    if (!reportRaw) {
      router.replace("/upload");
      return;
    }

    const report: DeskReport = JSON.parse(reportRaw);
    if (imageRaw) setImage(imageRaw);

    const loadReport = async () => {
      let stats: DeskStats | null = null;
      const reportId = sessionStorage.getItem(STORAGE_KEYS.reportId);

      try {
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            traits: report.traits,
            excludeId: reportId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.enabled && data.stats) {
            stats = data.stats;
          }
        }
      } catch {
        // 统计失败时仍展示基础报告
      }

      setCards(reportToCards(report, stats));
      setLoadingStats(false);
    };

    loadReport();
  }, [router]);

  if (loadingStats || cards.length === 0) {
    return (
      <GradientBackground>
        <main className="flex min-h-dvh items-center justify-center">
          <p className="text-muted animate-pulse-soft">加载中…</p>
        </main>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-text">你的人格档案</h1>
          <p className="mt-1 text-sm text-muted">来自你的工位</p>
        </header>

        {image && (
          <div className="mb-6 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="你的工位"
              className="h-32 w-full object-cover opacity-80"
            />
          </div>
        )}

        <ReportSwiper cards={cards} />

        <footer className="mt-10 flex flex-col gap-3">
          <Button href="/upload" variant="secondary" size="md" className="w-full">
            再测一次
          </Button>
          <Button href="/" variant="ghost" size="sm" className="w-full">
            回到首页
          </Button>
        </footer>
      </main>
    </GradientBackground>
  );
}
