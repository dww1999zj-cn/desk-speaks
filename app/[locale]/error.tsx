"use client";

import { useEffect } from "react";
import { RELOAD_KEY } from "@/components/ui/ChunkLoadRecovery";

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
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-[#FFF8F5] px-6 py-12 text-center">
      <p className="text-4xl">🐮</p>
      <h1 className="mt-4 text-xl font-bold text-[#4A4458]">
        页面加载出了点问题
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#9B93A8]">
        Something went wrong loading this page.
        <br />
        若刚部署过，请刷新页面；微信内打开可点右上角在浏览器中打开。
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={handleReload}
          className="min-h-[44px] rounded-full bg-[#8B7CF6] px-6 py-3 text-sm font-medium text-white"
        >
          刷新页面 / Reload
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(RELOAD_KEY);
            reset();
          }}
          className="min-h-[44px] rounded-full border border-[#8B7CF6]/20 px-6 py-3 text-sm text-[#8B7CF6]"
        >
          重试 / Retry
        </button>
        <a
          href="/"
          className="text-sm text-[#9B93A8] underline-offset-2 hover:underline"
        >
          回到首页 / Home
        </a>
      </div>
    </main>
  );
}
