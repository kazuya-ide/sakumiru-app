-- ============================================================
-- サインアップ時の初期処理
-- 新規ユーザーが登録されたら、デフォルトの company を作成し
-- owner として紐付ける
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  -- 1. Company を作成 (ユーザーのメール or メタデータから会社名取得)
  insert into public.companies (name, plan)
  values (
    coalesce(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1) || 'の会社'),
    'starter'
  )
  returning id into new_company_id;

  -- 2. Membership を作成 (owner として)
  insert into public.memberships (user_id, company_id, role)
  values (new.id, new_company_id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
