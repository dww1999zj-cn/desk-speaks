import type { DeskReport, DeskStats, ReportCardData } from "./types";

export function reportToCards(
  report: DeskReport,
  stats?: DeskStats | null
): ReportCardData[] {
  const cards: ReportCardData[] = [
    {
      type: "cover",
      title: report.cover.title,
      subtitle: report.cover.subtitle,
    },
    {
      type: "traits",
      title: "你的气质",
      traits: report.traits,
    },
    {
      type: "workStyle",
      title: report.workStyle.title,
      content: report.workStyle.content,
    },
    {
      type: "hiddenTrait",
      title: report.hiddenTrait.title,
      content: report.hiddenTrait.content,
    },
    {
      type: "habit",
      title: report.habit.title,
      content: report.habit.content,
    },
    {
      type: "quote",
      quote: report.quote,
    },
  ];

  if (stats && stats.totalUsers > 0) {
    const topTrait = [...stats.traitStats].sort(
      (a, b) => b.percentage - a.percentage
    )[0];

    cards.push({
      type: "stats",
      title: "工位人格统计",
      totalUsers: stats.totalUsers,
      traitStats: stats.traitStats,
      content: topTrait
        ? `已有 ${stats.totalUsers} 位工位主人参与。其中 ${topTrait.percentage}% 的人，也和你一样「${topTrait.trait}」。`
        : `已有 ${stats.totalUsers} 位工位主人参与。`,
    });

    cards.push({
      type: "similar",
      title: "和你一样的人",
      similarPercentage: stats.similarPercentage,
      similarCount: stats.similarCount,
      traits: report.traits,
      content:
        stats.similarCount > 0
          ? `在其他工位主人中，有 ${stats.similarCount} 位和你有着相似的气质组合——你们大概会用类似的方式布置自己的一方天地。`
          : "目前还没有人和你有相似的气质组合，你的工位风格很独特。",
    });
  }

  cards.push({
    type: "share",
    title: report.shareCard.title,
    summary: report.shareCard.summary,
    traits: report.traits,
  });

  return cards;
}

export const STORAGE_KEYS = {
  image: "desk-speaks-image",
  report: "desk-speaks-report",
  reportId: "desk-speaks-report-id",
} as const;
