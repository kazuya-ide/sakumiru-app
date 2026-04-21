-- ============================================================
-- Initial schema for Sakumiru-like construction management SaaS
-- マルチテナント (company_id ベース) 設計
-- ============================================================

-- ========== Extensions ==========
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========== Plan tier ENUM ==========
create type plan_tier as enum ('starter', 'standard', 'business');

-- ========== Companies (テナント) ==========
create table public.companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  plan        plan_tier not null default 'starter',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ========== Memberships (user ↔ company 多対多) ==========
create type member_role as enum ('owner', 'admin', 'manager', 'worker', 'office');

create table public.memberships (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  role        member_role not null default 'worker',
  created_at  timestamptz not null default now(),
  unique (user_id, company_id)
);

create index memberships_user_idx on public.memberships(user_id);
create index memberships_company_idx on public.memberships(company_id);

-- ========== Helper: get current user's company_id ==========
-- RLS ポリシーから呼ばれる (JWT にカスタムクレームを入れないシンプル版)
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
as $$
  select company_id
  from public.memberships
  where user_id = auth.uid()
  limit 1;
$$;

-- ========== Customers (顧客) ==========
create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  contact     text,
  phone       text,
  email       text,
  address     text,
  memo        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);
create index customers_company_idx on public.customers(company_id);

-- ========== Projects (案件) ==========
create type project_status as enum ('quoting', 'active', 'completed', 'cancelled');

create table public.projects (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  code         text,
  name         text not null,
  customer_id  uuid references public.customers(id) on delete set null,
  status       project_status not null default 'quoting',
  start_date   date,
  end_date     date,
  budget       bigint default 0,
  manager_id   uuid references auth.users(id),
  memo         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id)
);
create index projects_company_idx on public.projects(company_id);
create index projects_customer_idx on public.projects(customer_id);

-- ========== Estimates (見積) - Starter ==========
create table public.estimates (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  no          text,
  issue_date  date not null default current_date,
  tax_rate    integer not null default 10,
  status      text default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.estimate_items (
  id           uuid primary key default uuid_generate_v4(),
  estimate_id  uuid not null references public.estimates(id) on delete cascade,
  name         text not null,
  qty          numeric(14,2) not null default 1,
  unit         text,
  unit_price   bigint not null default 0,
  sort_order   integer not null default 0
);

-- ========== Invoices (請求) - Starter ==========
create type invoice_status as enum ('unpaid', 'paid', 'overdue', 'void');

create table public.invoices (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  no           text,
  issue_date   date not null default current_date,
  due_date     date,
  amount       bigint not null default 0,
  status       invoice_status not null default 'unpaid',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index invoices_company_idx on public.invoices(company_id);

-- ========== Schedule (予定) - Standard ==========
create table public.schedules (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  date        date not null,
  title       text not null,
  location    text,
  memo        text,
  created_at  timestamptz not null default now()
);
create index schedules_company_date_idx on public.schedules(company_id, date);

-- ========== Construction ledger & Tasks (工程/工事台帳) - Standard ==========
create table public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
  name         text not null,
  start_date   date,
  end_date     date,
  progress     integer not null default 0 check (progress between 0 and 100),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);
create index tasks_project_idx on public.tasks(project_id);

-- ========== Files (ファイル/書類) - Standard ==========
create table public.files (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  name         text not null,
  category     text,
  storage_path text not null,   -- Supabase Storage のパス
  size_bytes   bigint,
  mime_type    text,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id)
);
create index files_company_idx on public.files(company_id);

-- ========== Daily reports (作業日報) - Standard ==========
create table public.daily_reports (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  report_date  date not null default current_date,
  weather      text,
  worker_count integer default 0,
  content      text,
  issues       text,
  author_id    uuid references auth.users(id),
  created_at   timestamptz not null default now()
);
create index daily_reports_company_date_idx on public.daily_reports(company_id, report_date);

-- ========== Photos (写真) - Standard ==========
create table public.photos (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  taken_at     date,
  tag          text,
  caption      text,
  storage_path text not null,
  created_at   timestamptz not null default now()
);
create index photos_company_idx on public.photos(company_id);

-- ========== Costs (実行予算・原価) - Business ==========
create table public.costs (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
  cost_date    date not null default current_date,
  category     text not null,
  vendor       text,
  amount       bigint not null default 0,
  memo         text,
  created_at   timestamptz not null default now()
);
create index costs_project_idx on public.costs(project_id);

-- ========== Attendance (出面) - Business ==========
create table public.workers (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  role        text,
  phone       text,
  created_at  timestamptz not null default now()
);

create table public.attendance (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  worker_id    uuid references public.workers(id) on delete set null,
  work_date    date not null default current_date,
  hours        numeric(5,2) not null default 8,
  type         text default 'day',
  created_at   timestamptz not null default now()
);
create index attendance_company_date_idx on public.attendance(company_id, work_date);

-- ========== Purchase orders (発注・仕入) - Business ==========
create table public.vendors (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  contact     text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now()
);

create table public.purchase_orders (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  vendor_id    uuid references public.vendors(id) on delete set null,
  no           text,
  order_date   date not null default current_date,
  delivery_date date,
  status       text default 'draft',
  total_amount bigint default 0,
  created_at   timestamptz not null default now()
);

create table public.purchase_order_items (
  id                  uuid primary key default uuid_generate_v4(),
  purchase_order_id   uuid not null references public.purchase_orders(id) on delete cascade,
  name                text not null,
  qty                 numeric(14,2) not null default 1,
  unit                text,
  unit_price          bigint not null default 0,
  sort_order          integer not null default 0
);

-- ========== updated_at auto trigger ==========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;
