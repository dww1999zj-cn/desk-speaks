"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ObservingText } from "@/components/analyzing/ObservingText";
import { STORAGE_KEYS } from "@/lib/report";
import type { DeskReport } from "@/lib/types";

const MIN_DISPLAY_MS = 1500;
const ANALYZE_TIMEOUT_MS = 90000;

export default function AnalyzingPage() {
  const router = useRouter();
  const started = useRef(false);
  const [status, setStatus] = useState("正在上传照片…");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const image = sessionStorage.getItem(STORAGE_KEYS.image);
    if (!image) {
      router.replace("/upload");
      return;
    }

    const analyze = async () => {
      const startAt = Date.now();

      try {
        setStatus("工位正在看你…");

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

        setStatus("正在整理你的人格档案…");

        const data = await res.json();
        const report: DeskReport = data.report ?? data;
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        if (data.reportId) {
          sessionStorage.setItem(STORAGE_KEYS.reportId, data.reportId);
        }

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
            ? "分析超时了，请换张更小的照片或稍后再试"
            : "分析出了点问题，请稍后再试"
        );
        router.replace("/upload");
      }
    };

    analyze();
  }, [router]);

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-primary/10">
          <span className="text-3xl animate-pulse-soft">🪞</span>
        </div>

        <h1 className="text-xl font-semibold text-text">工位正在认你…</h1>
        <p className="mt-2 text-sm text-muted">{status}</p>

        <div className="mt-8 w-full">
          <ObservingText />
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          首次分析约需 15–30 秒，请耐心等待
        </p>
      </main>
    </GradientBackground>
  );
}
