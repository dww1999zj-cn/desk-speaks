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
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
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
                  ? "border-plant ring-1 ring-plant/40"
                  : "border-white/15 hover:border-white/30"
              }`}
            >
              <div className={`h-14 w-full ${STYLE_PREVIEW[id]}`} aria-hidden />
              <div className="bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-sm font-medium text-white">{t(`${id}.label`)}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                  {t(`${id}.hint`)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
