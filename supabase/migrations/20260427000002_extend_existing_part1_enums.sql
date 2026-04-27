-- ============================================================
-- Part 1: ENUM 値追加・置換
-- - member_role に vendor 追加
-- - invoice_status を 4新値に置換
-- - estimates.status を text → quotation_status ENUM
-- ============================================================

alter type member_role add value if not exists 'vendor';

create type invoice_status_new as enum ('unbilled', 'billed', 'partially_paid', 'paid');

alter table public.invoices alter column status drop default;

alter table public.invoices
  alter column status type invoice_status_new using (
    case status::text
      when 'unpaid' then 'unbilled'::invoice_status_new
      when 'paid' then 'paid'::invoice_status_new
      when 'overdue' then 'unbilled'::invoice_status_new
      when 'void' then 'unbilled'::invoice_status_new
      else 'unbilled'::invoice_status_new
    end
  );

drop type invoice_status;
alter type invoice_status_new rename to invoice_status;

alter table public.invoices alter column status set default 'unbilled';

create type quotation_status as enum ('draft', 'submitted', 'won', 'lost');

alter table public.estimates alter column status drop default;

alter table public.estimates
  alter column status type quotation_status using (
    case status
      when 'draft' then 'draft'::quotation_status
      when 'submitted' then 'submitted'::quotation_status
      when 'won' then 'won'::quotation_status
      when 'lost' then 'lost'::quotation_status
      else 'draft'::quotation_status
    end
  );

alter table public.estimates alter column status set default 'draft';
