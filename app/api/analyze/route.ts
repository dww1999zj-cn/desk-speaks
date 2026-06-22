import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, MOCK_REPORT } from "@/lib/prompts";
import { dataUrlToBase64 } from "@/lib/image";
import { saveDeskReport } from "@/lib/stats";
import type { DeskReport } from "@/lib/types";
const QWEN_API_BASE =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

function parseReport(content: string): DeskReport {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as DeskReport;
}

async function analyzeWithQwen(image: string): Promise<DeskReport> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("Missing DASHSCOPE_API_KEY");

  const model = process.env.QWEN_VL_MODEL ?? "qwen-vl-plus";

  const base64 = image.startsWith("data:")
    ? dataUrlToBase64(image)
    : image;

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
              text: "请观察这张工位照片，以工位第一人称生成人格档案 JSON。",
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`通义千问 API 错误: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("通义千问返回内容为空");

  return parseReport(content);
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
      await new Promise((r) => setTimeout(r, 2000));
      const reportId = await saveDeskReport(MOCK_REPORT);
      return NextResponse.json({ report: MOCK_REPORT, reportId });
    }

    const report = await analyzeWithQwen(image);
    const reportId = await saveDeskReport(report);
    return NextResponse.json({ report, reportId });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
