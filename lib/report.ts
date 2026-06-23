import type { DeskReport, ReportCardData } from "./types";

export function reportToCards(report: DeskReport): ReportCardData[] {
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
      mbtiType: report.mbtiDesk.type,
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
      mbtiType: report.mbtiDesk.type,
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
