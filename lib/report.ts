import type { AppLocale } from "@/lib/i18n/locale";
import type { DeskReport, ReportCardData } from "./types";
import { getMockReport } from "./prompts/index";
import {
  isFengShuiSnippetId,
  pickFengShuiRefId,
  resolveFengShuiNote,
} from "./renovation/feng-shui-snippets";

export interface ReportCardLabels {
  salaryLayer: string;
  salaryTitle: string;
  fengshuiLayer: string;
  fengshuiTitle: string;
  careerLayer: string;
  careerTitle: string;
}

function ensureStringArray(value: unknown, fallback: string[]): string[] {
  if (typeof value === "string" && value.trim()) {
    const parts = value
      .split(/[、,，;；|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts;
  }
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string");
  return list.length > 0 ? list : fallback;
}

function formatWan(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Model may return "约1.2万", "~$4k", or a raw number (yuan or 万). */
function normalizeGuessedSalary(
  raw: unknown,
  locale: AppLocale,
  fallback: string
): string {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    // ≥1000 → treat as 元 / USD monthly; smaller → 万 or $k units
    if (raw >= 1000) {
      return locale === "zh"
        ? `约${formatWan(raw / 10000)}万`
        : `~$${Math.round(raw / 1000)}k`;
    }
    return locale === "zh" ? `约${formatWan(raw)}万` : `~$${formatWan(raw)}k`;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    // Bare digits in a string (e.g. "8000") → same rules as number
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return normalizeGuessedSalary(Number(trimmed), locale, fallback);
    }
    return trimmed;
  }
  return fallback;
}

/** 兼容旧版 sessionStorage；清洗为猜月薪 schema */
export function normalizeReport(
  raw: Partial<DeskReport> | Record<string, unknown>,
  locale: AppLocale = "zh"
): DeskReport {
  const MOCK = getMockReport(locale);
  const rawObj = raw as Record<string, unknown>;
  const shareCard = (rawObj.shareCard ?? {}) as Partial<DeskReport["shareCard"]>;

  // Legacy persona: intro.guessedAge → salary
  const legacyIntro = rawObj.intro as
    | { description?: string; guessedAge?: string }
    | undefined;
  const salaryRaw = (rawObj.salary ?? {}) as Partial<DeskReport["salary"]>;

  const deskEvidence = ensureStringArray(rawObj.deskEvidence, MOCK.deskEvidence);

  const guessedSalary = normalizeGuessedSalary(
    salaryRaw.guessedSalary ?? legacyIntro?.guessedAge,
    locale,
    MOCK.salary.guessedSalary
  );

  const description =
    salaryRaw.description?.trim() ||
    legacyIntro?.description?.trim() ||
    MOCK.salary.description;

  const salaryHint =
    typeof salaryRaw.salaryHint === "string"
      ? salaryRaw.salaryHint.trim()
      : MOCK.salary.salaryHint;

  const careerTips = ensureStringArray(
    rawObj.careerTips ??
      (rawObj.career as { tips?: unknown } | undefined)?.tips,
    MOCK.careerTips
  ).slice(0, 4);

  const refId = isFengShuiSnippetId(rawObj.fengShuiRefId)
    ? rawObj.fengShuiRefId
    : pickFengShuiRefId(
        {
          clutterItems: deskEvidence,
          organizePlan: careerTips.join(" "),
          bareDesk: description,
        },
        rawObj.fengShuiRefId
      );
  const brief =
    (typeof rawObj.fengShuiBrief === "string" && rawObj.fengShuiBrief.trim()) ||
    MOCK.fengShuiBrief;
  const fengShui = resolveFengShuiNote(refId, brief, locale);

  const summary =
    shareCard.summary ??
    (typeof shareCard.shareHook === "string"
      ? shareCard.shareHook
      : MOCK.shareCard.summary);

  return {
    deskEvidence,
    salary: {
      description,
      guessedSalary,
      salaryHint,
    },
    fengShuiRefId: refId,
    fengShuiBrief: brief,
    fengShui,
    careerTips,
    shareCard: {
      ...MOCK.shareCard,
      ...shareCard,
      title: shareCard.title ?? MOCK.shareCard.title,
      shareHook:
        shareCard.shareHook ??
        (locale === "zh"
          ? `工位猜你${guessedSalary}`
          : `Desk says ${guessedSalary}`),
      summary,
      keywords: ensureStringArray(shareCard.keywords, MOCK.shareCard.keywords),
    },
  };
}

export function reportToCards(
  report: DeskReport,
  labels: ReportCardLabels
): ReportCardData[] {
  return [
    {
      type: "salary",
      title: labels.salaryTitle,
      content: report.salary.description,
      guessedSalary: report.salary.guessedSalary,
      salaryHint: report.salary.salaryHint,
      deskEvidence: report.deskEvidence,
    },
    {
      type: "fengshui",
      title: labels.fengshuiTitle,
      fengShui: report.fengShui,
    },
    {
      type: "career",
      title: labels.careerTitle,
      careerTips: report.careerTips,
    },
    {
      type: "share",
      title: report.shareCard.title,
      shareHook: report.shareCard.shareHook,
      summary: report.shareCard.summary,
      keywords: report.shareCard.keywords,
      guessedSalary: report.salary.guessedSalary,
    },
  ];
}

export function reportToTraits(report: DeskReport): string[] {
  return [...report.shareCard.keywords, ...report.careerTips].slice(0, 8);
}

/** @deprecated kept for any leftover imports */
export function formatMbtiType(type: string): string {
  return type.replace(/\s*(工位|Desk)\s*$/iu, "").trim();
}

export const STORAGE_KEYS = {
  image: "desk-speaks-image",
  imageThumb: "desk-speaks-image-thumb",
  report: "desk-speaks-report",
  renovation: "desk-speaks-renovation",
  reportId: "desk-speaks-report-id",
  locale: "desk-speaks-locale",
  deskStyle: "desk-speaks-desk-style",
  product: "desk-speaks-product",
} as const;
