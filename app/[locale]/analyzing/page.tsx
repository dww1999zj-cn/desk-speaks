"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ThinkingStatus } from "@/components/analyzing/ThinkingStatus";
import {
  AnalyzeErrorPanel,
  type AnalyzeErrorType,
} from "@/components/analyzing/AnalyzeErrorPanel";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { STORAGE_KEYS } from "@/lib/report";
import type { RenovationResult } from "@/lib/renovation";
import { resolveDeskStyle } from "@/lib/renovation/desk-styles";
import type { AppLocale } from "@/lib/i18n/locale";
import { isAppLocale } from "@/lib/i18n/locale";

const MIN_DISPLAY_MS = 800;
const ANALYZE_TIMEOUT_MS = 120000;

type Phase = "loading" | "error";

function parsePreviewError(value: string | null): AnalyzeErrorType | null {
  if (value === "failed" || value === "error") return "failed";
  if (value === "timeout") return "timeout";
  if (value === "not_desk") return "not_desk";
  return null;
}

function AnalyzingPageContent() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const previewError = parsePreviewError(searchParams.get("preview"));

  const [phase, setPhase] = useState<Phase>(previewError ? "error" : "loading");
  const [errorType, setErrorType] = useState<AnalyzeErrorType>(
    previewError ?? "failed"
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (previewError) return;

    const image = sessionStorage.getItem(STORAGE_KEYS.image);
    if (!image) {
      router.replace("/upload");
      return;
    }

    let cancelled = false;
    setPhase("loading");
    const startAt = Date.now();
    const requestLocale: AppLocale = isAppLocale(locale) ? locale : "zh";

    const analyze = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

        const deskStyle = resolveDeskStyle(sessionStorage.getItem(STORAGE_KEYS.deskStyle));

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, locale: requestLocale, deskStyle }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (cancelled) return;

        const data = await res.json();

        if (res.status === 422 && data.error === "not_desk") {
          setErrorType("not_desk");
          setPhase("error");
          return;
        }

        if (!res.ok) throw new Error("analyze failed");

        const renovation = data.renovation as RenovationResult;
        sessionStorage.setItem(STORAGE_KEYS.renovation, JSON.stringify(renovation));
        sessionStorage.setItem(STORAGE_KEYS.locale, requestLocale);
        sessionStorage.setItem(STORAGE_KEYS.product, "renovation");
        sessionStorage.removeItem(STORAGE_KEYS.report);
        // 保留原图供报告页大图展示，报告页读后清除

        const elapsed = Date.now() - startAt;
        if (elapsed < MIN_DISPLAY_MS) {
          await new Promise((r) => setTimeout(r, MIN_DISPLAY_MS - elapsed));
        }
        if (cancelled) return;

        router.replace("/report");
      } catch (err) {
        if (cancelled) return;
        const isTimeout = err instanceof Error && err.name === "AbortError";
        setErrorType(isTimeout ? "timeout" : "failed");
        setPhase("error");
      }
    };

    analyze();

    return () => {
      cancelled = true;
    };
  }, [router, attempt, previewError, locale]);

  const handleRetry = useCallback(() => {
    if (previewError) {
      setPhase("loading");
      window.setTimeout(() => {
        setPhase("error");
        setErrorType(previewError);
      }, 600);
      return;
    }
    setAttempt((n) => n + 1);
  }, [previewError]);

  const handleChangePhoto = useCallback(() => {
    router.replace("/upload");
  }, [router]);

  return (
    <GradientBackground variant="minimal">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-12 safe-bottom sm:px-6">
        <PageTopRow className="mb-2" />
        <div className="flex flex-1 flex-col items-center justify-center">
          {phase === "loading" ? (
            <ThinkingStatus />
          ) : (
            <AnalyzeErrorPanel
              type={errorType}
              onRetry={handleRetry}
              onChangePhoto={handleChangePhoto}
            />
          )}
        </div>
        <SiteFooter className="mt-8 shrink-0" />
      </main>
    </GradientBackground>
  );
}

function AnalyzingFallback() {
  return (
    <GradientBackground variant="minimal">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-12 safe-bottom sm:px-6">
        <PageTopRow className="mb-2" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <ThinkingStatus />
        </div>
        <SiteFooter className="mt-8 shrink-0" />
      </main>
    </GradientBackground>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={<AnalyzingFallback />}>
      <AnalyzingPageContent />
    </Suspense>
  );
}
