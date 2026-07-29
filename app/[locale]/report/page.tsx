"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { RenovationResultView } from "@/components/report/RenovationResultView";
import { STORAGE_KEYS } from "@/lib/report";
import type { RenovationResult } from "@/lib/renovation";

export default function ReportPage() {
  const router = useRouter();
  const t = useTranslations("report");
  const [renovation, setRenovation] = useState<RenovationResult | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.renovation);
      const imageRaw =
        sessionStorage.getItem(STORAGE_KEYS.image) ??
        sessionStorage.getItem(STORAGE_KEYS.imageThumb);

      if (!raw) {
        router.replace("/upload");
        return;
      }

      setRenovation(JSON.parse(raw) as RenovationResult);
      if (imageRaw) {
        setBeforeImage(imageRaw);
        sessionStorage.removeItem(STORAGE_KEYS.image);
        sessionStorage.removeItem(STORAGE_KEYS.imageThumb);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEYS.renovation);
      router.replace("/upload");
    }
  }, [router]);

  if (!renovation) {
    return (
      <GradientBackground>
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 safe-bottom">
          <p className="text-muted animate-pulse-soft">{t("loading")}</p>
          <SiteFooter className="mt-8" />
        </main>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="minimal">
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-0 py-0 safe-bottom sm:px-6 sm:py-10">
        <div className="px-5 pt-8 sm:px-0">
          <PageTopRow className="mb-6" />
        </div>
        <RenovationResultView renovation={renovation} beforeImage={beforeImage} />
        <footer className="mt-10 flex flex-col gap-3 px-5 sm:px-0">
          <Button href="/upload" variant="secondary" size="md" className="w-full rounded-2xl">
            {t("retryUpload")}
          </Button>
          <Button href="/" variant="ghost" size="sm" className="w-full">
            {t("backHome")}
          </Button>
          <SiteFooter className="mt-2" />
        </footer>
      </main>
    </GradientBackground>
  );
}
