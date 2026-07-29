import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/** Public-facing baseline so early counts don't look empty. */
export const GENERATION_COUNT_BASE = 2000;

export type GenerationKind = "persona" | "renovation";

export interface GenerationCountResult {
  enabled: boolean;
  base: number;
  actual: number;
  displayCount: number;
}

export async function recordGeneration(kind: GenerationKind): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("generations").insert({ kind });
  if (error) {
    console.error("Generation record error:", error);
  }
}

export async function getGenerationCount(): Promise<GenerationCountResult> {
  const base = GENERATION_COUNT_BASE;

  if (!isSupabaseConfigured()) {
    return { enabled: false, base, actual: 0, displayCount: base };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { enabled: false, base, actual: 0, displayCount: base };
  }

  const { count, error } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Generation count error:", error);
    return { enabled: true, base, actual: 0, displayCount: base };
  }

  const actual = count ?? 0;
  return {
    enabled: true,
    base,
    actual,
    displayCount: base + actual,
  };
}
