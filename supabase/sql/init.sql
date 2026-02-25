-- AI 八字缘分测算 - Supabase 数据库初始化
-- 在 Supabase SQL Editor 中执行

-- 1. 创建 KV Store 表
CREATE TABLE IF NOT EXISTS kv_store_661ddcd5 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- 2. 启用 RLS (可选，如果需要的话)
-- ALTER TABLE kv_store_661ddcd5 ENABLE ROW LEVEL SECURITY;

-- 3. 创建免费的体验激活码 (5次有效期30天)
INSERT INTO kv_store_661ddcd5 (key, value) VALUES
('code:TEST-0001', '{"code":"TEST-0001","type":"free","total_uses":5,"used_count":0,"expires_at":"2026-03-20T00:00:00Z","note":"免费体验码"}'::jsonb),
('code:TEST-0002', '{"code":"TEST-0002","type":"free","total_uses":5,"used_count":0,"expires_at":"2026-03-20T00:00:00Z","note":"免费体验码"}'::jsonb),
('code:TEST-0003', '{"code":"TEST-0003","type":"free","total_uses":5,"used_count":0,"expires_at":"2026-03-20T00:00:00Z","note":"免费体验码"}'::jsonb),
('code:TEST-0004', '{"code":"TEST-0004","type":"free","total_uses":5,"used_count":0,"expires_at":"2026-03-20T00:00:00Z","note":"免费体验码"}'::jsonb),
('code:TEST-0005', '{"code":"TEST-0005","type":"free","total_uses":5,"used_count":0,"expires_at":"2026-03-20T00:00:00Z","note":"免费体验码"}'::jsonb);

-- 4. 创建完整版激活码 (10次有效期90天)
INSERT INTO kv_store_661ddcd5 (key, value) VALUES
('code:FULL-001', '{"code":"FULL-001","type":"full","total_uses":10,"used_count":0,"expires_at":"2026-05-20T00:00:00Z","note":"完整版激活码"}'::jsonb),
('code:FULL-002', '{"code":"FULL-002","type":"full","total_uses":10,"used_count":0,"expires_at":"2026-05-20T00:00:00Z","note":"完整版激活码"}'::jsonb),
('code:FULL-003', '{"code":"FULL-003","type":"full","total_uses":10,"used_count":0,"expires_at":"2026-05-20T00:00:00Z","note":"完整版激活码"}'::jsonb);

-- 5. 创建无限次激活码 (有效期1年)
INSERT INTO kv_store_661ddcd5 (key, value) VALUES
('code:VIP001', '{"code":"VIP001","type":"unlimited","total_uses":99999,"used_count":0,"expires_at":"2027-02-20T00:00:00Z","note":"无限次激活码"}'::jsonb),
('code:VIP002', '{"code":"VIP002","type":"unlimited","total_uses":99999,"used_count":0,"expires_at":"2027-02-20T00:00:00Z","note":"无限次激活码"}'::jsonb);

-- 验证插入结果
SELECT key, value->>'code' as code, value->>'type' as type, value->>'total_uses' as total, value->>'used_count' as used FROM kv_store_661ddcd5 WHERE key LIKE 'code:%';
