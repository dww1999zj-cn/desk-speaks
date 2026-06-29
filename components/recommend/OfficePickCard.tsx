"use client";

import { useTranslations } from "next-intl";
import type { OfficePick } from "@/lib/office-picks";

interface OfficePickCardProps {
  pick: OfficePick;
}

export function OfficePickCard({ pick }: OfficePickCardProps) {
  const t = useTranslations("recommend");

  return (
    <a
      href={pick.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex gap-4 rounded-2xl border-2 border-white/90 bg-white/90 p-4 shadow-sm shadow-secondary/15 transition-transform active:scale-[0.99]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-2xl">
        {pick.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug text-text group-hover:text-primary">
          {pick.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{pick.hook}</p>
        <p className="mt-2 text-xs font-medium text-primary/80">{t("goJd")}</p>
      </div>
    </a>
  );
}
