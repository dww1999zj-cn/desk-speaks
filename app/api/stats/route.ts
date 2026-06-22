import { NextRequest, NextResponse } from "next/server";
import { getDeskStats } from "@/lib/stats";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { traits, excludeId } = await req.json();

    if (!traits || !Array.isArray(traits) || traits.length === 0) {
      return NextResponse.json({ error: "缺少 traits 数据" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ enabled: false, stats: null });
    }

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
