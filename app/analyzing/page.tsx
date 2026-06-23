"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ObservingText } from "@/components/analyzing/ObservingText";
import {
  AnalyzeProgress,
  getSimulatedProgress,
} from "@/components/analyzing/AnalyzeProgress";
import { STORAGE_KEYS } from "@/lib/report";
import type { DeskReport } from "@/lib/types";

const MIN_DISPLAY_MS = 1200;
const ANALYZE_TIMEOUT_MS = 90000;

export default function AnalyzingPage() {
  const router = useRouter();
  const started = useRef(false);
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const image = sessionStorage.getItem(STORAGE_KEYS.image);
    if (!image) {
      router.replace("/upload");
      return;
    }

    const startAt = Date.now();

    const progressTimer = setInterval(() => {
      if (doneRef.current) return;
      setProgress(getSimulatedProgress(Date.now() - startAt));
    }, 300);

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

        if (!res.ok) throw new Error("分析失败");

        const data = await res.json();
        const report: DeskReport = data.report ?? data;
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        sessionStorage.removeItem(STORAGE_KEYS.image);

        doneRef.current = true;
        setProgress(100);

        const elapsed = Date.now() - startAt;
        if (elapsed < MIN_DISPLAY_MS) {
          await new Promise((r) => setTimeout(r, MIN_DISPLAY_MS - elapsed));
        }

        await new Promise((r) => setTimeout(r, 400));
        router.replace("/report");
      } catch (err) {
        const isTimeout =
          err instanceof Error && err.name === "AbortError";
        alert(
          isTimeout
            ? "分析超时了，请换张更小的照片或稍后再试"
            : "分析出了点问题，请稍后再试"
        );
        router.replace("/upload");
      } finally {
        clearInterval(progressTimer);
      }
    };

    analyze();

    return () => clearInterval(progressTimer);
  }, [router]);

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm shadow-primary/5">
          <span className="text-2xl animate-pulse-soft">🪞</span>
        </div>

        <div className="w-full flex-1">
          <ObservingText />
        </div>

        <div className="mt-12 w-full max-w-xs">
          <AnalyzeProgress progress={progress} />
        </div>

        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse-soft"
              style={{ animationDelay: `${i * 400}ms` }}
            />
          ))}
        </div>
      </main>
    </GradientBackground>
  );
}
