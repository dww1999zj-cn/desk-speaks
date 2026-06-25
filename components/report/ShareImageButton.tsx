"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeskReport } from "@/lib/types";
import { generateShareImage, saveShareImage } from "@/lib/share-image";
import { SHARE_CARD_COPY } from "@/lib/share-copy";
import { ShareImageSaveOverlay } from "./ShareImageSaveOverlay";

interface ShareImageButtonProps {
  report: DeskReport;
  deskThumb?: string | null;
  className?: string;
}

export function ShareImageButton({
  report,
  deskThumb,
  className = "",
}: ShareImageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closePreview = useCallback(() => {
    setPreviewUrl((url) => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await generateShareImage(report, deskThumb);
      await saveShareImage(blob, "工位人格.png", setPreviewUrl);
    } catch {
      alert("分享图生成失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }, [report, deskThumb, loading]);

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex min-h-[52px] w-full touch-manipulation select-none items-center justify-center rounded-full border-2 border-white/30 bg-primary px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary/25 transition-colors duration-200 active:bg-primary/90 disabled:opacity-60 ${className}`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {loading ? SHARE_CARD_COPY.savingButton : SHARE_CARD_COPY.saveButton}
      </button>

      {previewUrl && (
        <ShareImageSaveOverlay imageUrl={previewUrl} onClose={closePreview} />
      )}
    </>
  );
}
