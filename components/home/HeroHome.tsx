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
      <div className="pointer-events-none absolute inset-x-5 top-[max(1rem,env(safe-area-inset-top))] z-20 sm:inset-x-6">
        <div className="pointer-events-auto">
          <PageTopRow
            left={
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
                {t("badge")}
              </span>
            }
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20 safe-bottom sm:px-6">
        <header className="animate-fade-in-up">
          <p className="text-sm font-medium tracking-[0.18em] text-wood">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[3.1rem]">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-white/70">
            {t("subtitle")}
          </p>
        </header>

        <div
          className="mt-8 animate-fade-in-up rounded-[1.75rem] border border-white/10 bg-white/[0.07] px-5 py-5 backdrop-blur-md"
          style={{ animationDelay: "120ms", animationFillMode: "both" }}
        >
          <p className="text-[11px] font-medium tracking-widest text-white/45">
            {t("teaseLabel")}
          </p>
          <p
            key={SAMPLE_SALARIES[salaryIndex]}
            className="mt-2 font-display text-5xl font-semibold tracking-tight text-plant animate-fade-in"
          >
            {SAMPLE_SALARIES[salaryIndex]}
          </p>
          <p className="mt-2 text-sm text-white/55">{t("teaseHint")}</p>
        </div>

        <ul
          className="mt-5 flex flex-wrap gap-x-4 gap-y-2 animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
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

        <section
          className="mt-7 animate-fade-in-up"
          style={{ animationDelay: "280ms", animationFillMode: "both" }}
        >
          <Link
            href="/persona/upload"
            prefetch
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-plant px-6 py-4 text-base font-semibold text-white shadow-lg shadow-plant/30 transition active:scale-[0.99]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">{t("cta")}</span>
          </Link>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/40">
            {t("disclaimer")}
          </p>
        </section>

        <footer className="mt-8">
          <SiteFooter className="text-white/40" />
        </footer>
      </main>
    </GradientBackground>
  );
}
