import { NextRequest, NextResponse, after } from "next/server";
import { SYSTEM_PROMPT, ANALYZE_USER_PROMPT, MOCK_REPORT } from "@/lib/prompts";
import { dataUrlToBase64 } from "@/lib/image";
import { normalizeReport } from "@/lib/report";
import { saveDeskReport } from "@/lib/stats";
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

function parseReport(content: string): DeskReport {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const candidates = [cleaned, stripTrailingCommas(cleaned)];

  for (const candidate of candidates) {
    try {
      return normalizeReport(JSON.parse(candidate) as DeskReport);
    } catch {
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return normalizeReport(JSON.parse(stripTrailingCommas(match[0])) as DeskReport);
        } catch {
          /* try next candidate */
        }
      }
    }
  }

  throw new Error("AI 返回格式无法解析");
}

async function callQwen(
  model: string,
  apiKey: string,
  base64: string
): Promise<DeskReport> {
  const res = await fetch(QWEN_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
            {
              type: "text",
              text: ANALYZE_USER_PROMPT,
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
    throw new Error(`模型 ${model} 错误: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`模型 ${model} 返回内容为空`);

  return parseReport(content);
}

async function analyzeWithQwen(image: string): Promise<DeskReport> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("Missing DASHSCOPE_API_KEY");

  const base64 = image.startsWith("data:")
    ? dataUrlToBase64(image)
    : image;

  const models = getModelCandidates();
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await callQwen(model, apiKey, base64);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Analyze with ${model} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("分析失败");
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
    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "缺少图片数据" }, { status: 400 });
    }

    const useMock =
      process.env.USE_MOCK_DATA === "true" || !process.env.DASHSCOPE_API_KEY;

    if (useMock) {
      await new Promise((r) => setTimeout(r, 1500));
      scheduleSave(MOCK_REPORT);
      return NextResponse.json({ report: MOCK_REPORT, reportId: null });
    }

    const report = await analyzeWithQwen(image);
    scheduleSave(report);
    return NextResponse.json({ report, reportId: null });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
