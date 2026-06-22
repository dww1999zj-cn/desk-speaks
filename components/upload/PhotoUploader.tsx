"use client";

import { useCallback, useRef, useState } from "react";
import { compressImage } from "@/lib/image";

interface PhotoUploaderProps {
  onImageReady: (dataUrl: string) => void;
}

export function PhotoUploader({ onImageReady }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setLoading(true);
      try {
        const dataUrl = await compressImage(file);
        setPreview(dataUrl);
        onImageReady(dataUrl);
      } catch {
        alert("图片处理失败，请换一张试试");
      } finally {
        setLoading(false);
      }
    },
    [onImageReady]
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
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-primary/20 bg-white/60 hover:border-primary/40"
        }`}
      >
        {preview ? (
          <div className="relative h-full w-full p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="工位预览"
              className="mx-auto max-h-[240px] rounded-2xl object-contain"
            />
            <p className="mt-4 text-center text-sm text-muted">
              点击重新选择
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
              📷
            </div>
            <div>
              <p className="text-lg font-medium text-text">
                上传你的工位照片
              </p>
              <p className="mt-1 text-sm text-muted">
                点击选择或拖拽到此处
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80">
            <p className="text-sm text-muted animate-pulse-soft">处理中…</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
