-- ============================================================
-- マスタテーブル群（サクミル準拠）
-- 全テーブル company_id スコープ + RLS 有効化
-- ============================================================

-- ========== 1. 原価分類（材料費/労務費/外注費/諸経費） ==========
create table public.cost_classifications (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  color       text,
  sort_order  integer not null default 0,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index cost_classifications_company_idx on public.cost_classifications(company_id);

-- ========== 2. 原価種別（cost_classification の下位階層） ==========
create table public.cost_categories (
  id                      uuid primary key default uuid_generate_v4(),
  company_id              uuid not null references public.companies(id) on delete cascade,
  cost_classification_id  uuid references public.cost_classifications(id) on delete set null,
  name                    text not null,
  code                    text,
  sort_order              integer not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (company_id, name)
);
create index cost_categories_company_idx on public.cost_categories(company_id);

-- ========== 3. 工種 ==========
create table public.construction_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  code        text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index construction_categories_company_idx on public.construction_categories(company_id);

-- ========== 4. 商品分類 ==========
create table public.product_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index product_categories_company_idx on public.product_categories(company_id);

-- ========== 5. 商品 ==========
create table public.products (
  id                   uuid primary key default uuid_generate_v4(),
  company_id           uuid not null references public.companies(id) on delete cascade,
  product_category_id  uuid references public.product_categories(id) on delete set null,
  code                 text,
  name                 text not null,
  specification        text,
  unit                 text,
  unit_price           bigint default 0,
  cost_price           bigint default 0,
  memo                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index products_company_idx on public.products(company_id);

-- ========== 6. 仕入先種別 ==========
create table public.supplier_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index supplier_categories_company_idx on public.supplier_categories(company_id);

-- ========== 7. 単位（式/個/人工 等） ==========
create table public.units (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index units_company_idx on public.units(company_id);

-- ========== 8. 人工単価 ==========
create table public.person_day_unit_prices (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  unit_price  bigint not null default 0,
  effective_from date,
  effective_to   date,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index person_day_unit_prices_company_idx on public.person_day_unit_prices(company_id);

-- ========== 9. 案件種別 ==========
create table public.project_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  color       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index project_categories_company_idx on public.project_categories(company_id);

-- ========== 10. 案件ステータス（カスタマイズ可、デフォルト7値） ==========
create table public.project_statuses (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  color       text,
  sort_order  integer not null default 0,
  is_default  boolean not null default false,
  is_completed_status boolean not null default false,  -- 完了系ステータスか
  is_lost_status      boolean not null default false,  -- 失注系ステータスか
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index project_statuses_company_idx on public.project_statuses(company_id);

-- ========== 11. 顧客種別（法人/個人 等） ==========
create table public.client_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index client_categories_company_idx on public.client_categories(company_id);

-- ========== 12. タスク種別 ==========
create table public.task_categories (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  color       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index task_categories_company_idx on public.task_categories(company_id);

-- ========== 13. 予定の色マスタ ==========
create table public.event_colors (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  color       text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, name)
);
create index event_colors_company_idx on public.event_colors(company_id);

-- ========== 14. 車両・備品（予定で割り当て） ==========
create table public.event_resources (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  resource_type text,  -- 'vehicle' / 'equipment'
  memo        text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index event_resources_company_idx on public.event_resources(company_id);

-- ========== 15. 祝日マスタ ==========
create table public.holidays (
  id          uuid primary key default uuid_generate_v4(),
  date        date not null,
  name        text not null,
  unique (date)
);
create index holidays_date_idx on public.holidays(date);

-- ========== RLS 有効化 ==========
alter table public.cost_classifications     enable row level security;
alter table public.cost_categories          enable row level security;
alter table public.construction_categories  enable row level security;
alter table public.product_categories       enable row level security;
alter table public.products                 enable row level security;
alter table public.supplier_categories      enable row level security;
alter table public.units                    enable row level security;
alter table public.person_day_unit_prices   enable row level security;
alter table public.project_categories       enable row level security;
alter table public.project_statuses         enable row level security;
alter table public.client_categories        enable row level security;
alter table public.task_categories          enable row level security;
alter table public.event_colors             enable row level security;
alter table public.event_resources          enable row level security;
alter table public.holidays                 enable row level security;

-- ========== company_id スコープ RLS ポリシー（一括適用） ==========
do $$
declare
  tbl text;
  tables text[] := array[
    'cost_classifications','cost_categories','construction_categories',
    'product_categories','products','supplier_categories','units',
    'person_day_unit_prices','project_categories','project_statuses',
    'client_categories','task_categories','event_colors','event_resources'
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

-- ========== 祝日は全社共通（読み取りは全許可、書き込みは admin のみ） ==========
create policy "holidays_select_all" on public.holidays
  for select
  using (true);

create policy "holidays_admin_insert" on public.holidays
  for insert
  with check (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

create policy "holidays_admin_update" on public.holidays
  for update
  using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- ========== updated_at 自動トリガー（既存トリガーがあるテーブルにのみ追加） ==========
do $$
declare
  t text;
begin
  for t in
    select table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'updated_at'
      and table_name in (
        'cost_classifications','cost_categories','construction_categories',
        'product_categories','products','supplier_categories','units',
        'person_day_unit_prices','project_categories','project_statuses',
        'client_categories','task_categories','event_colors','event_resources'
      )
  loop
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;
