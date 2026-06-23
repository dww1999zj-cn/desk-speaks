"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/upload/PhotoUploader";
import { STORAGE_KEYS } from "@/lib/report";

export default function UploadPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!image) return;
    sessionStorage.setItem(STORAGE_KEYS.image, image);
    router.push("/analyzing");
  };

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <header>
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm text-muted hover:text-text"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-semibold text-text">拍张工位照</h1>
          <p className="mt-2 leading-relaxed text-muted">
            不用摆拍，真实的最好。剩下的交给工位。
          </p>
        </header>

        <section className="mt-8 flex-1">
          <PhotoUploader onImageReady={setImage} />
        </section>

        <footer className="mt-8">
          <Button
            size="lg"
            className="w-full"
            disabled={!image}
            onClick={handleAnalyze}
          >
            就这张，猜吧
          </Button>
        </footer>
      </main>
    </GradientBackground>
  );
}
