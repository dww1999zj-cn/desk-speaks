"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compressImageForUpload } from "@/lib/image";

interface PhotoUploaderProps {
  onImageReady: (images: { full: string; thumb: string }) => void;
  i18nNamespace?: "upload" | "personaUpload";
}

export function PhotoUploader({ onImageReady, i18nNamespace = "upload" }: PhotoUploaderProps) {
  const t = useTranslations(i18nNamespace);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setLoading(true);
      try {
        const images = await compressImageForUpload(file);
        setPreview(images.thumb);
        onImageReady(images);
      } catch {
        alert(t("imageError"));
      } finally {
        setLoading(false);
      }
    },
    [onImageReady, t]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted/30 bg-surface/80"
        }`}
      >
        {preview ? (
          <div className="relative h-full w-full p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={t("previewAlt")}
              className="mx-auto max-h-[200px] rounded-2xl object-contain"
            />
            <p className="mt-4 text-center text-sm text-muted">{t("reselect")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-light text-muted ring-1 ring-black/5">
              +
            </div>
            <p className="text-base font-medium text-text">{t("dropTitle")}</p>
            <p className="text-sm text-muted">{t("dropHint")}</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80">
            <p className="text-sm text-muted animate-pulse-soft">{t("processing")}</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={loading}
          className="rounded-xl border border-black/5 bg-white px-4 py-3.5 text-sm font-medium text-text transition-colors active:bg-surface disabled:opacity-50"
        >
          {t("gallery")}
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="rounded-xl bg-text px-4 py-3.5 text-sm font-medium text-white transition-colors active:bg-text/90 disabled:opacity-50"
        >
          {t("camera")}
        </button>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
