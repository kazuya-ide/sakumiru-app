-- ============================================================
-- セキュリティ強化（Supabase Database Linter 警告対応）
--
-- 対応する警告:
--   1. function_search_path_mutable: set_updated_at に search_path 設定
--   2-5. anon/authenticated_security_definer_function_executable:
--        SECURITY DEFINER 関数の EXECUTE 権限を REVOKE
--
-- 注意:
--   - current_company_id は RLS ポリシー内で呼ばれる → REVOKE しても
--     RLS 評価時は postgres ロールで実行されるため動作する
--   - handle_new_user は auth.users INSERT トリガーから呼ばれる →
--     REVOKE しても trigger 経由では SECURITY DEFINER で実行される
-- ============================================================

-- ========== 1. set_updated_at に search_path = public 追加 ==========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ========== 2-5. SECURITY DEFINER 関数の EXECUTE 権限を取り消し ==========
-- public スキーマ内にあるが、外部 RPC 経由での実行を禁止する

revoke execute on function public.current_company_id() from anon;
revoke execute on function public.current_company_id() from authenticated;
revoke execute on function public.current_company_id() from public;

revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from public;

-- postgres ロールには EXECUTE 権限を保持（RLS 評価・トリガー実行のため）
grant execute on function public.current_company_id() to postgres, service_role;
grant execute on function public.handle_new_user() to postgres, service_role;
