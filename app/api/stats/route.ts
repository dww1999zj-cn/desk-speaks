import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET — homepage total: 2000 + actual generations */
export async function GET() {
  try {
    const { getGenerationCount } = await import("@/lib/generation-stats");
    const stats = await getGenerationCount();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Generation count error:", error);
    return NextResponse.json(
      { enabled: false, base: 2000, actual: 0, displayCount: 2000 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { traits, excludeId } = await req.json();

    if (!traits || !Array.isArray(traits) || traits.length === 0) {
      return NextResponse.json({ error: "缺少 traits 数据" }, { status: 400 });
    }

    const { isSupabaseConfigured } = await import("@/lib/supabase");
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ enabled: false, stats: null });
    }

    const { getDeskStats } = await import("@/lib/stats");
    const stats = await getDeskStats(traits, excludeId);

    if (!stats) {
      return NextResponse.json(
        { error: "统计数据获取失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ enabled: true, stats });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "统计服务异常" },
      { status: 500 }
    );
  }
}
