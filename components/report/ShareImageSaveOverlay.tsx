"use client";

import { useEffect } from "react";
import { isWeChatBrowser } from "@/lib/share-image";
import { SHARE_CARD_COPY } from "@/lib/share-copy";

interface ShareImageSaveOverlayProps {
  imageUrl: string;
  onClose: () => void;
}

export function ShareImageSaveOverlay({
  imageUrl,
  onClose,
}: ShareImageSaveOverlayProps) {
  const inWeChat = isWeChatBrowser();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 px-4 pb-8 pt-12 safe-bottom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="保存鉴定卡"
    >
      <p className="mb-2 text-center text-sm font-medium text-white">
        {SHARE_CARD_COPY.savePreviewHint}
      </p>
      {inWeChat && (
        <p className="mb-4 text-center text-xs leading-relaxed text-white/70">
          {SHARE_CARD_COPY.saveWeChatHint}
        </p>
      )}
      <div
        className="mx-auto w-full max-w-sm flex-1 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="工位鉴定卡"
          className="w-full rounded-2xl shadow-2xl"
          style={{
            WebkitTouchCallout: "default",
            WebkitUserSelect: "auto",
            userSelect: "auto",
          }}
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-full bg-white/15 py-3 text-sm text-white"
      >
        关闭
      </button>
    </div>
  );
}
