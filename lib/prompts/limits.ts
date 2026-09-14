import type { AppLocale } from "@/lib/i18n/locale";

/** 写入 prompt 的字数目标（仅约束模型，不做服务端硬截断） */
export interface ReportLimits {
  deskEvidenceCount: number;
  deskEvidenceItem: number;
  salaryDescription: number;
  salaryHint: number;
  fengShuiBrief: number;
  careerTipCount: number;
  careerTipItem: number;
  shareHook: number;
  shareSummary: number;
  keywordCount: number;
}

export const REPORT_LIMITS: Record<AppLocale, ReportLimits> = {
  zh: {
    deskEvidenceCount: 2,
    deskEvidenceItem: 26,
    salaryDescription: 52,
    salaryHint: 40,
    fengShuiBrief: 36,
    careerTipCount: 3,
    careerTipItem: 28,
    shareHook: 22,
    shareSummary: 10,
    keywordCount: 2,
  },
  en: {
    deskEvidenceCount: 2,
    deskEvidenceItem: 48,
    salaryDescription: 110,
    salaryHint: 90,
    fengShuiBrief: 80,
    careerTipCount: 3,
    careerTipItem: 56,
    shareHook: 42,
    shareSummary: 20,
    keywordCount: 2,
  },
};
