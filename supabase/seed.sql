-- ============================================================
-- ローカル開発用シードデータ
-- supabase db reset で実行される
-- ※ auth.users は手動で作成してください (Supabase Studio から)
-- ============================================================

-- サンプル会社を作成
insert into public.companies (id, name, plan) values
  ('11111111-1111-1111-1111-111111111111', 'サンプル建設株式会社', 'standard')
on conflict (id) do nothing;

-- サンプル顧客
insert into public.customers (company_id, name, contact, phone, email, address) values
  ('11111111-1111-1111-1111-111111111111', '株式会社山田工務店', '山田 太郎', '03-1234-5678', 'yamada@example.com', '東京都新宿区1-1-1'),
  ('11111111-1111-1111-1111-111111111111', '佐藤不動産', '佐藤 花子', '080-1111-2222', 'sato@example.com', '東京都渋谷区2-2-2'),
  ('11111111-1111-1111-1111-111111111111', '田中建築事務所', '田中 一郎', '090-3333-4444', 'tanaka@example.com', '神奈川県横浜市3-3-3');

-- サンプル案件
insert into public.projects (company_id, code, name, status, start_date, end_date, budget) values
  ('11111111-1111-1111-1111-111111111111', 'P-2026-001', '新宿区マンション改修工事', 'active', current_date - 10, current_date + 30, 12000000),
  ('11111111-1111-1111-1111-111111111111', 'P-2026-002', '渋谷区戸建て新築', 'quoting', current_date + 5, current_date + 120, 35000000),
  ('11111111-1111-1111-1111-111111111111', 'P-2026-003', '横浜市オフィス内装', 'completed', current_date - 60, current_date - 5, 8500000);
