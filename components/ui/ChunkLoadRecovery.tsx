"use client";

import { useEffect } from "react";

const RELOAD_KEY = "desk-speaks-chunk-reload";

function isChunkLoadError(message: string): boolean {
  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module")
  );
}

/** 部署后旧缓存 chunk 失效时自动刷新一次 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.message ?? "";
      if (!isChunkLoadError(message)) return;
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return null;
}

export { RELOAD_KEY };
