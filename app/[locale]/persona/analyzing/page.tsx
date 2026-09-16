"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { STORAGE_KEYS, normalizeReport } from "@/lib/report";
import type { AppLocale } from "@/lib/i18n/locale";
import { isAppLocale } from "@/lib/i18n/locale";

const MIN_DISPLAY_MS = 800;
/** Hard client ceiling — do not spin forever on flaky mobile WebViews */
const ANALYZE_TIMEOUT_MS = 75_000;
const SLOW_HINT_MS = 20_000;

type Phase = "loading" | "error";

function parsePreviewError(value: string | null): AnalyzeErrorType | null {
  if (value === "failed" || value === "error") return "failed";
  if (value === "timeout") return "timeout";
  if (value === "not_desk") return "not_desk";
  return null;
}

function PersonaAnalyzingContent() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("analyzing.persona");
  const searchParams = useSearchParams();
  const previewError = parsePreviewError(searchParams.get("preview"));

  const [phase, setPhase] = useState<Phase>(previewError ? "error" : "loading");
  const [errorType, setErrorType] = useState<AnalyzeErrorType>(
    previewError ?? "failed"
  );
  const [attempt, setAttempt] = useState(0);
  const [slowHint, setSlowHint] = useState(false);

  useEffect(() => {
    if (previewError) return;

    const image = sessionStorage.getItem(STORAGE_KEYS.image);
    if (!image) {
      router.replace("/persona/upload");
      return;
    }

    let cancelled = false;
    setPhase("loading");
    setSlowHint(false);
    const startAt = Date.now();
    const requestLocale: AppLocale = isAppLocale(locale) ? locale : "zh";

    const slowTimer = window.setTimeout(() => {
      if (!cancelled) setSlowHint(true);
    }, SLOW_HINT_MS);

    const analyze = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

      try {
        const fetchPromise = fetch("/api/persona/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, locale: requestLocale }),
          signal: controller.signal,
        });

        // Backup race: some WebViews ignore AbortSignal on large POSTs
        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            const err = new Error("analyze timeout");
            err.name = "AbortError";
            reject(err);
          }, ANALYZE_TIMEOUT_MS + 500);
        });

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        window.clearTimeout(timeout);
        if (cancelled) return;

        if (res.status === 422) {
          const data = await res.json().catch(() => ({}));
          if (data.error === "not_desk") {
            setErrorType("not_desk");
            setPhase("error");
            return;
          }
        }

        if (!res.ok) throw new Error("analyze failed");

        const data = await res.json();
        const report = normalizeReport(data.report ?? data, requestLocale);
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        sessionStorage.setItem(STORAGE_KEYS.locale, requestLocale);
        sessionStorage.setItem(STORAGE_KEYS.product, "persona");
        sessionStorage.removeItem(STORAGE_KEYS.renovation);

        const elapsed = Date.now() - startAt;
        if (elapsed < MIN_DISPLAY_MS) {
          await new Promise((r) => setTimeout(r, MIN_DISPLAY_MS - elapsed));
        }
        if (cancelled) return;

        router.replace("/persona/report");
      } catch (err) {
        window.clearTimeout(timeout);
        if (cancelled) return;
        const isTimeout =
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("timeout"));
        setErrorType(isTimeout ? "timeout" : "failed");
        setPhase("error");
      }
    };

    analyze();

    return () => {
      cancelled = true;
      window.clearTimeout(slowTimer);
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
    router.replace("/persona/upload");
  }, [router]);

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <PageTopRow className="mb-2" />
        <div className="flex flex-1 flex-col items-center justify-center">
          {phase === "loading" ? (
            <>
              <ThinkingStatus mode="persona" />
              {slowHint ? (
                <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-white/45">
                  {t("slowHint")}
                </p>
              ) : null}
            </>
          ) : (
            <AnalyzeErrorPanel
              type={errorType}
              onRetry={handleRetry}
              onChangePhoto={handleChangePhoto}
            />
          )}
        </div>
        <SiteFooter className="mt-8 shrink-0 text-white/40" />
      </main>
    </GradientBackground>
  );
}

function PersonaAnalyzingFallback() {
  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <PageTopRow className="mb-2" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <ThinkingStatus mode="persona" />
        </div>
        <SiteFooter className="mt-8 shrink-0 text-white/40" />
      </main>
    </GradientBackground>
  );
}

export default function PersonaAnalyzingPage() {
  return (
    <Suspense fallback={<PersonaAnalyzingFallback />}>
      <PersonaAnalyzingContent />
    </Suspense>
  );
}
