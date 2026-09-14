import { NextRequest, NextResponse, after } from "next/server";
import { getPrompts } from "@/lib/prompts/index";
import { resolveLocale } from "@/lib/i18n/locale";
import type { DeskReport } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function scheduleSave(report: DeskReport) {
  after(async () => {
    try {
      const { saveDeskReport } = await import("@/lib/stats");
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

    // Mock only when explicitly enabled. Missing API key must not silently
    // return the same canned report for every photo.
    if (process.env.USE_MOCK_DATA === "true") {
      await new Promise((r) => setTimeout(r, 1500));
      const { normalizeReport } = await import("@/lib/report");
      const mockReport = normalizeReport(getPrompts(locale).mockReport, locale);
      scheduleSave(mockReport);
      return NextResponse.json({ report: mockReport, reportId: null, locale });
    }

    if (!process.env.DASHSCOPE_API_KEY) {
      console.error("Persona analyze blocked: DASHSCOPE_API_KEY is not set");
      return NextResponse.json(
        { error: "Analysis service is not configured" },
        { status: 503 }
      );
    }

    const { analyzeDeskPersona } = await import("@/lib/persona/analyze");
    const report = await analyzeDeskPersona(image, locale);
    scheduleSave(report);
    return NextResponse.json({ report, reportId: null, locale });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "NotADeskError"
    ) {
      return NextResponse.json(
        {
          error: "not_desk",
          message:
            error instanceof Error ? error.message : "Not a desk photo",
        },
        { status: 422 }
      );
    }
    console.error("Persona analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed, please try again later" },
      { status: 500 }
    );
  }
}
