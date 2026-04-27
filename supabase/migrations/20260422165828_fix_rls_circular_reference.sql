-- ============================================================
-- RLS循環参照の修正
-- - current_company_id() に search_path = public を追加（セキュリティ）
-- - memberships の select ポリシーを user_id 直接判定に変更（循環解消）
-- ============================================================

-- current_company_id に search_path を追加
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from public.memberships
  where user_id = auth.uid()
  limit 1;
$$;

-- 循環参照を解消: memberships の select は user_id で直接判定
drop policy if exists "membership_select" on public.memberships;

create policy "membership_select" on public.memberships
  for select
  using (user_id = auth.uid());
