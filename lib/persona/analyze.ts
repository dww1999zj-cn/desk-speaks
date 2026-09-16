import "server-only";

import type { AppLocale } from "@/lib/i18n/locale";
import { dataUrlToBase64 } from "@/lib/image";
import { getPrompts } from "@/lib/prompts/index";
import { normalizeReport } from "@/lib/report";
import { fetchWithRetry } from "@/lib/renovation/fetch-retry";
import type { DeskReport } from "@/lib/types";

const QWEN_API_BASE =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const FALLBACK_MODEL = "qwen-vl-plus";

export class NotADeskError extends Error {
  readonly rejectReason: string;

  constructor(message: string, rejectReason = "") {
    super(message);
    this.name = "NotADeskError";
    this.rejectReason = rejectReason;
  }
}

function getModelCandidates(): string[] {
  const preferred = process.env.QWEN_VL_MODEL ?? FALLBACK_MODEL;
  if (preferred === FALLBACK_MODEL) return [FALLBACK_MODEL];
  return [preferred, FALLBACK_MODEL];
}

function stripTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1");
}

function assertIsDesk(raw: unknown, locale: AppLocale): void {
  const obj = raw as { isDesk?: unknown; rejectReason?: unknown };
  const isDesk =
    obj?.isDesk === true ||
    obj?.isDesk === "true" ||
    obj?.isDesk === 1;

  if (isDesk) return;

  if (
    obj?.isDesk === false ||
    obj?.isDesk === "false" ||
    obj?.isDesk === 0 ||
    /"isDesk"\s*:\s*false/.test(JSON.stringify(raw))
  ) {
    const reason =
      typeof obj.rejectReason === "string" && obj.rejectReason.trim()
        ? obj.rejectReason.trim()
        : locale === "zh"
          ? "这张看起来不是工位照片，请换一张桌面/工位照"
          : "This doesn't look like a desk photo — try a clear workstation shot";
    throw new NotADeskError(reason, reason);
  }
}

function parseReport(content: string, locale: AppLocale): DeskReport {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const candidates = [cleaned, stripTrailingCommas(cleaned)];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      assertIsDesk(parsed, locale);
      return normalizeReport(parsed as Partial<DeskReport>, locale);
    } catch (err) {
      if (err instanceof NotADeskError) throw err;
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(
            stripTrailingCommas(match[0])
          ) as Record<string, unknown>;
          assertIsDesk(parsed, locale);
          return normalizeReport(parsed as Partial<DeskReport>, locale);
        } catch (inner) {
          if (inner instanceof NotADeskError) throw inner;
        }
      }
    }
  }

  // Explicit reject string without full parse
  if (/"isDesk"\s*:\s*false/.test(cleaned)) {
    throw new NotADeskError(
      locale === "zh"
        ? "这张看起来不是工位照片，请换一张桌面/工位照"
        : "This doesn't look like a desk photo — try a clear workstation shot"
    );
  }

  throw new Error("Persona response parse failed");
}

async function callQwen(
  model: string,
  apiKey: string,
  base64: string,
  locale: AppLocale
): Promise<DeskReport> {
  const { systemPrompt, userPrompt } = getPrompts(locale);

  const res = await fetchWithRetry(
    QWEN_API_BASE,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
              { type: "text", text: userPrompt },
            ],
          },
        ],
        max_tokens: 1200,
        temperature: 0.9,
        response_format: { type: "json_object" },
      }),
    },
    // Persona must finish inside Zeabur maxDuration; avoid 5×90s hangs
    { retries: 2, timeoutMs: 45_000 }
  );

  if (!res.ok) {
    throw new Error(`Model ${model} error: ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Model ${model} returned empty content`);

  return parseReport(content, locale);
}

export async function analyzeDeskPersona(
  image: string,
  locale: AppLocale
): Promise<DeskReport> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("Missing DASHSCOPE_API_KEY");

  const base64 = image.startsWith("data:") ? dataUrlToBase64(image) : image;
  const models = getModelCandidates();
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await callQwen(model, apiKey, base64, locale);
    } catch (err) {
      if (err instanceof NotADeskError) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Persona analyze with ${model} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Persona analyze failed");
}
