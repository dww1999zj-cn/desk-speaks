"use client";

import { useCallback, useRef, useState } from "react";
import { compressImageForUpload } from "@/lib/image";

interface PhotoUploaderProps {
  onImageReady: (images: { full: string; thumb: string }) => void;
}

export function PhotoUploader({ onImageReady }: PhotoUploaderProps) {
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
        alert("图片处理失败，请换一张试试");
      } finally {
        setLoading(false);
      }
    },
    [onImageReady]
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
        className={`relative flex min-h-[240px] flex-col items-center justify-center rounded-[2rem] border-[3px] border-dashed transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-secondary/50 bg-white/70"
        }`}
      >
        {preview ? (
          <div className="relative h-full w-full p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="工位预览"
              className="mx-auto max-h-[200px] rounded-2xl object-contain"
            />
            <p className="mt-4 text-center text-sm text-muted">
              可以重新选择照片
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/40 text-2xl">
              📷
            </div>
            <p className="text-lg font-bold text-text">上传无意识自画像</p>
            <p className="text-sm text-muted">从相册选，或现场拍一张工位</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80">
            <p className="text-sm text-muted animate-pulse-soft">处理中…</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={loading}
          className="rounded-2xl border-2 border-white bg-white px-4 py-3.5 text-sm font-medium text-text shadow-sm transition-colors active:bg-primary/5 disabled:opacity-50"
        >
          从相册选择
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="rounded-2xl border-2 border-white bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors active:bg-primary/90 disabled:opacity-50"
        >
          拍照上传
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
