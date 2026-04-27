-- ============================================================
-- Part 2: vendors → suppliers にリネーム + 拡張
-- ============================================================

alter table public.vendors rename to suppliers;

do $$
begin
  if exists (select 1 from pg_indexes where indexname = 'vendors_company_id_idx') then
    execute 'alter index vendors_company_id_idx rename to suppliers_company_idx';
  end if;
end $$;

create index if not exists suppliers_company_idx on public.suppliers(company_id);

drop policy if exists "vendors_tenant_select" on public.suppliers;
drop policy if exists "vendors_tenant_insert" on public.suppliers;
drop policy if exists "vendors_tenant_update" on public.suppliers;
drop policy if exists "vendors_tenant_delete" on public.suppliers;

create policy "suppliers_tenant_select" on public.suppliers for select using (company_id = public.current_company_id());
create policy "suppliers_tenant_insert" on public.suppliers for insert with check (company_id = public.current_company_id());
create policy "suppliers_tenant_update" on public.suppliers for update using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());
create policy "suppliers_tenant_delete" on public.suppliers for delete using (company_id = public.current_company_id());

alter table public.suppliers
  add column if not exists supplier_category_id uuid references public.supplier_categories(id) on delete set null,
  add column if not exists code text,
  add column if not exists address text,
  add column if not exists memo text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_suppliers_updated_at') then
    execute 'create trigger trg_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at()';
  end if;
end $$;
