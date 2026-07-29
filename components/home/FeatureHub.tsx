"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function FeatureHub() {
  const t = useTranslations("hub");

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-medium text-muted">{t("featuresTitle")}</p>

      <Link
        href="/upload"
        prefetch
        className="group relative block rounded-[1.75rem] border-[3px] border-primary bg-white p-5 shadow-lg shadow-primary/20 transition active:scale-[0.99]"
      >
        <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          {t("renovate.badge")}
        </span>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
            ✨
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-text">{t("renovate.title")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t("renovate.desc")}</p>
            <p className="mt-3 text-sm font-semibold text-primary group-hover:underline">
              {t("renovate.cta")} →
            </p>
          </div>
        </div>
      </Link>

      <Link
        href="/persona/upload"
        prefetch
        className="group block rounded-[1.75rem] border-2 border-white bg-white/85 p-5 shadow-md shadow-secondary/15 transition hover:border-secondary/40 active:scale-[0.99]"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/30 text-2xl">
            🐮
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-text">{t("persona.title")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t("persona.desc")}</p>
            <p className="mt-3 text-sm font-semibold text-text/80 group-hover:text-primary group-hover:underline">
              {t("persona.cta")} →
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
