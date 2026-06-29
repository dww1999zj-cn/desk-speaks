"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DeskReport } from "@/lib/types";
import {
  generateShareImage,
  saveShareImage,
  type ShareImageCopy,
} from "@/lib/share-image";
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
  const locale = useLocale();
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const copy: ShareImageCopy = useMemo(
    () => ({
      certBadge: t("certBadge"),
      title: t("title"),
      ageGuessLabel: t("ageGuessLabel"),
      qrTitle: t("qrTitle"),
      imageFooter: t("imageFooter", { footer: tCommon("footer") }),
      stampLine1: t("stampLine1"),
      stampLine2: t("stampLine2"),
      filename: t("filename"),
    }),
    [t, tCommon]
  );

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
      const blob = await generateShareImage(report, deskThumb, copy, locale);
      await saveShareImage(blob, copy.filename, setPreviewUrl);
    } catch {
      alert(t("generateError"));
    } finally {
      setLoading(false);
    }
  }, [report, deskThumb, loading, copy, locale, t]);

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex min-h-[52px] w-full touch-manipulation select-none items-center justify-center rounded-full border-2 border-white/30 bg-primary px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary/25 transition-colors duration-200 active:bg-primary/90 disabled:opacity-60 ${className}`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {loading ? t("savingButton") : t("saveButton")}
      </button>

      {previewUrl && (
        <ShareImageSaveOverlay imageUrl={previewUrl} onClose={closePreview} />
      )}
    </>
  );
}
