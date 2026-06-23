"use client";

import type { ReportCardData } from "@/lib/types";

interface ReportCardProps {
  data: ReportCardData;
  index: number;
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

export function ReportCard({ data, index }: ReportCardProps) {
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
      </CardWrapper>
    );
  }

  if (data.type === "mbti") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary">
          第二层 · 工位 MBTI
        </p>
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
        <div className="mt-6 rounded-2xl border border-secondary/20 bg-secondary/5 px-4 py-4">
          <p className="mb-2 text-xs font-medium tracking-wider text-secondary">
            易经 · 办公风水
          </p>
          <p className="text-sm leading-relaxed text-text">
            {data.yijingFengshui}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            alert("更多办公风水解读即将上线，敬请期待 🪴")
          }
          className="mt-5 w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-medium text-white transition-colors active:bg-primary/90"
        >
          更多办公风水解锁 →
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          深度解读你的工位布局与运势
        </p>
      </CardWrapper>
    );
  }

  if (data.type === "share") {
    return (
      <CardWrapper delay={delay}>
        <p className="mb-2 text-sm text-muted">截图分享</p>
        <h3 className="text-2xl font-semibold text-text">{data.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.mbtiType && (
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {data.mbtiType}
            </span>
          )}
          {data.zodiacSign && (
            <span className="rounded-full bg-secondary/20 px-4 py-1.5 text-sm text-text">
              {data.zodiacSign}
            </span>
          )}
        </div>
        <p className="mt-5 text-lg leading-relaxed text-primary">
          {data.summary}
        </p>
        <KeywordTags keywords={data.keywords} />
        <p className="mt-8 text-center text-xs text-muted">
          长按截图，分享到朋友圈 / 小红书 / 微信群
        </p>
      </CardWrapper>
    );
  }

  return null;
}
