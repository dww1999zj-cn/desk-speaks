"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import type { FengShuiNote } from "@/lib/renovation";

interface FengShuiNoteCardProps {
  note: FengShuiNote;
  showOfficePicks?: boolean;
}

export function FengShuiNoteCard({
  note,
  showOfficePicks = true,
}: FengShuiNoteCardProps) {
  const t = useTranslations("report.renovation.fengShui");
  const [open, setOpen] = useState(true);

  return (
    <Card variant="gradient">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-plant">
            {t("sectionTitle")}
          </p>
          <p className="mt-1 text-base font-semibold text-text">{note.topic}</p>
          {!open && note.brief ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{note.brief}</p>
          ) : null}
        </div>
        <span className="mt-0.5 shrink-0 text-xs text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4">
          <blockquote className="rounded-2xl bg-surface/80 px-4 py-3 text-sm leading-relaxed text-text">
            <p className="font-medium">{note.quote}</p>
            <footer className="mt-2 text-xs text-muted">—— {note.source}</footer>
          </blockquote>

          {note.brief ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t("briefLabel")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text">{note.brief}</p>
            </div>
          ) : null}

          {showOfficePicks ? (
            <Link
              href="/recommend"
              className="inline-block text-xs font-medium text-primary/80 underline-offset-2 hover:text-primary hover:underline"
            >
              {t("recommendLink")}
            </Link>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
