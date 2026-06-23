export interface DeskReport {
  intro: {
    description: string;
    guessedAge: string;
    ageHint: string;
    declaration: string;
  };
  mbtiDesk: {
    type: string;
    keywords: string[];
    declaration: string;
  };
  zodiacDesk: {
    sign: string;
    keywords: string[];
    declaration: string;
  };
  letter: {
    content: string;
    yijingFengshui: string;
  };
  shareCard: {
    title: string;
    summary: string;
    keywords: string[];
  };
}

export type ReportCardType =
  | "intro"
  | "mbti"
  | "zodiac"
  | "letter"
  | "share";

export interface ReportCardData {
  type: ReportCardType;
  title?: string;
  subtitle?: string;
  content?: string;
  guessedAge?: string;
  ageHint?: string;
  declaration?: string;
  keywords?: string[];
  mbtiType?: string;
  zodiacSign?: string;
  letter?: string;
  yijingFengshui?: string;
  summary?: string;
}

// 保留统计类型，供后续扩展
export interface DeskStats {
  totalUsers: number;
  traitStats: { trait: string; percentage: number }[];
  similarCount: number;
  similarPercentage: number;
}
