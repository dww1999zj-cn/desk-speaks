export interface DeskReport {
  /** 工位目击：物件 → 人格/状态洞察，2-3 条 */
  deskEvidence: string[];
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
    /** 分享金句，≤28 字，有梗可截图 */
    shareHook: string;
    /** 工位给你的称号，≤16 字 */
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
  deskEvidence?: string[];
  keywords?: string[];
  mbtiType?: string;
  zodiacSign?: string;
  letter?: string;
  yijingFengshui?: string;
  shareHook?: string;
  summary?: string;
}

// 保留统计类型，供后续扩展
export interface DeskStats {
  totalUsers: number;
  traitStats: { trait: string; percentage: number }[];
  similarCount: number;
  similarPercentage: number;
}
