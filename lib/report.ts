import type { AppLocale } from "@/lib/i18n/locale";
import type { DeskReport, ReportCardData } from "./types";
import { getMockReport } from "./prompts/index";

export interface ReportCardLabels {
  introLayer: string;
  introTitle: string;
  mbtiLayer: string;
  mbtiTitle: string;
  mbtiSubtitle: string;
  zodiacLayer: string;
  zodiacTitle: string;
  zodiacSubtitle: string;
  letterLayer: string;
  letterTitle: string;
}

/** 展示用：去掉 MBTI 类型末尾的「工位 / Desk」后缀 */
export function formatMbtiType(type: string): string {
  return type.replace(/\s*(工位|Desk)\s*$/iu, "").trim();
}

/** 兼容旧版 sessionStorage 报告结构 */
export function normalizeReport(
  raw: Partial<DeskReport>,
  locale: AppLocale = "zh"
): DeskReport {
  const MOCK_REPORT = getMockReport(locale);
  const shareCard = (raw.shareCard ?? {}) as Partial<DeskReport["shareCard"]>;
  const summary =
    shareCard.summary ??
    (typeof shareCard.shareHook === "string"
      ? shareCard.shareHook
      : MOCK_REPORT.shareCard.summary);

  return {
    deskEvidence: Array.isArray(raw.deskEvidence)
      ? raw.deskEvidence.filter((item): item is string => typeof item === "string")
      : MOCK_REPORT.deskEvidence,
    intro: { ...MOCK_REPORT.intro, ...(raw.intro ?? {}) },
    mbtiDesk: { ...MOCK_REPORT.mbtiDesk, ...(raw.mbtiDesk ?? {}) },
    zodiacDesk: { ...MOCK_REPORT.zodiacDesk, ...(raw.zodiacDesk ?? {}) },
    letter: { ...MOCK_REPORT.letter, ...(raw.letter ?? {}) },
    shareCard: {
      ...MOCK_REPORT.shareCard,
      ...shareCard,
      shareHook:
        shareCard.shareHook ??
        shareCard.summary ??
        MOCK_REPORT.shareCard.shareHook,
      summary,
    },
  };
}

export function reportToCards(
  report: DeskReport,
  labels: ReportCardLabels
): ReportCardData[] {
  const mbtiType = formatMbtiType(report.mbtiDesk.type);
  return [
    {
      type: "intro",
      title: labels.introTitle,
      content: report.intro.description,
      guessedAge: report.intro.guessedAge,
      ageHint: report.intro.ageHint,
      declaration: report.intro.declaration,
      deskEvidence: report.deskEvidence,
    },
    {
      type: "mbti",
      title: labels.mbtiTitle,
      subtitle: labels.mbtiSubtitle,
      mbtiType,
      keywords: report.mbtiDesk.keywords,
      declaration: report.mbtiDesk.declaration,
    },
    {
      type: "zodiac",
      title: labels.zodiacTitle,
      subtitle: labels.zodiacSubtitle,
      zodiacSign: report.zodiacDesk.sign,
      keywords: report.zodiacDesk.keywords,
      declaration: report.zodiacDesk.declaration,
    },
    {
      type: "letter",
      title: labels.letterTitle,
      letter: report.letter.content,
      yijingFengshui: report.letter.yijingFengshui,
      keywords: report.shareCard.keywords,
    },
    {
      type: "share",
      title: report.shareCard.title,
      shareHook: report.shareCard.shareHook,
      summary: report.shareCard.summary,
      keywords: report.shareCard.keywords,
      mbtiType,
      zodiacSign: report.zodiacDesk.sign,
    },
  ];
}

export function reportToTraits(report: DeskReport): string[] {
  return [
    ...report.mbtiDesk.keywords,
    ...report.zodiacDesk.keywords,
  ].slice(0, 8);
}

export const STORAGE_KEYS = {
  image: "desk-speaks-image",
  imageThumb: "desk-speaks-image-thumb",
  report: "desk-speaks-report",
  reportId: "desk-speaks-report-id",
  locale: "desk-speaks-locale",
} as const;
