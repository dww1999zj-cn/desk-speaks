"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useLocale, useTranslations } from "next-intl";
import type { DeskReport } from "@/lib/types";
import { getSiteUrl } from "@/lib/share-image";
import { formatMbtiType } from "@/lib/report";
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
      <p className="mb-3 text-center text-xs font-medium text-primary">
        {t("previewHint")}
      </p>

      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-white/90 bg-gradient-to-br from-[#FFF8F5] via-[#FFE8F0] to-[#F3EEFF] p-5 shadow-lg shadow-secondary/25">
        <CertificationStamp className="absolute -right-1 top-24 z-10" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">{t("certBadge")}</p>
            <h3 className="mt-1 text-xl font-bold text-text">{t("title")}</h3>
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

        <div className="relative mt-4 rounded-2xl bg-primary/5 px-4 py-4 text-center">
          <p className="text-xs text-muted">{t("ageGuessLabel")}</p>
          <p className="text-4xl font-bold text-primary">
            {report.intro.guessedAge}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white">
            {formatMbtiType(report.mbtiDesk.type)}
          </span>
          <span className="rounded-full bg-secondary/60 px-3 py-1.5 text-sm font-medium text-text">
            {report.zodiacDesk.sign}
          </span>
          {report.shareCard.summary && (
            <span className="rounded-full bg-accent/40 px-3 py-1.5 text-sm font-medium text-text">
              {report.shareCard.summary}
            </span>
          )}
        </div>

        <p className="mt-4 text-base font-semibold leading-relaxed text-text">
          {report.shareCard.shareHook}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {report.shareCard.keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-secondary/35 px-3 py-1 text-xs font-medium text-primary"
            >
              {kw}
            </span>
          ))}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          「{report.deskEvidence[0] ?? report.intro.declaration}」
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/60 pt-4">
          <div className="flex min-h-[84px] flex-col justify-center">
            <p className="text-sm font-semibold leading-snug text-text">
              {t("qrTitle")}
            </p>
            {siteLabel && (
              <p className="mt-1 text-xs text-muted">{siteLabel}</p>
            )}
          </div>
          {qrSrc && (
            <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt={t("qrAlt")} className="h-[72px] w-[72px]" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <ShareImageButton report={report} deskThumb={deskThumb} />
        <p className="mt-2 text-center text-xs text-muted">{t("shareHint")}</p>
      </div>
    </div>
  );
}
