import { NextRequest, NextResponse, after } from "next/server";
import { getPrompts } from "@/lib/prompts/index";
import { dataUrlToBase64 } from "@/lib/image";
import { normalizeReport } from "@/lib/report";
import { saveDeskReport } from "@/lib/stats";
import { resolveLocale } from "@/lib/i18n/locale";
import type { DeskReport } from "@/lib/types";

export const maxDuration = 60;

const QWEN_API_BASE =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const FALLBACK_MODEL = "qwen-vl-plus";

function getModelCandidates(): string[] {
  const preferred = process.env.QWEN_VL_MODEL ?? FALLBACK_MODEL;
  if (preferred === FALLBACK_MODEL) return [FALLBACK_MODEL];
  return [preferred, FALLBACK_MODEL];
}

function stripTrailingCommas(json: string): string {
  return json.replace(/,\s*([}\]])/g, "$1");
}

function parseReport(content: string, locale: ReturnType<typeof resolveLocale>): DeskReport {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const candidates = [cleaned, stripTrailingCommas(cleaned)];

  for (const candidate of candidates) {
    try {
      return normalizeReport(JSON.parse(candidate) as DeskReport, locale);
    } catch {
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return normalizeReport(
            JSON.parse(stripTrailingCommas(match[0])) as DeskReport,
            locale
          );
        } catch {
          /* try next candidate */
        }
      }
    }
  }

  throw new Error("AI response parse failed");
}

async function callQwen(
  model: string,
  apiKey: string,
  base64: string,
  locale: ReturnType<typeof resolveLocale>
): Promise<DeskReport> {
  const { systemPrompt, userPrompt } = getPrompts(locale);

  const res = await fetch(QWEN_API_BASE, {
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
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
      max_tokens: 1400,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Model ${model} error: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Model ${model} returned empty content`);

  return parseReport(content, locale);
}

async function analyzeWithQwen(
  image: string,
  locale: ReturnType<typeof resolveLocale>
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
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Analyze with ${model} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Analyze failed");
}

function scheduleSave(report: DeskReport) {
  after(async () => {
    try {
      await saveDeskReport(report);
    } catch (err) {
      console.error("Background save error:", err);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { image, locale: localeRaw } = await req.json();
    const locale = resolveLocale(localeRaw);

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const useMock =
      process.env.USE_MOCK_DATA === "true" || !process.env.DASHSCOPE_API_KEY;

    if (useMock) {
      await new Promise((r) => setTimeout(r, 1500));
      const mockReport = getPrompts(locale).mockReport;
      scheduleSave(mockReport);
      return NextResponse.json({ report: mockReport, reportId: null, locale });
    }

    const report = await analyzeWithQwen(image, locale);
    scheduleSave(report);
    return NextResponse.json({ report, reportId: null, locale });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed, please try again later" },
      { status: 500 }
    );
  }
}
