-- 在 Supabase Dashboard → SQL Editor 中执行
-- 可重复运行：已存在的表/策略不会报错

-- ── desk_reports（工位人格，已有则跳过）────────────────────────
CREATE TABLE IF NOT EXISTS desk_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traits TEXT[] NOT NULL,
  cover_subtitle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_desk_reports_traits
  ON desk_reports USING GIN (traits);

CREATE INDEX IF NOT EXISTS idx_desk_reports_created_at
  ON desk_reports (created_at DESC);

ALTER TABLE desk_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access" ON desk_reports;
CREATE POLICY "No public access" ON desk_reports
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── generations（改造 + 人格计数，2000 基数用）──────────────────
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('persona', 'renovation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_created_at
  ON generations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generations_kind
  ON generations (kind);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access on generations" ON generations;
CREATE POLICY "No public access on generations" ON generations
  FOR ALL
  USING (false)
  WITH CHECK (false);
