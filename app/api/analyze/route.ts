import { NextRequest, NextResponse, after } from "next/server";
import { resolveLocale } from "@/lib/i18n/locale";
import { resolveDeskStyle, getDeskStyleLabel } from "@/lib/renovation";
import { planToResult } from "@/lib/renovation/parse";
import {
  MOCK_RENOVATION_ZH,
  MOCK_RENOVATION_EN,
} from "@/lib/renovation/prompts";
import type { RenovationResult } from "@/lib/renovation";

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

    const { analyzeDeskRenovation, generateRenovationImage, NotADeskError } =
      await import("@/lib/renovation/server");

    const apiKey = process.env.DASHSCOPE_API_KEY!;
    try {
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
          const { recordGeneration } = await import("@/lib/generation-stats");
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
            message: (error as { reason: string }).reason,
          },
          { status: 422 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Renovation error:", error);
    return NextResponse.json(
      { error: "Analysis failed, please try again later" },
      { status: 500 }
    );
  }
}
