import type { AppLocale } from "@/lib/i18n/locale";

/** 写入 prompt 的字数目标（仅约束模型，不做服务端硬截断） */
export interface ReportLimits {
  deskEvidenceCount: number;
  deskEvidenceItem: number;
  introDescription: number;
  declaration: number;
  keywordCount: number;
  keywordItem: number;
  letterContent: number;
  letterFengshui: number;
  shareHook: number;
  shareSummary: number;
}

export const REPORT_LIMITS: Record<AppLocale, ReportLimits> = {
  zh: {
    deskEvidenceCount: 2,
    deskEvidenceItem: 26,
    introDescription: 52,
    declaration: 22,
    keywordCount: 2,
    keywordItem: 6,
    letterContent: 48,
    letterFengshui: 14,
    shareHook: 18,
    shareSummary: 10,
  },
  en: {
    deskEvidenceCount: 2,
    deskEvidenceItem: 48,
    introDescription: 110,
    declaration: 40,
    keywordCount: 2,
    keywordItem: 12,
    letterContent: 120,
    letterFengshui: 36,
    shareHook: 34,
    shareSummary: 20,
  },
};
