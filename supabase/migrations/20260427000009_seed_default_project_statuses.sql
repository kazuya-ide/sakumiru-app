-- ============================================================
-- デフォルト案件ステータス7値・原価分類4値を投入
-- + sign-up trigger 拡張：新規会社作成時に自動投入
-- サクミル準拠
-- ============================================================

-- 既存全会社に7ステータス投入（冪等）
insert into public.project_statuses (company_id, name, color, sort_order, is_default, is_completed_status, is_lost_status)
select
  c.id,
  s.name,
  s.color,
  s.sort_order,
  true,
  s.is_completed,
  s.is_lost
from public.companies c
cross join (values
  ('新規',          '#9CA3AF', 1, false, false),
  ('見積提出済み',  '#60A5FA', 2, false, false),
  ('受注',          '#34D399', 3, false, false),
  ('段取り済み',    '#FBBF24', 4, false, false),
  ('着手済み',      '#F97316', 5, false, false),
  ('完了',          '#10B981', 6, true,  false),
  ('失注',          '#EF4444', 7, false, true)
) as s(name, color, sort_order, is_completed, is_lost)
on conflict (company_id, name) do nothing;

-- 既存会社に原価分類4値投入（冪等）
insert into public.cost_classifications (company_id, name, color, sort_order, is_default)
select c.id, s.name, s.color, s.sort_order, true
from public.companies c
cross join (values
  ('材料費', '#3B82F6', 1),
  ('労務費', '#EF4444', 2),
  ('外注費', '#10B981', 3),
  ('諸経費', '#6B7280', 4)
) as s(name, color, sort_order)
on conflict (company_id, name) do nothing;

-- sign-up trigger 拡張：新規ユーザー登録時に
-- (1) 会社作成 (2) owner として membership 作成 (3) デフォルトマスタ投入
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  insert into public.companies (name, plan)
  values (
    coalesce(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1) || 'の会社'),
    'starter'
  )
  returning id into new_company_id;

  insert into public.memberships (user_id, company_id, role)
  values (new.id, new_company_id, 'owner');

  -- デフォルト案件ステータス7値
  insert into public.project_statuses (company_id, name, color, sort_order, is_default, is_completed_status, is_lost_status) values
    (new_company_id, '新規',         '#9CA3AF', 1, true, false, false),
    (new_company_id, '見積提出済み', '#60A5FA', 2, true, false, false),
    (new_company_id, '受注',         '#34D399', 3, true, false, false),
    (new_company_id, '段取り済み',   '#FBBF24', 4, true, false, false),
    (new_company_id, '着手済み',     '#F97316', 5, true, false, false),
    (new_company_id, '完了',         '#10B981', 6, true, true,  false),
    (new_company_id, '失注',         '#EF4444', 7, true, false, true);

  -- デフォルト原価分類4値
  insert into public.cost_classifications (company_id, name, color, sort_order, is_default) values
    (new_company_id, '材料費', '#3B82F6', 1, true),
    (new_company_id, '労務費', '#EF4444', 2, true),
    (new_company_id, '外注費', '#10B981', 3, true),
    (new_company_id, '諸経費', '#6B7280', 4, true);

  return new;
end;
$$;
