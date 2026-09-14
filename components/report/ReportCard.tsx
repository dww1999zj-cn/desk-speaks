"use client";

import { useTranslations } from "next-intl";
import type { DeskReport, ReportCardData } from "@/lib/types";
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
  const tFs = useTranslations("report.renovation.fengShui");
  const delay = `${index * 80}ms`;

  if (data.type === "salary") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("salaryLayer")}
        </p>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">
          {data.content}
        </p>
        <div className="mt-6 rounded-2xl bg-primary/5 px-5 py-5 text-center">
          <p className="text-sm text-muted">{t("salaryGuessLabel")}</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-primary">
            {data.guessedSalary}
          </p>
          {data.salaryHint ? (
            <p className="mt-2 text-xs leading-relaxed text-muted">{data.salaryHint}</p>
          ) : null}
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted/80">
          {t("salaryDisclaimer")}
        </p>
        <DeskEvidenceList items={data.deskEvidence} />
      </CardWrapper>
    );
  }

  if (data.type === "fengshui") {
    const note = data.fengShui;
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("fengshuiLayer")}
        </p>
        {note ? (
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-text">{note.topic}</p>
            <blockquote className="rounded-2xl bg-secondary/10 px-4 py-3 text-sm leading-relaxed text-text">
              <p className="font-medium">{note.quote}</p>
              <footer className="mt-2 text-xs text-muted">—— {note.source}</footer>
            </blockquote>
            {note.brief ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {tFs("briefLabel")}
                </p>
                <p className="mt-2 text-base leading-relaxed text-muted md:text-lg">
                  {note.brief}
                </p>
              </div>
            ) : null}
            <p className="text-[11px] leading-relaxed text-muted/80">{tFs("disclaimer")}</p>
          </div>
        ) : (
          <p className="text-base leading-relaxed text-muted">{t("fengshuiEmpty")}</p>
        )}
      </CardWrapper>
    );
  }

  if (data.type === "career") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          {t("careerLayer")}
        </p>
        <h3 className="mb-4 text-xl font-semibold text-text">{data.title}</h3>
        <ul className="space-y-3">
          {(data.careerTips ?? []).map((tip, i) => (
            <li
              key={`${i}-${tip}`}
              className="rounded-2xl border border-primary/10 bg-white/70 px-4 py-3 text-sm leading-relaxed text-text"
            >
              <span className="mr-2 font-semibold text-primary">{i + 1}.</span>
              {tip}
            </li>
          ))}
        </ul>
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
