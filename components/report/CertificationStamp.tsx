"use client";

import { useLocale, useTranslations } from "next-intl";

export function CertificationStamp({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("share");
  const date = new Date()
    .toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <div className="animate-stamp-in relative flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full border-[3px] border-plant/70 bg-white/90 shadow-md shadow-plant/20">
        <div className="absolute inset-1 rounded-full border border-dashed border-plant/40" />
        <span className="relative text-[9px] font-bold tracking-wider text-plant">
          {t("stampLine1")}
        </span>
        <span className="relative text-sm font-bold text-plant">{t("stampLine2")}</span>
        <span className="relative mt-0.5 text-[8px] text-muted">{date}</span>
      </div>
    </div>
  );
}
