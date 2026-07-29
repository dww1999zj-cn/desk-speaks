"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { RenovationResult } from "@/lib/renovation";
import {
  generateRenovationShareImage,
  saveShareImage,
  type RenovationShareCopy,
} from "@/lib/renovation-share-image";
import { ShareImageSaveOverlay } from "./ShareImageSaveOverlay";

interface RenovationShareButtonProps {
  renovation: RenovationResult;
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}

export function RenovationShareButton({
  renovation,
  beforeSrc,
  afterSrc,
  className = "",
}: RenovationShareButtonProps) {
  const locale = useLocale();
  const t = useTranslations("share.renovation");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const copy: RenovationShareCopy = useMemo(
    () => ({
      badge: t("badge"),
      beforeLabel: t("beforeLabel"),
      afterLabel: t("afterLabel"),
      qrTitle: t("qrTitle"),
      imageFooter: t("imageFooter", { footer: tCommon("footer") }),
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
      const blob = await generateRenovationShareImage(
        renovation,
        beforeSrc,
        afterSrc,
        copy,
        locale
      );
      await saveShareImage(blob, copy.filename, setPreviewUrl);
    } catch {
      alert(t("generateError"));
    } finally {
      setLoading(false);
    }
  }, [renovation, beforeSrc, afterSrc, loading, copy, locale, t]);

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex min-h-[52px] w-full touch-manipulation select-none items-center justify-center rounded-2xl bg-text px-6 py-4 text-base font-semibold text-white shadow-lg shadow-text/15 transition active:scale-[0.99] disabled:opacity-60 ${className}`}
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
