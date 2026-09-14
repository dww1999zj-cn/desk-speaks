"use client";

import { useEffect } from "react";
import { RELOAD_KEY } from "@/components/ui/ChunkLoadRecovery";
import { GradientBackground } from "@/components/ui/GradientBackground";

function isChunkLoadError(error: Error): boolean {
  const message = error.message ?? "";
  return (
    error.name === "ChunkLoadError" ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module")
  );
}

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (!isChunkLoadError(error)) return;
    if (sessionStorage.getItem(RELOAD_KEY)) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  }, [error]);

  const handleReload = () => {
    sessionStorage.removeItem(RELOAD_KEY);
    window.location.reload();
  };

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-4xl">🐮</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-white">
          页面加载出了点问题
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Something went wrong loading this page.
          <br />
          若刚部署过，请刷新页面；微信内打开可点右上角在浏览器中打开。
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="min-h-[44px] rounded-xl bg-plant px-6 py-3 text-sm font-medium text-white shadow-lg shadow-plant/25"
          >
            刷新页面 / Reload
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(RELOAD_KEY);
              reset();
            }}
            className="min-h-[44px] rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm text-white/80"
          >
            重试 / Retry
          </button>
          <a
            href="/"
            className="text-sm text-white/45 underline-offset-2 hover:underline"
          >
            回到首页 / Home
          </a>
        </div>
      </main>
    </GradientBackground>
  );
}
