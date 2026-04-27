-- ============================================================
-- Part 3: 既存テーブル列追加（customers/projects/estimates/invoices/daily_reports/costs/tasks）
-- ============================================================

-- ===== customers 拡張 =====
alter table public.customers
  add column if not exists code text,
  add column if not exists furigana text,
  add column if not exists client_category_id uuid references public.client_categories(id) on delete set null,
  add column if not exists postal_code text,
  add column if not exists fax text,
  add column if not exists closing_day integer,
  add column if not exists payment_month_offset integer default 1,
  add column if not exists payment_day integer,
  add column if not exists payment_terms_memo text;

-- ===== projects 拡張（site_id, customer_contact_id は new_entities で FK 追加） =====
alter table public.projects
  add column if not exists project_category_id uuid references public.project_categories(id) on delete set null,
  add column if not exists project_status_id uuid references public.project_statuses(id) on delete set null,
  add column if not exists site_id uuid,
  add column if not exists customer_contact_id uuid,
  add column if not exists received_at date,
  add column if not exists first_contracted_at date,
  add column if not exists started_at date,
  add column if not exists work_started_at date,
  add column if not exists completed_at date,
  add column if not exists payment_completed_at date,
  add column if not exists lost_at date,
  add column if not exists budget_excl_tax bigint default 0,
  add column if not exists budget_tax bigint default 0,
  add column if not exists budget_incl_tax bigint default 0,
  add column if not exists request_content text,
  add column if not exists deleted_at timestamptz;

-- ===== estimates 拡張 =====
alter table public.estimates
  add column if not exists name text,
  add column if not exists client_id_for_quotation uuid references public.customers(id) on delete set null,
  add column if not exists amount_excl_tax bigint default 0,
  add column if not exists tax_amount bigint default 0,
  add column if not exists amount_incl_tax bigint default 0,
  add column if not exists cost_amount_excl_tax bigint default 0,
  add column if not exists gross_profit bigint default 0,
  add column if not exists internal_memo text,
  add column if not exists deleted_at timestamptz;

-- ===== invoices 拡張 =====
alter table public.invoices
  add column if not exists name text,
  add column if not exists original_amount bigint default 0,
  add column if not exists paid_amount bigint default 0,
  add column if not exists original_paid_amount bigint default 0,
  add column if not exists last_paid_at date,
  add column if not exists payment_method text,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists internal_memo text,
  add column if not exists deleted_at timestamptz;

-- ===== daily_reports 拡張 =====
alter table public.daily_reports
  add column if not exists target_user_id uuid references auth.users(id),
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists status text default 'draft',
  add column if not exists total_person_days numeric(5,2) default 0,
  add column if not exists cost_converted boolean default false,
  add column if not exists memo text,
  add column if not exists updated_at timestamptz not null default now();

-- ===== costs 拡張 =====
alter table public.costs
  add column if not exists registration_type text default 'direct',
  add column if not exists cost_classification_id uuid references public.cost_classifications(id) on delete set null,
  add column if not exists cost_category_id uuid references public.cost_categories(id) on delete set null,
  add column if not exists construction_category_id uuid references public.construction_categories(id) on delete set null,
  add column if not exists supplier_id uuid references public.suppliers(id) on delete set null,
  add column if not exists item_name text,
  add column if not exists specification text,
  add column if not exists quantity numeric(14,2) default 1,
  add column if not exists unit_id uuid references public.units(id) on delete set null,
  add column if not exists unit_price bigint default 0,
  add column if not exists amount_excl_tax bigint default 0,
  add column if not exists tax_amount bigint default 0,
  add column if not exists amount_incl_tax bigint default 0,
  add column if not exists daily_report_id uuid,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_by uuid references auth.users(id);

-- ===== tasks 拡張 =====
alter table public.tasks
  add column if not exists task_category_id uuid references public.task_categories(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists assigned_to uuid references auth.users(id),
  add column if not exists due_date date,
  add column if not exists is_completed boolean default false,
  add column if not exists completed_at timestamptz,
  add column if not exists memo text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.tasks alter column project_id drop not null;

do $$
declare
  t text;
begin
  for t in select unnest(array['daily_reports','costs','tasks'])
  loop
    if not exists (select 1 from pg_trigger where tgname = 'trg_' || t || '_updated_at') then
      execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
    end if;
  end loop;
end $$;
