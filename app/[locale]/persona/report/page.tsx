"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { ReportSwiper } from "@/components/report/ReportSwiper";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import {
  reportToCards,
  normalizeReport,
  STORAGE_KEYS,
  type ReportCardLabels,
} from "@/lib/report";
import type { DeskReport, ReportCardData } from "@/lib/types";
import { resolveLocale } from "@/lib/i18n/locale";

export default function PersonaReportPage() {
  const router = useRouter();
  const t = useTranslations("report.persona");
  const tReport = useTranslations("report");
  const [report, setReport] = useState<DeskReport | null>(null);
  const [cards, setCards] = useState<ReportCardData[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [matchQuestion, setMatchQuestion] = useState<string>("");
  const [slideIndex, setSlideIndex] = useState(0);
  const isShareSlide = slideIndex === cards.length - 1;

  const cardLabels: ReportCardLabels = useMemo(
    () => ({
      salaryLayer: tReport("cards.salaryLayer"),
      salaryTitle: tReport("cards.salaryTitle"),
      fengshuiLayer: tReport("cards.fengshuiLayer"),
      fengshuiTitle: tReport("cards.fengshuiTitle"),
      careerLayer: tReport("cards.careerLayer"),
      careerTitle: tReport("cards.careerTitle"),
    }),
    [tReport]
  );

  useEffect(() => {
    try {
      const reportRaw = sessionStorage.getItem(STORAGE_KEYS.report);
      const imageRaw =
        sessionStorage.getItem(STORAGE_KEYS.imageThumb) ??
        sessionStorage.getItem(STORAGE_KEYS.image);
      const storedLocale = resolveLocale(
        sessionStorage.getItem(STORAGE_KEYS.locale)
      );

      if (!reportRaw) {
        router.replace("/persona/upload");
        return;
      }

      const parsed = normalizeReport(JSON.parse(reportRaw), storedLocale);
      setReport(parsed);
      setCards(reportToCards(parsed, cardLabels));
      setMatchQuestion(
        parsed.shareCard.shareHook ||
          t("matchFallback", { salary: parsed.salary.guessedSalary })
      );
      if (imageRaw) setImage(imageRaw);
    } catch {
      sessionStorage.removeItem(STORAGE_KEYS.report);
      sessionStorage.removeItem(STORAGE_KEYS.image);
      sessionStorage.removeItem(STORAGE_KEYS.imageThumb);
      router.replace("/persona/upload");
    }
  }, [router, cardLabels, t]);

  if (cards.length === 0 || !report) {
    return (
      <GradientBackground>
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 safe-bottom">
          <p className="text-white/55 animate-pulse-soft">{t("loading")}</p>
          <SiteFooter className="mt-8 text-white/40" />
        </main>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        {!isShareSlide ? (
          <header className="mb-6">
            <PageTopRow
              left={
                <p className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                  {t("badge")}
                </p>
              }
            />
            <h1 className="mt-4 font-display text-2xl font-semibold text-white">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{matchQuestion}</p>
          </header>
        ) : (
          <PageTopRow className="mb-4" />
        )}

        {!isShareSlide && image && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={t("deskAlt")}
              className="h-28 w-full object-cover opacity-90"
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
            <p className="text-center text-xs text-white/45">{t("shareHint")}</p>
          )}
          <Button href="/persona/upload" variant="secondary" size="md" className="w-full">
            {tReport("retryUpload")}
          </Button>
          <Button href="/" variant="ghost" size="sm" className="w-full">
            {tReport("backHome")}
          </Button>
          <SiteFooter className="mt-2 text-white/40" />
        </footer>
      </main>
    </GradientBackground>
  );
}
