import type { RenovationPlan } from "./types";
import type { AppLocale } from "@/lib/i18n/locale";
import {
  getFengShuiBriefFallback,
  pickFengShuiRefId,
  resolveFengShuiNote,
} from "./feng-shui-snippets";

function stripFences(text: string): string {
  return text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
}

function normalizeJsonText(text: string): string {
  return text
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1");
}

function tryParseObject(raw: string): RenovationPlan | null {
  try {
    const parsed = JSON.parse(raw) as RenovationPlan & { isDesk?: boolean | string };
    if (typeof parsed.isDesk === "boolean") return parsed;
    if (String(parsed.isDesk) === "true") return { ...parsed, isDesk: true };
    if (String(parsed.isDesk) === "false") return { ...parsed, isDesk: false };
  } catch {
    /* continue */
  }
  return null;
}

/** Close truncated JSON when Qwen hits max_tokens mid-response. */
function repairTruncatedJson(text: string): string {
  let s = text.trim();
  if (!s.startsWith("{")) return s;

  const stack: ("{" | "[")[] = [];
  let inString = false;
  let escaped = false;

  for (const ch of s) {
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") stack.push("{");
    else if (ch === "[") stack.push("[");
    else if (ch === "}" && stack.at(-1) === "{") stack.pop();
    else if (ch === "]" && stack.at(-1) === "[") stack.pop();
  }

  if (inString) s += '"';
  s = s.replace(/,\s*$/, "");

  while (stack.length > 0) {
    const open = stack.pop();
    s += open === "[" ? "]" : "}";
  }

  return s;
}

function extractJsonBlocks(text: string): string[] {
  const blocks: string[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        blocks.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return blocks;
}

export function parseRenovationPlan(content: string): RenovationPlan {
  const cleaned = normalizeJsonText(stripFences(content));
  const candidates = [
    cleaned,
    repairTruncatedJson(cleaned),
    ...extractJsonBlocks(cleaned),
    cleaned.match(/\{[\s\S]*\}/)?.[0] ?? "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = normalizeJsonText(candidate);
    const parsed = tryParseObject(normalized);
    if (parsed) return parsed;
  }

  console.error("Renovation plan parse failed, raw:", content.slice(0, 500));
  throw new Error("Renovation plan parse failed");
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === "string");
}

export function planToResult(
  plan: RenovationPlan,
  renovatedImage: string | null,
  styleLabel?: string,
  locale: AppLocale = "zh"
): import("./types").RenovationResult {
  const organize =
    plan.organizePlan?.trim() ||
    plan.organizePrompt?.trim() ||
    "整理桌面散落杂物，收入收纳盒与托盘。";
  const decor =
    plan.decorPlan?.trim() ||
    plan.decorPrompt?.trim() ||
    "添加一件角位氛围点缀（如台灯、小相框、薄桌垫等）。";

  return {
    title: plan.title ?? "工位整理方案",
    style: styleLabel || plan.style || "",
    summary: plan.summary ?? "",
    steps: {
      bareDesk: plan.bareDesk?.trim() || "识别工位固定布局：桌面、显示器与背景家具。",
      organize,
      decor,
      clutterItems: stringList(plan.clutterItems),
    },
    highlights: stringList(plan.highlights),
    tips: stringList(plan.tips),
    fengShui: (() => {
      const refId = pickFengShuiRefId(plan, plan.fengShuiRefId);
      const brief =
        (typeof plan.fengShuiBrief === "string" &&
        plan.fengShuiBrief.trim().length >= 8
          ? plan.fengShuiBrief.trim().slice(0, 100)
          : getFengShuiBriefFallback(refId, locale)) ||
        (locale === "en"
          ? "After organizing, the desk feels clearer to work at."
          : "整理后桌面更清爽，工作区更顺手。");
      return resolveFengShuiNote(refId, brief, locale);
    })(),
    imagePrompt:
      plan.organizePrompt?.trim() ||
      plan.decorPrompt?.trim() ||
      plan.imagePrompt?.trim() ||
      "",
    renovatedImage,
  };
}
