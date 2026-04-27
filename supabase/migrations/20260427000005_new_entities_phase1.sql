-- ============================================================
-- Phase 1 必須エンティティ（サクミル準拠）
-- sites / customer_contacts / project_assignees / contracts
-- quotation_send_history / invoice_send_history
-- photo_albums / file_folders
-- ============================================================

-- ========== 1. 作業場所（sites）==========
create table public.sites (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  code        text,
  name        text not null,
  postal_code text,
  address     text,
  phone       text,
  fax         text,
  memo        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);
create index sites_company_idx on public.sites(company_id);
create index sites_customer_idx on public.sites(customer_id);

alter table public.projects
  add constraint projects_site_id_fkey foreign key (site_id) references public.sites(id) on delete set null;

-- ========== 2. 先方担当者（customer_contacts）==========
create table public.customer_contacts (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  code        text,
  name        text not null,
  phone       text,
  email       text,
  memo        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index customer_contacts_company_idx on public.customer_contacts(company_id);
create index customer_contacts_customer_idx on public.customer_contacts(customer_id);

alter table public.projects
  add constraint projects_customer_contact_id_fkey foreign key (customer_contact_id) references public.customer_contacts(id) on delete set null;

-- ========== 3. 案件担当者（project_assignees）==========
create type project_assignee_role as enum ('reception', 'sales', 'site_manager');

create table public.project_assignees (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        project_assignee_role not null,
  created_at  timestamptz not null default now(),
  unique (project_id, user_id, role)
);
create index project_assignees_company_idx on public.project_assignees(company_id);
create index project_assignees_project_idx on public.project_assignees(project_id);
create index project_assignees_user_idx on public.project_assignees(user_id);

-- ========== 4. 契約（contracts）1案件に複数 ==========
create table public.contracts (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  estimate_id     uuid references public.estimates(id) on delete set null,
  contract_date   date not null default current_date,
  start_date      date,
  end_date        date,
  amount_excl_tax bigint default 0,
  tax_amount      bigint default 0,
  amount_incl_tax bigint default 0,
  memo            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index contracts_company_idx on public.contracts(company_id);
create index contracts_project_idx on public.contracts(project_id);

-- ========== 5. 見積送付履歴 ==========
create type send_status as enum ('sent', 'failed', 'opened');

create table public.quotation_send_history (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  estimate_id  uuid not null references public.estimates(id) on delete cascade,
  sent_to      text not null,
  sent_at      timestamptz not null default now(),
  subject      text,
  body         text,
  status       send_status not null default 'sent',
  sent_by      uuid references auth.users(id)
);
create index quotation_send_history_estimate_idx on public.quotation_send_history(estimate_id);

-- ========== 6. 請求送付履歴 ==========
create table public.invoice_send_history (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  sent_to     text not null,
  sent_at     timestamptz not null default now(),
  subject     text,
  body        text,
  status      send_status not null default 'sent',
  sent_by     uuid references auth.users(id)
);
create index invoice_send_history_invoice_idx on public.invoice_send_history(invoice_id);

-- ========== 7. 写真台帳 ==========
create table public.photo_albums (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);
create index photo_albums_project_idx on public.photo_albums(project_id);

alter table public.photos
  add column if not exists album_id uuid references public.photo_albums(id) on delete set null;

-- ========== 8. ファイルフォルダ階層 ==========
create table public.file_folders (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete cascade,
  parent_folder_id uuid references public.file_folders(id) on delete cascade,
  name            text not null,
  folder_type     text default 'custom',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index file_folders_project_idx on public.file_folders(project_id);
create index file_folders_parent_idx on public.file_folders(parent_folder_id);

alter table public.files
  add column if not exists folder_id uuid references public.file_folders(id) on delete set null;

-- costs.daily_report_id に FK 追加
alter table public.costs
  add constraint costs_daily_report_id_fkey foreign key (daily_report_id) references public.daily_reports(id) on delete set null;

-- ========== RLS 有効化 ==========
alter table public.sites                   enable row level security;
alter table public.customer_contacts       enable row level security;
alter table public.project_assignees       enable row level security;
alter table public.contracts               enable row level security;
alter table public.quotation_send_history  enable row level security;
alter table public.invoice_send_history    enable row level security;
alter table public.photo_albums            enable row level security;
alter table public.file_folders            enable row level security;

-- ========== company_id スコープ RLS ポリシー ==========
do $$
declare
  tbl text;
  tables text[] := array[
    'sites','customer_contacts','project_assignees','contracts',
    'quotation_send_history','invoice_send_history','photo_albums','file_folders'
  ];
begin
  foreach tbl in array tables
  loop
    execute format('create policy "%I_tenant_select" on public.%I for select using (company_id = public.current_company_id());', tbl, tbl);
    execute format('create policy "%I_tenant_insert" on public.%I for insert with check (company_id = public.current_company_id());', tbl, tbl);
    execute format('create policy "%I_tenant_update" on public.%I for update using (company_id = public.current_company_id()) with check (company_id = public.current_company_id());', tbl, tbl);
    execute format('create policy "%I_tenant_delete" on public.%I for delete using (company_id = public.current_company_id());', tbl, tbl);
  end loop;
end $$;

-- ========== updated_at トリガー ==========
do $$
declare
  t text;
begin
  for t in select unnest(array['sites','customer_contacts','contracts','photo_albums','file_folders'])
  loop
    if not exists (select 1 from pg_trigger where tgname = 'trg_' || t || '_updated_at') then
      execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
    end if;
  end loop;
end $$;
