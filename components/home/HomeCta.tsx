"use client";

import Link from "next/link";

export function HomeCta() {
  return (
    <Link
      href="/upload"
      prefetch
      className="inline-flex min-h-[52px] w-full touch-manipulation select-none items-center justify-center rounded-full border-2 border-white/30 bg-primary px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary/25 transition-colors duration-200 active:bg-primary/90"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      拍张工位照，开始猜我 🐮
    </Link>
  );
}
