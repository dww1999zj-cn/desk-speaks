import type { FengShuiNote } from "@/lib/renovation/types";

export interface DeskReport {
  /** 工位目击：物件 → 线索，2 条 */
  deskEvidence: string[];
  salary: {
    /** 趣味开场，2 句 */
    description: string;
    /** 如「约 1.2 万」/「8k–1.2万」 */
    guessedSalary: string;
    /** 一句依据，可为空 */
    salaryHint: string;
  };
  /** 模型选出的风水 snippet id */
  fengShuiRefId: string;
  /** 结合本图的一句话解读 */
  fengShuiBrief: string;
  /** normalize 后解析出的风水卡 */
  fengShui: FengShuiNote | null;
  /** 升职加薪摆放建议，2–3 条 */
  careerTips: string[];
  shareCard: {
    title: string;
    /** 分享金句 */
    shareHook: string;
    /** 工位称号 */
    summary: string;
    keywords: string[];
  };
}

export type ReportCardType = "salary" | "fengshui" | "career" | "share";

export interface ReportCardData {
  type: ReportCardType;
  title?: string;
  subtitle?: string;
  content?: string;
  guessedSalary?: string;
  salaryHint?: string;
  deskEvidence?: string[];
  fengShui?: FengShuiNote | null;
  careerTips?: string[];
  shareHook?: string;
  summary?: string;
  keywords?: string[];
}

export interface DeskStats {
  totalUsers: number;
  traitStats: { trait: string; percentage: number }[];
  similarCount: number;
  similarPercentage: number;
}
