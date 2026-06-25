import type { DeskReport, ReportCardData } from "./types";

/** 展示用：去掉 MBTI 类型末尾的「工位」，如 INTJ工位 → INTJ */
export function formatMbtiType(type: string): string {
  return type.replace(/\s*工位\s*$/u, "").trim();
}

export function reportToCards(report: DeskReport): ReportCardData[] {
  const mbtiType = formatMbtiType(report.mbtiDesk.type);
  return [
    {
      type: "intro",
      title: "工位初见",
      content: report.intro.description,
      guessedAge: report.intro.guessedAge,
      ageHint: report.intro.ageHint,
      declaration: report.intro.declaration,
    },
    {
      type: "mbti",
      title: "工位 MBTI 人格",
      mbtiType,
      keywords: report.mbtiDesk.keywords,
      declaration: report.mbtiDesk.declaration,
    },
    {
      type: "zodiac",
      title: "工位星座",
      zodiacSign: report.zodiacDesk.sign,
      keywords: report.zodiacDesk.keywords,
      declaration: report.zodiacDesk.declaration,
    },
    {
      type: "letter",
      title: "工位写给你的信",
      letter: report.letter.content,
      yijingFengshui: report.letter.yijingFengshui,
      keywords: report.shareCard.keywords,
    },
    {
      type: "share",
      title: report.shareCard.title,
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
} as const;
