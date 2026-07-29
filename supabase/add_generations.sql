-- 若 desk_reports 已建好，只需执行本文件（新增 generations 表）

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
