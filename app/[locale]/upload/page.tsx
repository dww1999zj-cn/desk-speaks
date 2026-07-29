"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/upload/PhotoUploader";
import { StylePicker } from "@/components/upload/StylePicker";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { STORAGE_KEYS } from "@/lib/report";
import {
  DEFAULT_DESK_STYLE,
  type DeskStyleId,
} from "@/lib/renovation/desk-styles";

type CompressedImages = { full: string; thumb: string };

function persistImages(images: CompressedImages) {
  sessionStorage.setItem(STORAGE_KEYS.image, images.full);
  sessionStorage.setItem(STORAGE_KEYS.imageThumb, images.thumb);
  sessionStorage.setItem(STORAGE_KEYS.product, "renovation");
  sessionStorage.removeItem(STORAGE_KEYS.report);
}

export default function UploadPage() {
  const router = useRouter();
  const t = useTranslations("upload");
  const tCommon = useTranslations("common");
  const [images, setImages] = useState<CompressedImages | null>(null);
  const [deskStyle, setDeskStyle] = useState<DeskStyleId>(DEFAULT_DESK_STYLE);
  const [stored, setStored] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageReady = useCallback((next: CompressedImages) => {
    setImages(next);
    setStored(false);
    setSubmitting(false);

    // 大图写 sessionStorage 会阻塞主线程，提前在后台写入，点击按钮可立即跳转
    window.setTimeout(() => {
      try {
        persistImages(next);
        sessionStorage.setItem(STORAGE_KEYS.deskStyle, deskStyle);
        setStored(true);
      } catch {
        setStored(false);
      }
    }, 0);
  }, [deskStyle]);

  const handleStyleChange = (style: DeskStyleId) => {
    setDeskStyle(style);
    sessionStorage.setItem(STORAGE_KEYS.deskStyle, style);
  };

  const handleAnalyze = () => {
    if (!images || submitting) return;

    setSubmitting(true);

    const go = () => router.push("/analyzing");

    if (stored) {
      sessionStorage.setItem(STORAGE_KEYS.deskStyle, deskStyle);
      go();
      return;
    }

    window.setTimeout(() => {
      try {
        persistImages(images);
        sessionStorage.setItem(STORAGE_KEYS.deskStyle, deskStyle);
        go();
      } catch {
        setSubmitting(false);
      }
    }, 0);
  };

  const buttonLabel = submitting
    ? t("submitting")
    : images && !stored
      ? t("preparing")
      : t("submit");

  return (
    <GradientBackground variant="minimal">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10 safe-bottom sm:px-6 sm:py-12">
        <header>
          <PageTopRow
            className="mb-8"
            left={
              <Link
                href="/"
                className="text-sm text-muted transition hover:text-text"
              >
                {tCommon("back")}
              </Link>
            }
          />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-plant">
            {t("badge")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">{t("title")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("subtitle")}</p>
        </header>

        <section className="mt-6 flex-1">
          <PhotoUploader onImageReady={handleImageReady} />
          <StylePicker value={deskStyle} onChange={handleStyleChange} />
        </section>

        <footer className="mt-10">
          <Button
            size="lg"
            className="w-full rounded-2xl shadow-md"
            disabled={!images || submitting || (Boolean(images) && !stored && !submitting)}
            onClick={handleAnalyze}
          >
            {buttonLabel}
          </Button>
          <SiteFooter className="mt-6" />
        </footer>
      </main>
    </GradientBackground>
  );
}
