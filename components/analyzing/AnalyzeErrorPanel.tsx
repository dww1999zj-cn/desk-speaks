"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export type AnalyzeErrorType = "timeout" | "failed";

interface AnalyzeErrorPanelProps {
  type: AnalyzeErrorType;
  onRetry: () => void;
  onChangePhoto: () => void;
}

export function AnalyzeErrorPanel({
  type,
  onRetry,
  onChangePhoto,
}: AnalyzeErrorPanelProps) {
  const t = useTranslations("analyzing");
  const tCommon = useTranslations("common");

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/30 to-primary/15" />
        <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-[1.75rem] border-[3px] border-white bg-white shadow-lg shadow-primary/15">
          <span className="text-4xl leading-none">😵‍💫</span>
          <span className="mt-0.5 text-[10px] font-medium text-primary/80">
            {tCommon("mascotName")}
          </span>
        </div>
        <span className="absolute -right-1 top-1 text-xl" aria-hidden>
          💦
        </span>
      </div>

      <div className="mt-10 w-full rounded-3xl border-2 border-white/80 bg-white/90 px-5 py-6 text-center shadow-md shadow-secondary/20">
        <p className="text-lg font-bold text-text">{t(`errors.${type}.title`)}</p>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {t(`errors.${type}.message`)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted/80">
          {t(`errors.${type}.hint`)}
        </p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button size="lg" className="w-full" onClick={onRetry}>
          {t("retry")}
        </Button>
        <Button
          size="md"
          variant="secondary"
          className="w-full"
          onClick={onChangePhoto}
        >
          {t("changePhoto")}
        </Button>
      </div>
    </div>
  );
}
