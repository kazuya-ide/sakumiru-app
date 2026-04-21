-- ============================================================
-- Row Level Security policies
-- 全テーブルで「自社のデータしか見えない」を強制する
-- ============================================================

-- ========== Enable RLS ==========
alter table public.companies            enable row level security;
alter table public.memberships          enable row level security;
alter table public.customers            enable row level security;
alter table public.projects             enable row level security;
alter table public.estimates            enable row level security;
alter table public.estimate_items       enable row level security;
alter table public.invoices             enable row level security;
alter table public.schedules            enable row level security;
alter table public.tasks                enable row level security;
alter table public.files                enable row level security;
alter table public.daily_reports        enable row level security;
alter table public.photos               enable row level security;
alter table public.costs                enable row level security;
alter table public.workers              enable row level security;
alter table public.attendance           enable row level security;
alter table public.vendors              enable row level security;
alter table public.purchase_orders      enable row level security;
alter table public.purchase_order_items enable row level security;

-- ========== Companies (自社のみ閲覧可) ==========
create policy "company_select" on public.companies
  for select
  using (id = public.current_company_id());

create policy "company_update_owner" on public.companies
  for update
  using (
    id = public.current_company_id()
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.company_id = public.companies.id
        and m.role in ('owner', 'admin')
    )
  );

-- ========== Memberships ==========
-- 自社の membership は全員閲覧可 (だれがいるか)、追加削除は owner/admin
create policy "membership_select" on public.memberships
  for select
  using (company_id = public.current_company_id());

create policy "membership_insert" on public.memberships
  for insert
  with check (
    company_id = public.current_company_id()
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.company_id = public.memberships.company_id
        and m.role in ('owner', 'admin')
    )
  );

-- ========== 共通テンプレート: company_id スコープ ==========
-- 以下のテーブルは全て「自社データのみ select / insert / update / delete」
do $$
declare
  tbl text;
  tables text[] := array[
    'customers','projects','estimates','invoices',
    'schedules','tasks','files','daily_reports','photos',
    'costs','workers','attendance','vendors','purchase_orders'
  ];
begin
  foreach tbl in array tables
  loop
    execute format(
      'create policy "%I_tenant_select" on public.%I for select using (company_id = public.current_company_id());',
      tbl, tbl
    );
    execute format(
      'create policy "%I_tenant_insert" on public.%I for insert with check (company_id = public.current_company_id());',
      tbl, tbl
    );
    execute format(
      'create policy "%I_tenant_update" on public.%I for update using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());',
      tbl, tbl
    );
    execute format(
      'create policy "%I_tenant_delete" on public.%I for delete using (company_id = public.current_company_id());',
      tbl, tbl
    );
  end loop;
end $$;

-- ========== 子テーブル (company_id を持たない) ==========
-- estimate_items: 親 estimate 経由で判定
create policy "estimate_items_tenant" on public.estimate_items
  for all
  using (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_items.estimate_id
        and e.company_id = public.current_company_id()
    )
  )
  with check (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_items.estimate_id
        and e.company_id = public.current_company_id()
    )
  );

-- purchase_order_items: 親 purchase_order 経由で判定
create policy "purchase_order_items_tenant" on public.purchase_order_items
  for all
  using (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_items.purchase_order_id
        and po.company_id = public.current_company_id()
    )
  )
  with check (
    exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_items.purchase_order_id
        and po.company_id = public.current_company_id()
    )
  );
