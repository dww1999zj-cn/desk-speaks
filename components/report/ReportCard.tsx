import type { ReportCardData } from "@/lib/types";

interface ReportCardProps {
  data: ReportCardData;
  index: number;
}

export function ReportCard({ data, index }: ReportCardProps) {
  const delay = `${index * 80}ms`;

  if (data.type === "cover") {
    return (
      <div
        className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <p className="mb-4 text-sm font-medium tracking-widest text-secondary uppercase">
          人格档案
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-text md:text-4xl">
          {data.title}
        </h2>
        <p className="mt-4 text-lg text-muted">{data.subtitle}</p>
      </div>
    );
  }

  if (data.type === "traits") {
    return (
      <div
        className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <h3 className="mb-6 text-xl font-semibold text-text">{data.title}</h3>
        <div className="flex flex-wrap gap-3">
          {data.traits?.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-primary/10 px-5 py-2.5 text-base font-medium text-primary"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === "quote") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center text-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <p className="mb-6 text-5xl text-secondary/40">&ldquo;</p>
        <p className="text-xl leading-relaxed text-text md:text-2xl">
          {data.quote}
        </p>
        <p className="mt-8 text-sm text-muted">—— 你的工位</p>
      </div>
    );
  }

  if (data.type === "stats") {
    return (
      <div
        className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary uppercase">
          全国工位
        </p>
        <h3 className="mb-4 text-xl font-semibold text-text">{data.title}</h3>
        <p className="mb-6 text-sm text-muted">{data.content}</p>
        <div className="space-y-3">
          {data.traitStats?.map((item) => (
            <div key={item.trait}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-text">{item.trait}</span>
                <span className="font-medium text-primary">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === "similar") {
    return (
      <div
        className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <p className="mb-2 text-sm font-medium tracking-widest text-secondary uppercase">
          气质共鸣
        </p>
        <h3 className="mb-6 text-xl font-semibold text-text">{data.title}</h3>
        <p className="text-6xl font-semibold text-primary">
          {data.similarPercentage}%
        </p>
        <p className="mt-2 text-sm text-muted">的工位主人，和你气质相近</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {data.traits?.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-secondary/20 px-4 py-1.5 text-sm text-text"
            >
              {trait}
            </span>
          ))}
        </div>
        <p className="mt-6 text-base leading-relaxed text-muted">
          {data.content}
        </p>
      </div>
    );
  }

  if (data.type === "share") {
    return (
      <div
        className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
      >
        <p className="mb-2 text-sm text-muted">分享卡片</p>
        <h3 className="text-2xl font-semibold text-text">{data.title}</h3>
        <p className="mt-4 text-lg text-primary">{data.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {data.traits?.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-secondary/20 px-4 py-1.5 text-sm text-text"
            >
              {trait}
            </span>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted">
          长按保存或截图分享给朋友
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col justify-center animate-fade-in-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <h3 className="mb-4 text-xl font-semibold text-text">{data.title}</h3>
      <p className="text-base leading-relaxed text-muted md:text-lg">
        {data.content}
      </p>
    </div>
  );
}
