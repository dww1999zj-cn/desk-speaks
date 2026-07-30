"use client";

import { useTranslations } from "next-intl";
import {
  MARKETING_DESK_AFTER,
  MARKETING_DESK_AFTER_SRCSET,
  MARKETING_DESK_BEFORE,
  MARKETING_DESK_BEFORE_SRCSET,
  MARKETING_DESK_SIZES,
} from "@/lib/marketing-assets";
import { BeforeAfterSlider } from "@/components/report/BeforeAfterSlider";

type DeskShowcaseCompareProps = {
  variant?: "upload" | "hero";
};

export function DeskShowcaseCompare({ variant = "upload" }: DeskShowcaseCompareProps) {
  const ns = variant === "hero" ? "hub.showcase" : "upload.example";
  const t = useTranslations(ns);

  return (
    <div className={variant === "hero" ? "mt-6 -mx-1" : "mb-8"}>
      <p
        className={
          variant === "hero"
            ? "mb-3 text-center text-xs font-medium text-muted"
            : "mb-3 text-xs font-medium text-muted"
        }
      >
        {t("caption")}
      </p>
      <BeforeAfterSlider
        beforeSrc={MARKETING_DESK_BEFORE}
        afterSrc={MARKETING_DESK_AFTER}
        beforeSrcSet={MARKETING_DESK_BEFORE_SRCSET}
        afterSrcSet={MARKETING_DESK_AFTER_SRCSET}
        sizes={MARKETING_DESK_SIZES}
        beforeAlt={t("beforeAlt")}
        afterAlt={t("afterAlt")}
        labelsNamespace={ns}
        variant="marketing"
        autoDemo
        priority
      />
    </div>
  );
}
