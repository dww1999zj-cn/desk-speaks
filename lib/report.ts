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

/** Rough playful RMB→USD band for EN display (1万 ≈ $1.4k). */
function wanToUsdK(wan: number): string {
  const usdK = Math.max(1, Math.round(wan * 1.4 * 10) / 10);
  return Number.isInteger(usdK) ? String(usdK) : usdK.toFixed(1);
}

/** When locale is en, rewrite Chinese salary strings the model may still emit. */
function localizeSalaryString(raw: string, locale: AppLocale): string {
  if (locale !== "en") return raw;

  const s = raw.trim();
  if (!s) return s;

  // Already English-ish
  if (/^~?\$/.test(s) || (/^\d/.test(s) && /k/i.test(s) && !/[约万亿元]/.test(s))) {
    return s.startsWith("~") || s.startsWith("$") ? s : `~$${s.replace(/^\$/, "")}`;
  }

  // 「约1.2万」「1.5-2万」「约2.5万+」
  const wanRange = s.match(
    /(\d+(?:\.\d+)?)\s*[-–—~至到]\s*(\d+(?:\.\d+)?)\s*万/
  );
  if (wanRange) {
    return `~$${wanToUsdK(Number(wanRange[1]))}–${wanToUsdK(Number(wanRange[2]))}k`;
  }
  const wanSingle = s.match(/(\d+(?:\.\d+)?)\s*万/);
  if (wanSingle) {
    const suffix = /\+|以上|做梦/.test(s) ? "+" : "";
    return `~$${wanToUsdK(Number(wanSingle[1]))}k${suffix}`;
  }

  // 「约6k」「约8k–9k」
  const kRange = s.match(
    /(\d+(?:\.\d+)?)\s*[kK]\s*[-–—~]\s*(\d+(?:\.\d+)?)\s*[kK]?/
  );
  if (kRange) return `~$${kRange[1]}–${kRange[2]}k`;
  const kSingle = s.match(/(\d+(?:\.\d+)?)\s*[kK]/);
  if (kSingle) return `~$${kSingle[1]}k`;

  // Strip common Chinese wrappers if leftover
  return s
    .replace(/约/g, "~")
    .replace(/万/g, "0k")
    .replace(/元/g, "")
    .trim();
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
    return localizeSalaryString(trimmed, locale);
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

  const descriptionRaw =
    salaryRaw.description?.trim() ||
    legacyIntro?.description?.trim() ||
    MOCK.salary.description;
  const description =
    locale === "en" && /[\u4e00-\u9fff]/.test(descriptionRaw)
      ? MOCK.salary.description
      : descriptionRaw;

  const salaryHintRaw =
    typeof salaryRaw.salaryHint === "string"
      ? salaryRaw.salaryHint.trim()
      : MOCK.salary.salaryHint;
  const salaryHint =
    locale === "en" && /[\u4e00-\u9fff]/.test(salaryHintRaw)
      ? MOCK.salary.salaryHint
      : salaryHintRaw;

  const careerTipsRaw = ensureStringArray(
    rawObj.careerTips ??
      (rawObj.career as { tips?: unknown } | undefined)?.tips,
    MOCK.careerTips
  ).slice(0, 4);
  const careerTips =
    locale === "en" && careerTipsRaw.some((t) => /[\u4e00-\u9fff]/.test(t))
      ? MOCK.careerTips
      : careerTipsRaw;

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
  const briefRaw =
    (typeof rawObj.fengShuiBrief === "string" && rawObj.fengShuiBrief.trim()) ||
    MOCK.fengShuiBrief;
  const brief =
    locale === "en" && /[\u4e00-\u9fff]/.test(briefRaw)
      ? MOCK.fengShuiBrief
      : briefRaw;
  const fengShui = resolveFengShuiNote(refId, brief, locale);

  const summaryRaw =
    (typeof shareCard.summary === "string" && shareCard.summary.trim()) ||
    MOCK.shareCard.summary;
  const summary =
    locale === "en" && /[\u4e00-\u9fff]/.test(summaryRaw)
      ? MOCK.shareCard.summary
      : summaryRaw;

  const rawHook =
    typeof shareCard.shareHook === "string" ? shareCard.shareHook.trim() : "";
  const shareHook =
    locale === "en" && (!rawHook || /[\u4e00-\u9fff]/.test(rawHook))
      ? `Desk says ${guessedSalary}`
      : rawHook ||
        (locale === "zh"
          ? `工位猜你${guessedSalary}`
          : `Desk says ${guessedSalary}`);

  return {
    deskEvidence:
      locale === "en" && deskEvidence.some((d) => /[\u4e00-\u9fff]/.test(d))
        ? MOCK.deskEvidence
        : deskEvidence,
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
      title:
        locale === "en" &&
        typeof shareCard.title === "string" &&
        /[\u4e00-\u9fff]/.test(shareCard.title)
          ? MOCK.shareCard.title
          : shareCard.title ?? MOCK.shareCard.title,
      shareHook,
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
