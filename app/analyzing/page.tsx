"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { ObservingText } from "@/components/analyzing/ObservingText";
import { STORAGE_KEYS } from "@/lib/report";
import type { DeskReport } from "@/lib/types";

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

    const analyze = async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });

        if (!res.ok) throw new Error("分析失败");

        const data = await res.json();
        const report: DeskReport = data.report ?? data;
        sessionStorage.setItem(STORAGE_KEYS.report, JSON.stringify(report));
        if (data.reportId) {
          sessionStorage.setItem(STORAGE_KEYS.reportId, data.reportId);
        }

        await new Promise((r) => setTimeout(r, 3000));
        router.replace("/report");
      } catch {
        alert("分析出了点问题，请稍后再试");
        router.replace("/upload");
      }
    };

    analyze();
  }, [router]);

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-primary/10">
          <span className="text-3xl animate-pulse-soft">🖥️</span>
        </div>

        <h1 className="text-xl font-semibold text-text">工位正在观察你…</h1>

        <div className="mt-8 w-full">
          <ObservingText />
        </div>

        <div className="mt-10 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary animate-pulse-soft"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </div>
      </main>
    </GradientBackground>
  );
}
