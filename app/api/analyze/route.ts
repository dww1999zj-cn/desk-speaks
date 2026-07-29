import { NextRequest, NextResponse, after } from "next/server";
import { resolveLocale } from "@/lib/i18n/locale";
import {
  analyzeDeskRenovation,
  generateRenovationImage,
  NotADeskError,
  planToResult,
  MOCK_RENOVATION_ZH,
  MOCK_RENOVATION_EN,
} from "@/lib/renovation/server";
import { resolveDeskStyle, getDeskStyleLabel } from "@/lib/renovation";
import type { RenovationResult } from "@/lib/renovation";
import { recordGeneration } from "@/lib/generation-stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { image, locale: localeRaw, deskStyle: deskStyleRaw } = await req.json();
    const locale = resolveLocale(localeRaw);
    const deskStyle = resolveDeskStyle(deskStyleRaw);

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const useMock =
      process.env.USE_MOCK_DATA === "true" || !process.env.DASHSCOPE_API_KEY;

    const styleLabel = getDeskStyleLabel(deskStyle, locale);

    if (useMock) {
      await new Promise((r) => setTimeout(r, 1800));
      const mock =
        locale === "en" ? { ...MOCK_RENOVATION_EN } : { ...MOCK_RENOVATION_ZH };
      const renovation: RenovationResult = planToResult(
        { isDesk: true, ...mock, style: styleLabel },
        null,
        styleLabel,
        locale
      );
      return NextResponse.json({ renovation, locale, deskStyle });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY!;
    const plan = await analyzeDeskRenovation(image, locale, deskStyle);

    const renovatedImage = await generateRenovationImage(
      apiKey,
      image,
      plan,
      locale,
      deskStyle
    );

    const renovation = planToResult(plan, renovatedImage, styleLabel, locale);

    after(async () => {
      try {
        await recordGeneration("renovation");
      } catch (err) {
        console.error("Background renovation count error:", err);
      }
    });

    return NextResponse.json({
      renovation,
      locale,
      deskStyle,
      imageSkipped: renovatedImage === null,
    });
  } catch (error) {
    if (error instanceof NotADeskError) {
      return NextResponse.json(
        {
          error: "not_desk",
          message: error.reason,
        },
        { status: 422 }
      );
    }
    console.error("Renovation error:", error);
    return NextResponse.json(
      { error: "Analysis failed, please try again later" },
      { status: 500 }
    );
  }
}
