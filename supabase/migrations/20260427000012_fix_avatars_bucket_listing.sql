-- ============================================================
-- avatars バケットの listing 制限（Security Advisor 対応）
--
-- 問題:
--   旧 avatars_select_public ポリシーは bucket_id='avatars' で
--   誰でも全ファイルを listing 可能 → 他ユーザーの avatar URL 一覧取得可能
--
-- 修正:
--   listing は自分のフォルダ配下のみ許可
--   public bucket なので URL 直アクセスでのDLは依然可能（Supabase 仕様）
--   = 「自分の avatar 一覧表示」「他人の avatar URL を持っていれば表示」両方OK
--   = 「他人の avatar 一覧を盗む」のは不可
-- ============================================================

drop policy if exists "avatars_select_public" on storage.objects;

create policy "avatars_select_own_listing" on storage.objects
  for select
  using (
    bucket_id = 'avatars'
    and (split_part(name, '/', 1)::uuid = (select auth.uid()))
  );
