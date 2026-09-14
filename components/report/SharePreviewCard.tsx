"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useLocale, useTranslations } from "next-intl";
import type { DeskReport } from "@/lib/types";
import { getSiteUrl } from "@/lib/share-image";
import { formatShareSiteLabel } from "@/lib/share-copy";
import { CertificationStamp } from "./CertificationStamp";
import { ShareImageButton } from "./ShareImageButton";

interface SharePreviewCardProps {
  report: DeskReport;
  deskThumb?: string | null;
}

export function SharePreviewCard({ report, deskThumb }: SharePreviewCardProps) {
  const locale = useLocale();
  const t = useTranslations("share");
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const siteUrl = getSiteUrl(locale);
  const siteLabel = formatShareSiteLabel(siteUrl);

  useEffect(() => {
    QRCode.toDataURL(siteUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#4A4458", light: "#FFFFFF" },
    })
      .then(setQrSrc)
      .catch(() => setQrSrc(null));
  }, [siteUrl]);

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <p className="mb-3 text-center text-xs font-medium text-plant">
        {t("previewHint")}
      </p>

      <div className="relative overflow-visible rounded-[1.75rem] border-2 border-white/90 bg-gradient-to-br from-[#FFF8F5] via-[#FFE8F0] to-[#F3EEFF] p-5 shadow-lg shadow-secondary/25">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-snug text-primary">
              {t("certBadge")}
            </p>
            <h3 className="mt-1 text-xl font-bold leading-tight text-text">
              {t("title")}
            </h3>
          </div>
          {deskThumb && (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deskThumb}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="relative mt-4 overflow-visible rounded-2xl bg-primary/5 px-4 py-4 text-center">
          <CertificationStamp className="pointer-events-none absolute right-0 top-0 z-0 translate-x-[38%] -translate-y-[48%]" />
          <div className="relative z-10">
            <p className="text-xs text-muted">{t("salaryGuessLabel")}</p>
            <p className="mt-1 text-4xl font-bold text-primary">
              {report.salary.guessedSalary}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {report.fengShui?.topic ? (
            <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white">
              {report.fengShui.topic}
            </span>
          ) : null}
          {report.shareCard.summary && (
            <span className="rounded-full bg-accent/40 px-3 py-1.5 text-sm font-medium text-text">
              {report.shareCard.summary}
            </span>
          )}
        </div>

        <p className="mt-4 text-base font-semibold leading-relaxed text-text">
          {report.shareCard.shareHook}
        </p>

        {report.fengShui?.brief ? (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {report.fengShui.brief}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {(report.shareCard.keywords ?? []).slice(0, 2).map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-secondary/35 px-3 py-1 text-xs font-medium text-primary"
            >
              {kw}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2.5">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt={t("qrAlt")} className="h-14 w-14 rounded-lg" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-surface" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text">{t("qrTitle")}</p>
            <p className="truncate text-[10px] text-muted">{siteLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ShareImageButton report={report} deskThumb={deskThumb} />
      </div>
    </div>
  );
}
