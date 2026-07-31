import "server-only";

import type { AppLocale } from "@/lib/i18n/locale";
import { dataUrlToBase64 } from "@/lib/image";
import { fetchWithRetry } from "./fetch-retry";
import { getRenovationPrompts } from "./prompts";
import { getDeskStyleQwenHint } from "./desk-styles";
import type { DeskStyleId } from "./desk-styles";
import { parseRenovationPlan } from "./parse";
import type { RenovationPlan } from "./types";

const QWEN_API_BASE =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const FALLBACK_MODEL = "qwen-vl-plus";

function getModel(): string {
  return process.env.QWEN_VL_MODEL ?? FALLBACK_MODEL;
}

export class NotADeskError extends Error {
  reason: string;
  constructor(reason: string) {
    super(reason);
    this.name = "NotADeskError";
    this.reason = reason;
  }
}

/** Last-resort plan so Wan can still run when Qwen JSON is truncated. */
function buildFallbackPlan(locale: AppLocale, deskStyle: DeskStyleId): RenovationPlan {
  if (locale === "en") {
    return {
      isDesk: true,
      title: "Clear desk reset",
      style: deskStyle,
      summary: "Store clutter, keep one accent.",
      bareDesk: "Same desk, monitors, cabinets, and partition walls as the photo.",
      clutterItems: ["loose papers", "cups", "cables", "small stationery"],
      organizePlan: "Put all loose items into white organizers and hide cables.",
      organizePrompt:
        "Put ALL loose clutter into cream/white storage boxes and trays; hide cables; keep keyboard area clear.",
      decorPlan: "Add one small accent only.",
      decorPrompt: "One small plant or desk mat only; keep work area clear.",
      highlights: ["Tidier surface", "Hidden cables", "One accent"],
      tips: ["Clear keyboard zone first", "One accent is enough"],
      fengShuiRefId: "tidy_qi",
      fengShuiBrief: "A clearer desk makes it easier to focus.",
    };
  }

  return {
    isDesk: true,
    title: "桌面清爽整理",
    style: deskStyle,
    summary: "先收纳杂物，再加一件点缀。",
    bareDesk: "保持原图桌子、显示器、柜子与隔断墙等固定结构不变。",
    clutterItems: ["散落纸张", "杯子", "数据线", "文具"],
    organizePlan: "把散落杂物收入奶油白收纳盒/托盘，线缆隐藏，键鼠区留白。",
    organizePrompt: "100%散落杂物入奶油白收纳盒与托盘，数据线隐藏，桌面零散落。",
    decorPlan: "仅加一件角位点缀。",
    decorPrompt: "仅1件：小绿植或浅色大号桌垫，键鼠前方留白。",
    highlights: ["桌面更干净", "线缆收起", "一点点缀"],
    tips: ["先清键鼠区", "装饰只留一件"],
    fengShuiRefId: "tidy_qi",
    fengShuiBrief: "整理后视野更开阔，办公更顺手。",
  };
}

async function callVisionPlan(
  apiKey: string,
  base64: string,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  retried = false
): Promise<RenovationPlan> {
  const { systemPrompt, userPrompt } = getRenovationPrompts(locale, deskStyle);
  const styleHint = getDeskStyleQwenHint(deskStyle, locale);

  const res = await fetchWithRetry(
    QWEN_API_BASE,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
              {
                type: "text",
                text: retried
                  ? `${userPrompt}\n${styleHint}\n请输出更短的完整 JSON，各字段尽量精简，确保不被截断。`
                  : `${userPrompt}\n${styleHint}`,
              },
            ],
          },
        ],
        max_tokens: retried ? 3200 : 2600,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    },
    { timeoutMs: 90_000, retries: 3 }
  );

  if (!res.ok) {
    throw new Error(`Vision plan error: ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty vision response");

  const finishReason = data.choices?.[0]?.finish_reason;

  let plan: RenovationPlan;
  try {
    plan = parseRenovationPlan(content);
  } catch (parseErr) {
    if (!retried) {
      console.warn("Renovation plan parse failed, retrying vision call once", {
        finishReason,
        contentHead: String(content).slice(0, 160),
      });
      return callVisionPlan(apiKey, base64, locale, deskStyle, true);
    }

    if (/"isDesk"\s*:\s*false/.test(String(content))) {
      throw new NotADeskError(
        locale === "zh"
          ? "这张看起来不是工位照片，请换一张桌面/workstation 照"
          : "This doesn't look like a desk photo — try a clear workstation shot"
      );
    }

    console.warn("Using fallback renovation plan after repeated parse failure", {
      finishReason,
      err: parseErr instanceof Error ? parseErr.message : String(parseErr),
    });
    return buildFallbackPlan(locale, deskStyle);
  }

  if (!plan.isDesk) {
    throw new NotADeskError(
      plan.rejectReason?.trim() ||
        (locale === "zh"
          ? "这张看起来不是工位照片，请换一张桌面/workstation 照"
          : "This doesn't look like a desk photo — try a clear workstation shot")
    );
  }

  return plan;
}

export async function analyzeDeskRenovation(
  image: string,
  locale: AppLocale,
  deskStyle: DeskStyleId
): Promise<RenovationPlan> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("Missing DASHSCOPE_API_KEY");

  const base64 = image.startsWith("data:") ? dataUrlToBase64(image) : image;
  return callVisionPlan(apiKey, base64, locale, deskStyle);
}
