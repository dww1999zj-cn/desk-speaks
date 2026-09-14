"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { OfficePickCard } from "@/components/recommend/OfficePickCard";
import { getOfficePickCatalog, isOfficePicksEnabled } from "@/lib/office-picks";
import { isAppLocale } from "@/lib/i18n/locale";

export default function RecommendPage() {
  const router = useRouter();
  const locale = useLocale();
  const appLocale = isAppLocale(locale) ? locale : "zh";
  const t = useTranslations("recommend");
  const tCommon = useTranslations("common");
  const enabled = isOfficePicksEnabled(appLocale);
  const catalog = getOfficePickCatalog(appLocale);

  useEffect(() => {
    if (!enabled) router.replace("/");
  }, [enabled, router]);

  if (!enabled) return null;

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10 safe-bottom">
        <header>
          <PageTopRow
            className="mb-6"
            left={
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm hover:text-white"
              >
                {tCommon("back")}
              </button>
            }
          />
          <p className="mb-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            {t("badge")}
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">{t("title")}</h1>
          <p className="mt-2 leading-relaxed text-white/60">{t("subtitle")}</p>
        </header>

        <div className="mt-6 space-y-8 flex-1">
          {catalog.categories.map((category) => {
            const picks = catalog.picks.filter((pick) => pick.category === category);
            if (picks.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-primary">
                  {category}
                </h2>
                <div className="space-y-3">
                  {picks.map((pick) => (
                    <OfficePickCard key={pick.id} pick={pick} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-white/60 px-4 py-3 text-center text-xs leading-relaxed text-muted">
          {t("disclosure")}
        </div>

        <SiteFooter className="mt-6 text-white/40" />
      </main>
    </GradientBackground>
  );
}
