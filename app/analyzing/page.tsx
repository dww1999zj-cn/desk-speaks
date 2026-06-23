"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ThinkingStatus } from "@/components/analyzing/ThinkingStatus";
import { STORAGE_KEYS } from "@/lib/report";
import type { DeskReport } from "@/lib/types";

const MIN_DISPLAY_MS = 800;
const ANALYZE_TIMEOUT_MS = 90000;

export default function AnalyzingPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const image = sessionStorage.getItem(STORAGE_KEYS.image);
    if (!image) {
      router.replace("/upload");
      return;
    }

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

        if (!res.ok) throw new Error("分析失败");

        const data = await res.json();
        const report: DeskReport = data.report ?? data;
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        sessionStorage.removeItem(STORAGE_KEYS.image);

        const elapsed = Date.now() - startAt;
        if (elapsed < MIN_DISPLAY_MS) {
          await new Promise((r) => setTimeout(r, MIN_DISPLAY_MS - elapsed));
        }

        router.replace("/report");
      } catch (err) {
        const isTimeout =
          err instanceof Error && err.name === "AbortError";
        alert(
          isTimeout
            ? "通义同学加班超时了，换张小图或稍后再试"
            : "牛马今天有点懵，请稍后再试"
        );
        router.replace("/upload");
      }
    };

    analyze();
  }, [router]);

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        <ThinkingStatus />
      </main>
    </GradientBackground>
  );
}
