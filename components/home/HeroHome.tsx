"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { useEffect, useMemo, useState } from "react";

interface GenerationStats {
  displayCount: number;
}

const SAMPLE_SALARIES = ["约6k", "约1.5万", "约2.3万", "约9k"] as const;

export function HeroHome() {
  const t = useTranslations("hub");
  const trustItems = t.raw("trustItems") as string[];
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [salaryIndex, setSalaryIndex] = useState(0);

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setSalaryIndex((i) => (i + 1) % SAMPLE_SALARIES.length);
    }, 2200);
    return () => window.clearInterval(id);
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
    <GradientBackground variant="immersive">
      <div className="pointer-events-none absolute inset-x-5 top-[max(0.75rem,env(safe-area-inset-top))] z-20 sm:inset-x-6">
        <div className="pointer-events-auto">
          <PageTopRow
            left={
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90">
                {t("badge")}
              </span>
            }
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 safe-bottom sm:px-6">
        <header>
          <p className="text-sm font-medium tracking-[0.18em] text-wood">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[3rem]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-[22rem] text-[15px] leading-relaxed text-white/70">
            {t("subtitle")}
          </p>
        </header>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] px-5 py-4">
          <p className="text-[11px] font-medium tracking-widest text-white/45">
            {t("teaseLabel")}
          </p>
          <p
            key={SAMPLE_SALARIES[salaryIndex]}
            className="mt-1.5 font-display text-4xl font-semibold tracking-tight text-plant sm:text-5xl"
          >
            {SAMPLE_SALARIES[salaryIndex]}
          </p>
          <p className="mt-1.5 text-sm text-white/55">{t("teaseHint")}</p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {trustLines.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-[11px] text-white/50"
            >
              <span className="h-1 w-1 rounded-full bg-plant" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <section className="mt-6">
          <Link
            href="/persona/upload"
            prefetch
            className="flex w-full items-center justify-center rounded-2xl bg-plant px-6 py-4 text-base font-semibold text-white shadow-lg shadow-plant/30 transition active:scale-[0.99]"
          >
            {t("cta")}
          </Link>
          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-white/40">
            {t("disclaimer")}
          </p>
        </section>

        <footer className="mt-6">
          <SiteFooter className="text-white/40" />
        </footer>
      </main>
    </GradientBackground>
  );
}
