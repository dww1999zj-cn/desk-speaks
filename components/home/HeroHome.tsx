"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { DeskShowcaseCompare } from "@/components/marketing/DeskShowcaseCompare";
import { useEffect, useMemo, useState } from "react";

interface GenerationStats {
  displayCount: number;
}

export function HeroHome() {
  const t = useTranslations("hub");
  const trustItems = t.raw("trustItems") as string[];
  const [displayCount, setDisplayCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GenerationStats | null) => {
        if (data?.displayCount && data.displayCount > 0) {
          setDisplayCount(data.displayCount);
        }
      })
      .catch(() => {});
  }, []);

  const trustLines = useMemo(() => {
    return trustItems.map((item, index) => {
      if (index === 0 && displayCount !== null) {
        return t("trustGeneration", {
          count: displayCount.toLocaleString(),
        });
      }
      return item;
    });
  }, [trustItems, displayCount, t]);

  return (
    <div className="relative min-h-dvh bg-soft-gradient">
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-plant/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-32 h-64 w-64 rounded-full bg-wood/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-ai-glow opacity-[0.35]" />

      <div className="pointer-events-none absolute inset-x-5 top-[max(1rem,env(safe-area-inset-top))] z-20 sm:inset-x-6">
        <div className="pointer-events-auto">
          <PageTopRow
            left={
              <span className="rounded-full border border-plant/20 bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wide text-plant backdrop-blur-sm">
                {t("badge")}
              </span>
            }
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 safe-bottom sm:px-6">
        <DeskShowcaseCompare variant="hero" />

        <header className="mt-8">
          <h1 className="text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-text">
            {t("title")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("subtitle")}</p>
        </header>

        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {trustLines.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-[11px] text-muted"
            >
              <span className="h-1 w-1 rounded-full bg-plant" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <section className="mt-8">
          <Link
            href="/upload"
            prefetch
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-text px-6 py-4 text-base font-semibold text-white shadow-lg shadow-text/15 transition active:scale-[0.99]"
          >
            <span className="absolute inset-0 bg-ai-glow opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            <span className="relative">{t("cta")}</span>
          </Link>
          <p className="mt-4 text-center">
            <Link
              href="/persona/upload"
              prefetch
              className="text-xs text-muted underline-offset-2 transition hover:text-text hover:underline"
            >
              {t("personaLink")}
            </Link>
          </p>
        </section>

        <footer className="mt-8">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
