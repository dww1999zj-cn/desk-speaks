export interface ReportSection {
  title: string;
  content: string;
}

export interface DeskReport {
  cover: {
    title: string;
    subtitle: string;
  };
  traits: string[];
  workStyle: ReportSection;
  hiddenTrait: ReportSection;
  habit: ReportSection;
  quote: string;
  shareCard: {
    title: string;
    summary: string;
  };
}

export interface DeskStats {
  totalUsers: number;
  traitStats: { trait: string; percentage: number }[];
  similarCount: number;
  similarPercentage: number;
}

export type ReportCardType =
  | "cover"
  | "traits"
  | "workStyle"
  | "hiddenTrait"
  | "habit"
  | "quote"
  | "stats"
  | "similar"
  | "share";

export interface ReportCardData {
  type: ReportCardType;
  title?: string;
  subtitle?: string;
  traits?: string[];
  content?: string;
  quote?: string;
  summary?: string;
  totalUsers?: number;
  traitStats?: { trait: string; percentage: number }[];
  similarPercentage?: number;
  similarCount?: number;
}
