-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

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

-- 允许服务端通过 service_role 读写（默认已绕过 RLS）
ALTER TABLE desk_reports ENABLE ROW LEVEL SECURITY;

-- 禁止客户端直接访问，所有操作走 Next.js API
CREATE POLICY "No public access" ON desk_reports
  FOR ALL
  USING (false)
  WITH CHECK (false);
