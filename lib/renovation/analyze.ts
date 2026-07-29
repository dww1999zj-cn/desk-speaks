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

async function callVisionPlan(
  apiKey: string,
  base64: string,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  retried = false
): Promise<RenovationPlan> {
  const { systemPrompt, userPrompt } = getRenovationPrompts(locale, deskStyle);
  const styleHint = getDeskStyleQwenHint(deskStyle, locale);

  const res = await fetchWithRetry(QWEN_API_BASE, {
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
            { type: "text", text: `${userPrompt}\n${styleHint}` },
          ],
        },
      ],
      max_tokens: 2200,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`Vision plan error: ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty vision response");

  let plan: RenovationPlan;
  try {
    plan = parseRenovationPlan(content);
  } catch (parseErr) {
    if (!retried && data.choices?.[0]?.finish_reason === "length") {
      console.warn("Renovation plan truncated, retrying vision call once");
      return callVisionPlan(apiKey, base64, locale, deskStyle, true);
    }
    throw parseErr;
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
