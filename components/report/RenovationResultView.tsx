"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import type { RenovationResult } from "@/lib/renovation";
import { FengShuiNoteCard } from "@/components/report/FengShuiNoteCard";
import { BeforeAfterSlider } from "@/components/report/BeforeAfterSlider";
import { RenovationShareButton } from "@/components/report/RenovationShareButton";

interface RenovationResultViewProps {
  renovation: RenovationResult;
  beforeImage: string | null;
}

function SingleImage({
  src,
  alt,
  label,
  onExpand,
}: {
  src: string;
  alt: string;
  label: string;
  onExpand: () => void;
}) {
  const t = useTranslations("report.renovation");

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group w-full text-left"
      aria-label={label}
    >
      <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="overflow-hidden rounded-none bg-surface sm:rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="aspect-[4/3] w-full object-cover object-center"
        />
      </div>
      <p className="mt-2 text-center text-[10px] text-muted">{t("tapToEnlarge")}</p>
    </button>
  );
}

export function RenovationResultView({
  renovation,
  beforeImage,
}: RenovationResultViewProps) {
  const t = useTranslations("report.renovation");
  const tShare = useTranslations("share.renovation");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const stepLabels = [t("step1"), t("step2"), t("step3")];
  const stepContents = [
    renovation.steps.bareDesk,
    renovation.steps.organize,
    renovation.steps.decor,
  ];

  const hasCompare = Boolean(beforeImage && renovation.renovatedImage);

  return (
    <div className="space-y-8">
      <header className="px-5 sm:px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {t("badge")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">
          {renovation.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{renovation.style}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{renovation.summary}</p>
      </header>

      <div className="-mx-5 sm:mx-0">
        {hasCompare ? (
          <BeforeAfterSlider
            beforeSrc={beforeImage!}
            afterSrc={renovation.renovatedImage!}
            beforeAlt={t("beforeAlt")}
            afterAlt={t("afterAlt")}
          />
        ) : beforeImage ? (
          <SingleImage
            src={beforeImage}
            alt={t("beforeAlt")}
            label={t("before")}
            onExpand={() => setLightbox({ src: beforeImage, alt: t("beforeAlt") })}
          />
        ) : null}

        {!renovation.renovatedImage && (
          <div className="mx-5 mt-4 rounded-2xl border border-primary/10 bg-surface px-4 py-6 text-center sm:mx-0">
            <p className="text-sm leading-relaxed text-muted">{t("afterPending")}</p>
          </div>
        )}

        {renovation.renovatedImage && !beforeImage ? (
          <SingleImage
            src={renovation.renovatedImage}
            alt={t("afterAlt")}
            label={t("after")}
            onExpand={() =>
              setLightbox({ src: renovation.renovatedImage!, alt: t("afterAlt") })
            }
          />
        ) : null}
      </div>

      {renovation.fengShui ? (
        <div className="px-5 sm:px-0">
          <FengShuiNoteCard note={renovation.fengShui} />
        </div>
      ) : null}

      <div className="space-y-3 px-5 sm:px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t("stepsTitle")}
        </p>
        {stepLabels.map((label, i) => (
          <Card key={label} variant={i === 0 ? "default" : "gradient"}>
            <p className="mb-1.5 text-xs font-semibold text-primary">
              {i + 1}. {label}
            </p>
            <p className="text-sm leading-relaxed text-text">{stepContents[i]}</p>
            {i === 0 && renovation.steps.clutterItems.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {renovation.steps.clutterItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {renovation.highlights.length > 0 && (
        <div className="px-5 sm:px-0">
          <Card variant="gradient">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("highlights")}
            </p>
            <ul className="space-y-2">
              {renovation.highlights.map((item) => (
                <li key={item} className="text-sm text-text">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {renovation.tips.length > 0 && (
        <div className="px-5 sm:px-0">
          <Card>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t("tips")}
            </p>
            <ul className="space-y-2">
              {renovation.tips.map((item) => (
                <li key={item} className="text-sm text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {hasCompare && beforeImage && renovation.renovatedImage ? (
        <div className="px-5 sm:px-0">
          <p className="mb-3 text-center text-xs font-medium text-muted">
            {tShare("previewHint")}
          </p>
          <RenovationShareButton
            renovation={renovation}
            beforeSrc={beforeImage}
            afterSrc={renovation.renovatedImage}
          />
        </div>
      ) : null}

      {lightbox && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          aria-label={t("closeLightbox")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
    </div>
  );
}
