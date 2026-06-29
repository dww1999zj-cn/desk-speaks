"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/upload/PhotoUploader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { STORAGE_KEYS } from "@/lib/report";

type CompressedImages = { full: string; thumb: string };

function persistImages(images: CompressedImages) {
  sessionStorage.setItem(STORAGE_KEYS.image, images.full);
  sessionStorage.setItem(STORAGE_KEYS.imageThumb, images.thumb);
}

export default function UploadPage() {
  const router = useRouter();
  const t = useTranslations("upload");
  const tCommon = useTranslations("common");
  const [images, setImages] = useState<CompressedImages | null>(null);
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
        setStored(true);
      } catch {
        setStored(false);
      }
    }, 0);
  }, []);

  const handleAnalyze = () => {
    if (!images || submitting) return;

    setSubmitting(true);

    const go = () => router.push("/analyzing");

    if (stored) {
      go();
      return;
    }

    window.setTimeout(() => {
      try {
        persistImages(images);
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
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <header>
          <PageTopRow
            className="mb-6"
            left={
              <button
                onClick={() => router.back()}
                className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-muted shadow-sm hover:text-text"
              >
                {tCommon("back")}
              </button>
            }
          />
          <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-text">
            {t("badge")}
          </p>
          <h1 className="text-2xl font-bold text-text">{t("title")}</h1>
          <p className="mt-2 leading-relaxed text-muted">{t("subtitle")}</p>
        </header>

        <section className="mt-8 flex-1">
          <PhotoUploader onImageReady={handleImageReady} />
        </section>

        <footer className="mt-8">
          <Button
            size="lg"
            className="w-full"
            disabled={!images || submitting || (Boolean(images) && !stored && !submitting)}
            onClick={handleAnalyze}
          >
            {buttonLabel}
          </Button>
          <SiteFooter className="mt-4" />
        </footer>
      </main>
    </GradientBackground>
  );
}
