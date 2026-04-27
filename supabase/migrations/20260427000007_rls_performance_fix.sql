-- ============================================================
-- RLS パフォーマンス改善（auth_rls_initplan 警告対応）
--
-- 問題: auth.uid() を直接書くと各行ごとに評価される（O(N)）
-- 解決: (select auth.uid()) でラップすると 1 回だけ評価される（O(1)）
--
-- Supabase 公式推奨パターン:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================================

-- ========== companies.company_update_owner ==========
drop policy if exists "company_update_owner" on public.companies;

create policy "company_update_owner" on public.companies
  for update
  using (
    id = public.current_company_id()
    and exists (
      select 1 from public.memberships m
      where m.user_id = (select auth.uid())
        and m.company_id = public.companies.id
        and m.role in ('owner', 'admin')
    )
  );

-- ========== memberships.membership_insert ==========
drop policy if exists "membership_insert" on public.memberships;

create policy "membership_insert" on public.memberships
  for insert
  with check (
    company_id = public.current_company_id()
    and exists (
      select 1 from public.memberships m
      where m.user_id = (select auth.uid())
        and m.company_id = public.memberships.company_id
        and m.role in ('owner', 'admin')
    )
  );

-- ========== memberships.membership_select ==========
drop policy if exists "membership_select" on public.memberships;

create policy "membership_select" on public.memberships
  for select
  using (user_id = (select auth.uid()));

-- ========== holidays.holidays_admin_insert ==========
drop policy if exists "holidays_admin_insert" on public.holidays;

create policy "holidays_admin_insert" on public.holidays
  for insert
  with check (
    exists (
      select 1 from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin')
    )
  );

-- ========== holidays.holidays_admin_update ==========
drop policy if exists "holidays_admin_update" on public.holidays;

create policy "holidays_admin_update" on public.holidays
  for update
  using (
    exists (
      select 1 from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin')
    )
  );
