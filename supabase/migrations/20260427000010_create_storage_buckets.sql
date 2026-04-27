-- ============================================================
-- Storage バケット作成（写真/書類/アバター）+ RLS
-- パス命名規則:
--   photos:    {company_id}/{project_id}/{uuid}.jpg
--   documents: {company_id}/{project_id}/{uuid}_{filename}
--   avatars:   {user_id}/{filename}
-- ============================================================

-- バケット作成
insert into storage.buckets (id, name, public) values
  ('photos',    'photos',    false),
  ('documents', 'documents', false),
  ('avatars',   'avatars',   true)
on conflict (id) do nothing;

-- ========== photos バケット RLS ==========
create policy "photos_select" on storage.objects
  for select using (
    bucket_id = 'photos'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'photos'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "photos_update" on storage.objects
  for update using (
    bucket_id = 'photos'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "photos_delete" on storage.objects
  for delete using (
    bucket_id = 'photos'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

-- ========== documents バケット RLS ==========
create policy "documents_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "documents_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "documents_update" on storage.objects
  for update using (
    bucket_id = 'documents'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

create policy "documents_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (split_part(name, '/', 1)::uuid = public.current_company_id())
  );

-- ========== avatars バケット RLS（public バケット）==========
create policy "avatars_select_public" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (split_part(name, '/', 1)::uuid = (select auth.uid()))
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (split_part(name, '/', 1)::uuid = (select auth.uid()))
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (split_part(name, '/', 1)::uuid = (select auth.uid()))
  );
