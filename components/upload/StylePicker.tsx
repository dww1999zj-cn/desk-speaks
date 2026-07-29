"use client";

import { useTranslations } from "next-intl";
import {
  DESK_STYLE_IDS,
  type DeskStyleId,
} from "@/lib/renovation/desk-styles";

interface StylePickerProps {
  value: DeskStyleId;
  onChange: (style: DeskStyleId) => void;
}

const STYLE_PREVIEW: Record<DeskStyleId, string> = {
  ins: "bg-gradient-to-br from-white via-stone-50 to-emerald-50",
  japanese: "bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100",
  minimal: "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
};

export function StylePicker({ value, onChange }: StylePickerProps) {
  const t = useTranslations("upload.styles");

  return (
    <div className="mt-8">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {t("title")}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DESK_STYLE_IDS.map((id) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`overflow-hidden rounded-xl border text-left transition ${
                selected
                  ? "border-plant ring-1 ring-plant/30"
                  : "border-black/5 hover:border-muted/40"
              }`}
            >
              <div className={`h-14 w-full ${STYLE_PREVIEW[id]}`} aria-hidden />
              <div className="bg-white px-3 py-2.5">
                <p className="text-sm font-medium text-text">{t(`${id}.label`)}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{t(`${id}.hint`)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
