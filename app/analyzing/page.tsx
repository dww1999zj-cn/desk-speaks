"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ThinkingStatus } from "@/components/analyzing/ThinkingStatus";
import {
  AnalyzeErrorPanel,
  type AnalyzeErrorType,
} from "@/components/analyzing/AnalyzeErrorPanel";
import { STORAGE_KEYS } from "@/lib/report";
import type { DeskReport } from "@/lib/types";

const MIN_DISPLAY_MS = 800;
const ANALYZE_TIMEOUT_MS = 90000;

type Phase = "loading" | "error";

function parsePreviewError(
  value: string | null
): AnalyzeErrorType | null {
  if (value === "failed" || value === "error") return "failed";
  if (value === "timeout") return "timeout";
  return null;
}

function AnalyzingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewError = parsePreviewError(searchParams.get("preview"));

  const [phase, setPhase] = useState<Phase>(
    previewError ? "error" : "loading"
  );
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

    const analyze = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (cancelled) return;

        if (!res.ok) throw new Error("分析失败");

        const data = await res.json();
        const report: DeskReport = data.report ?? data;
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        sessionStorage.removeItem(STORAGE_KEYS.image);

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
  }, [router, attempt, previewError]);

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
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        {phase === "loading" ? (
          <ThinkingStatus />
        ) : (
          <AnalyzeErrorPanel
            type={errorType}
            onRetry={handleRetry}
            onChangePhoto={handleChangePhoto}
          />
        )}
      </main>
    </GradientBackground>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense
      fallback={
        <GradientBackground>
          <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
            <ThinkingStatus />
          </main>
        </GradientBackground>
      }
    >
      <AnalyzingPageContent />
    </Suspense>
  );
}
