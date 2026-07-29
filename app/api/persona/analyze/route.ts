import { NextRequest, NextResponse, after } from "next/server";
import { getPrompts } from "@/lib/prompts/index";
import { resolveLocale } from "@/lib/i18n/locale";
import { analyzeDeskPersona } from "@/lib/persona/analyze";
import { saveDeskReport } from "@/lib/stats";
import type { DeskReport } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function scheduleSave(report: DeskReport) {
  after(async () => {
    try {
      await saveDeskReport(report);
    } catch (err) {
      console.error("Background persona save error:", err);
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

    const report = await analyzeDeskPersona(image, locale);
    scheduleSave(report);
    return NextResponse.json({ report, reportId: null, locale });
  } catch (error) {
    console.error("Persona analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed, please try again later" },
      { status: 500 }
    );
  }
}
