import type { AppLocale } from "@/lib/i18n/locale";
import type { DeskReport } from "@/lib/types";
import * as en from "./en";
import * as zh from "./zh";

export interface PromptBundle {
  systemPrompt: string;
  userPrompt: string;
  mockReport: DeskReport;
}

const bundles: Record<AppLocale, PromptBundle> = {
  zh: {
    systemPrompt: zh.SYSTEM_PROMPT,
    userPrompt: zh.ANALYZE_USER_PROMPT,
    mockReport: zh.MOCK_REPORT,
  },
  en: {
    systemPrompt: en.SYSTEM_PROMPT,
    userPrompt: en.ANALYZE_USER_PROMPT,
    mockReport: en.MOCK_REPORT,
  },
};

export function getPrompts(locale: AppLocale): PromptBundle {
  return bundles[locale] ?? bundles.zh;
}

export function getMockReport(locale: AppLocale): DeskReport {
  return getPrompts(locale).mockReport;
}

// Legacy re-exports for scripts
export {
  SYSTEM_PROMPT,
  ANALYZE_USER_PROMPT,
  THINKING_STATUS_TEXTS,
  MOCK_REPORT,
} from "./zh";
