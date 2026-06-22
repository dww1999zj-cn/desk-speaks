import type { DeskReport, DeskStats } from "./types";
import { getSupabaseAdmin } from "./supabase";

const MIN_SIMILAR_OVERLAP = 2;

function countOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

export async function saveDeskReport(report: DeskReport): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("desk_reports")
    .insert({
      traits: report.traits,
      cover_subtitle: report.cover.subtitle,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase save error:", error);
    return null;
  }

  return data.id;
}

export async function getDeskStats(
  userTraits: string[],
  excludeId?: string | null
): Promise<DeskStats | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("desk_reports")
    .select("id, traits");

  if (error || !data) {
    console.error("Supabase stats error:", error);
    return null;
  }

  const allRows = data;
  const otherRows = excludeId
    ? data.filter((row) => row.id !== excludeId)
    : data;

  const totalUsers = allRows.length;
  const othersCount = otherRows.length;

  if (totalUsers === 0) {
    return {
      totalUsers: 0,
      traitStats: userTraits.map((trait) => ({ trait, percentage: 0 })),
      similarCount: 0,
      similarPercentage: 0,
    };
  }

  const traitStats = userTraits.map((trait) => {
    const count = allRows.filter((row) => row.traits.includes(trait)).length;
    return {
      trait,
      percentage: Math.round((count / totalUsers) * 100),
    };
  });

  const similarCount = otherRows.filter(
    (row) => countOverlap(userTraits, row.traits) >= MIN_SIMILAR_OVERLAP
  ).length;

  return {
    totalUsers,
    traitStats,
    similarCount,
    similarPercentage:
      othersCount > 0 ? Math.round((similarCount / othersCount) * 100) : 0,
  };
}
