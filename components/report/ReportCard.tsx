"use client";

import Link from "next/link";
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
  if (!items?.length) return null;
  return (
    <div className="mt-6 rounded-2xl border border-primary/10 bg-white/60 px-4 py-4">
      <p className="mb-3 text-xs font-semibold text-primary">工位目击 · 它看到了这些</p>
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

export function ReportCard({ data, index, report, deskThumb, onGoNext }: ReportCardProps) {
  const delay = `${index * 80}ms`;

  if (data.type === "intro") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          第一层 · 工位初见
        </p>
        <p className="text-base leading-relaxed text-muted md:text-lg">
          {data.content}
        </p>
        <div className="mt-6 rounded-2xl bg-primary/5 px-5 py-5 text-center">
          <p className="text-sm text-muted">工位猜你</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-primary">
            {data.guessedAge}
          </p>
          {data.ageHint && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {data.ageHint}
            </p>
          )}
        </div>
        <p className="mt-6 text-lg font-medium leading-relaxed text-text">
          「{data.declaration}」
        </p>
        <DeskEvidenceList items={data.deskEvidence} />
      </CardWrapper>
    );
  }

  if (data.type === "mbti") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          第二层 · 工位 MBTI
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
          第三层 · 工位星座
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
          第四层 · 工位来信
        </p>
        <h3 className="mb-4 text-xl font-semibold text-text">{data.title}</h3>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">
          {data.letter}
        </p>
        <p className="mt-5 rounded-2xl bg-secondary/10 px-4 py-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-secondary">风水一句 · </span>
          {data.yijingFengshui}
        </p>
        <Link
          href="/recommend"
          className="mt-3 inline-block text-xs font-medium text-primary/80 underline-offset-2 hover:text-primary hover:underline"
        >
          更多办公好物推荐 →
        </Link>
        <button
          type="button"
          onClick={onGoNext}
          className="mt-8 w-full rounded-2xl bg-primary/10 px-4 py-3.5 text-sm font-medium text-primary transition-colors active:bg-primary/20"
        >
          领取工位鉴定卡 →
        </button>
      </CardWrapper>
    );
  }

  if (data.type === "share" && report) {
    return <SharePreviewCard report={report} deskThumb={deskThumb} />;
  }

  return null;
}
