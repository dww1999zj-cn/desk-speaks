"use client";

const STAGES = [
  { until: 15, whisper: "记住了你的样子" },
  { until: 38, whisper: "我在读你的桌面" },
  { until: 58, whisper: "偷偷猜你几岁" },
  { until: 78, whisper: "描绘你的另一面" },
  { until: 92, whisper: "想给你写封信" },
  { until: 100, whisper: "好了，认识你了" },
] as const;

function getWhisper(progress: number): string {
  const stage = STAGES.find((s) => progress < s.until);
  return stage?.whisper ?? STAGES[STAGES.length - 1].whisper;
}

interface AnalyzeProgressProps {
  progress: number;
}

export function AnalyzeProgress({ progress }: AnalyzeProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full rounded-2xl bg-white/70 px-5 py-4 shadow-sm shadow-primary/5 backdrop-blur-sm">
      <p className="mb-4 text-center text-sm text-muted">
        {getWhisper(clamped)}
      </p>

      <div className="relative h-2 overflow-hidden rounded-full bg-primary/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary shadow-sm shadow-primary/30 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(clamped, 4)}%` }}
        />
      </div>
    </div>
  );
}

export function getSimulatedProgress(elapsedMs: number): number {
  const expectedMs = 28000;
  const raw = (elapsedMs / expectedMs) * 92;
  return Math.min(92, raw);
}
