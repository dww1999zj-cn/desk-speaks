"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DeskReport, ReportCardData } from "@/lib/types";
import { isOfficePicksEnabled } from "@/lib/office-picks";
import { isAppLocale } from "@/lib/i18n/locale";
import { SharePreviewCard } from "./SharePreviewCard";

interface ReportCardProps {
  data: ReportCardData;
  index: number;
  report?: DeskReport;
  deskThumb?: string | null;
  onGoNext?: () => void;
}

function CardWrapper({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: string;
}) {
  return (
    <div
      className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}

function KeywordTags({ keywords }: { keywords?: string[] }) {
  if (!keywords?.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <span
          key={kw}
          className="rounded-full bg-secondary/25 px-4 py-2 text-sm font-medium text-primary"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}

function DeskEvidenceList({ items }: { items?: string[] }) {
  const t = useTranslations("report.cards");

  if (!items?.length) return null;
  return (
    <div className="mt-6 rounded-2xl border border-primary/10 bg-white/60 px-4 py-4">
      <p className="mb-3 text-xs font-semibold text-primary">{t("evidenceTitle")}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm leading-relaxed text-text before:mr-1.5 before:content-['🐮']"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportCard({
  data,
  index,
  report,
  deskThumb,
  onGoNext,
}: ReportCardProps) {
  const t = useTranslations("report.cards");
  const locale = useLocale();
  const showOfficePicks = isOfficePicksEnabled(isAppLocale(locale) ? locale : "zh");
  const delay = `${index * 80}ms`;

  if (data.type === "intro") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("introLayer")}
        </p>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">
          {data.content}
        </p>
        <div className="mt-6 rounded-2xl bg-primary/5 px-5 py-5 text-center">
          <p className="text-sm text-muted">{t("guessLabel")}</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-primary">
            {data.guessedAge}
          </p>
        </div>
        <DeskEvidenceList items={data.deskEvidence} />
      </CardWrapper>
    );
  }

  if (data.type === "mbti") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("mbtiLayer")}
        </p>
        {data.subtitle && (
          <p className="mb-3 text-xs text-muted">{data.subtitle}</p>
        )}
        <p className="text-4xl font-semibold text-text">{data.mbtiType}</p>
        <KeywordTags keywords={data.keywords} />
        <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
          {data.declaration}
        </p>
      </CardWrapper>
    );
  }

  if (data.type === "zodiac") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("zodiacLayer")}
        </p>
        {data.subtitle && (
          <p className="mb-3 text-xs text-muted">{data.subtitle}</p>
        )}
        <p className="text-4xl font-semibold text-text">{data.zodiacSign}</p>
        <KeywordTags keywords={data.keywords} />
        <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
          {data.declaration}
        </p>
      </CardWrapper>
    );
  }

  if (data.type === "letter") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("letterLayer")}
        </p>
        <h3 className="mb-4 text-xl font-semibold text-text">{data.title}</h3>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">
          {data.letter}
        </p>
        <p className="mt-5 rounded-2xl bg-secondary/10 px-4 py-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-secondary">{t("fengshuiPrefix")}</span>
          {data.yijingFengshui}
        </p>
        {showOfficePicks && (
          <Link
            href="/recommend"
            className="mt-3 inline-block text-xs font-medium text-primary/80 underline-offset-2 hover:text-primary hover:underline"
          >
            {t("recommendLink")}
          </Link>
        )}
        <button
          type="button"
          onClick={onGoNext}
          className="mt-8 w-full rounded-2xl bg-primary/10 px-4 py-3.5 text-sm font-medium text-primary transition-colors active:bg-primary/20"
        >
          {t("claimShareCard")}
        </button>
      </CardWrapper>
    );
  }

  if (data.type === "share" && report) {
    return <SharePreviewCard report={report} deskThumb={deskThumb} />;
  }

  return null;
}
