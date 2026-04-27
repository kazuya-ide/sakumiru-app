-- ============================================================
-- テストデータ投入（testの会社用）
-- - 案件種別 4種
-- - 顧客 5社
-- - 作業場所 10箇所
-- - 先方担当者 5名
-- - 案件 10件（全7ステータス分散）
--
-- ⚠️ 開発・デモ用。実顧客投入前に削除すること:
--   DELETE FROM projects WHERE company_id = '1710094d-36e6-4021-b81c-12943a97969d';
--   DELETE FROM customer_contacts WHERE company_id = '1710094d-36e6-4021-b81c-12943a97969d';
--   DELETE FROM sites WHERE company_id = '1710094d-36e6-4021-b81c-12943a97969d';
--   DELETE FROM customers WHERE company_id = '1710094d-36e6-4021-b81c-12943a97969d';
--   DELETE FROM project_categories WHERE company_id = '1710094d-36e6-4021-b81c-12943a97969d';
-- ============================================================

-- 【CI 安全化】testの会社レコードが存在しない環境（CI のローカル Supabase 等）
-- でも seed が通るよう、参照される companies 行を冒頭で保証する。
-- 本番には既に存在するため on conflict do nothing で no-op。
insert into public.companies (id, name, plan)
values ('1710094d-36e6-4021-b81c-12943a97969d', 'テスト株式会社', 'starter')
on conflict (id) do nothing;

do $$
declare
  cid uuid := '1710094d-36e6-4021-b81c-12943a97969d';
  cat_construction uuid; cat_renovation uuid; cat_maintenance uuid; cat_new_build uuid;
  c_plex uuid; c_yamada uuid; c_sato uuid; c_tanaka uuid; c_suzuki uuid;
  s_shinjuku uuid; s_shibuya uuid; s_yokohama uuid; s_suginami uuid;
  s_shinagawa uuid; s_nerima uuid; s_chuo uuid; s_meguro uuid;
  s_setagaya uuid; s_koto uuid;
  ct_plex uuid; ct_yamada uuid; ct_sato uuid; ct_tanaka uuid; ct_suzuki uuid;
  st_new uuid; st_quoted uuid; st_won uuid; st_prepared uuid;
  st_started uuid; st_completed uuid; st_lost uuid;
begin
  -- 案件種別 4種
  insert into public.project_categories (company_id, name, color, sort_order) values
    (cid, '工事',         '#3B82F6', 1),
    (cid, 'リフォーム',   '#8B5CF6', 2),
    (cid, 'メンテナンス', '#10B981', 3),
    (cid, '新築',         '#F59E0B', 4)
  on conflict (company_id, name) do nothing;

  select id into cat_construction from public.project_categories where company_id=cid and name='工事';
  select id into cat_renovation   from public.project_categories where company_id=cid and name='リフォーム';
  select id into cat_maintenance  from public.project_categories where company_id=cid and name='メンテナンス';
  select id into cat_new_build    from public.project_categories where company_id=cid and name='新築';

  -- 顧客 5社
  insert into public.customers (company_id, code, name, furigana, phone, email, address, payment_terms_memo, closing_day, payment_month_offset, payment_day) values
    (cid, 'C-001', 'プレックス不動産株式会社', 'プレックスフドウサン', '03-1234-5678', 'info@plex.co.jp',  '東京都中央区日本橋本石町3-2-4', '翌月末日払い',   31, 1, 31),
    (cid, 'C-002', '株式会社山田工務店',       'ヤマダコウムテン',   '03-2222-3333', 'yamada@yamada.co.jp', '東京都新宿区西新宿1-1-1',     '翌々月10日払い', 31, 2, 10),
    (cid, 'C-003', '佐藤不動産',               'サトウフドウサン',   '080-1111-2222', 'sato@example.com',   '神奈川県横浜市中区2-2-2',     '翌月末日払い',   20, 1, 31),
    (cid, 'C-004', '田中建築事務所',           'タナカケンチク',     '090-3333-4444', 'tanaka@tanaka.com',  '東京都杉並区荻窪3-3-3',       '翌月20日払い',   31, 1, 20),
    (cid, 'C-005', '鈴木不動産',               'スズキフドウサン',   '03-4444-5555', 'suzuki@suzuki.com',  '東京都練馬区練馬4-4-4',       '翌月末日払い',   31, 1, 31);

  select id into c_plex   from public.customers where company_id=cid and code='C-001';
  select id into c_yamada from public.customers where company_id=cid and code='C-002';
  select id into c_sato   from public.customers where company_id=cid and code='C-003';
  select id into c_tanaka from public.customers where company_id=cid and code='C-004';
  select id into c_suzuki from public.customers where company_id=cid and code='C-005';

  -- 作業場所 10箇所
  insert into public.sites (company_id, customer_id, code, name, postal_code, address, phone) values
    (cid, c_plex,   'S-001', '新宿支店ビル',     '160-0023', '東京都新宿区西新宿2-8-1', '03-5111-1111'),
    (cid, c_yamada, 'S-002', '渋谷新築現場',     '150-0002', '東京都渋谷区渋谷3-3-3',   '090-2222-2222'),
    (cid, c_sato,   'S-003', '横浜オフィスビル', '231-0023', '神奈川県横浜市中区2-2-2', '045-3333-3333'),
    (cid, c_tanaka, 'S-004', '杉並アパート',     '167-0042', '東京都杉並区西荻北4-4-4', '03-4444-4444'),
    (cid, c_plex,   'S-005', '品川商業ビル',     '108-0074', '東京都品川区南品川5-5-5', '03-5555-5555'),
    (cid, c_suzuki, 'S-006', '練馬戸建て',       '176-0001', '東京都練馬区練馬6-6-6',   '03-6666-6666'),
    (cid, c_yamada, 'S-007', '中央区マンション', '103-0007', '東京都中央区日本橋7-7-7', '03-7777-7777'),
    (cid, c_sato,   'S-008', '目黒テナント',     '152-0002', '東京都目黒区目黒8-8-8',   '03-8888-8888'),
    (cid, c_tanaka, 'S-009', '世田谷邸宅',       '154-0001', '東京都世田谷区池尻9-9-9', '03-9999-9999'),
    (cid, c_suzuki, 'S-010', '江東倉庫',         '135-0011', '東京都江東区扇橋10-10',   '03-1010-1010');

  select id into s_shinjuku  from public.sites where company_id=cid and code='S-001';
  select id into s_shibuya   from public.sites where company_id=cid and code='S-002';
  select id into s_yokohama  from public.sites where company_id=cid and code='S-003';
  select id into s_suginami  from public.sites where company_id=cid and code='S-004';
  select id into s_shinagawa from public.sites where company_id=cid and code='S-005';
  select id into s_nerima    from public.sites where company_id=cid and code='S-006';
  select id into s_chuo      from public.sites where company_id=cid and code='S-007';
  select id into s_meguro    from public.sites where company_id=cid and code='S-008';
  select id into s_setagaya  from public.sites where company_id=cid and code='S-009';
  select id into s_koto      from public.sites where company_id=cid and code='S-010';

  -- 先方担当者 5名
  insert into public.customer_contacts (company_id, customer_id, code, name, phone, email) values
    (cid, c_plex,   'CC-001', '山田 太郎', '090-1111-0001', 'yamada-t@plex.co.jp'),
    (cid, c_yamada, 'CC-002', '佐藤 花子', '090-1111-0002', 'sato-h@yamada.co.jp'),
    (cid, c_sato,   'CC-003', '鈴木 一郎', '090-1111-0003', 'suzuki-i@sato.com'),
    (cid, c_tanaka, 'CC-004', '田中 美咲', '090-1111-0004', 'tanaka-m@tanaka.com'),
    (cid, c_suzuki, 'CC-005', '高橋 健太', '090-1111-0005', 'takahashi-k@suzuki.com');

  select id into ct_plex   from public.customer_contacts where company_id=cid and code='CC-001';
  select id into ct_yamada from public.customer_contacts where company_id=cid and code='CC-002';
  select id into ct_sato   from public.customer_contacts where company_id=cid and code='CC-003';
  select id into ct_tanaka from public.customer_contacts where company_id=cid and code='CC-004';
  select id into ct_suzuki from public.customer_contacts where company_id=cid and code='CC-005';

  -- ステータスID取得
  select id into st_new       from public.project_statuses where company_id=cid and name='新規';
  select id into st_quoted    from public.project_statuses where company_id=cid and name='見積提出済み';
  select id into st_won       from public.project_statuses where company_id=cid and name='受注';
  select id into st_prepared  from public.project_statuses where company_id=cid and name='段取り済み';
  select id into st_started   from public.project_statuses where company_id=cid and name='着手済み';
  select id into st_completed from public.project_statuses where company_id=cid and name='完了';
  select id into st_lost      from public.project_statuses where company_id=cid and name='失注';

  -- 案件 10件
  insert into public.projects (
    company_id, code, name, project_category_id, project_status_id,
    customer_id, site_id, customer_contact_id,
    received_at, first_contracted_at, started_at, work_started_at, completed_at, lost_at,
    budget_excl_tax, budget_tax, budget_incl_tax,
    request_content, memo
  ) values
    (cid, 'P-2026-001', '新宿区マンション改修工事', cat_construction, st_started,   c_plex,   s_shinjuku,  ct_plex,   '2026-03-15', '2026-03-20', '2026-04-01', '2026-04-10', null, null, 12000000, 1200000, 13200000, '築20年マンションの全面改修。外壁・配管・内装すべて。', '工期4ヶ月予定。住人説明会あり。'),
    (cid, 'P-2026-002', '渋谷区戸建て新築',         cat_new_build,    st_quoted,    c_yamada, s_shibuya,   ct_yamada, '2026-04-01', null,         null,         null,         null, null, 35000000, 3500000, 38500000, '注文住宅。木造2階建て、延床120m2。',                 '土地は確保済み、地鎮祭は5月予定。'),
    (cid, 'P-2026-003', '横浜オフィス内装',         cat_renovation,   st_completed, c_sato,   s_yokohama,  ct_sato,   '2026-01-10', '2026-01-20', '2026-02-01', '2026-02-05', '2026-03-15', null, 8500000,  850000,  9350000,  'IT企業オフィスの内装リニューアル。',                 '完了。請求済。'),
    (cid, 'P-2026-004', '杉並区アパートメンテナンス', cat_maintenance, st_won,       c_tanaka, s_suginami,  ct_tanaka, '2026-04-05', '2026-04-15', null,         null,         null, null, 2500000,  250000,  2750000,  '築15年アパートの定期メンテナンス。屋根・外壁・配管点検。', '5月着工予定。'),
    (cid, 'P-2026-005', '品川商業ビル全面改装',     cat_construction, st_prepared,  c_plex,   s_shinagawa, ct_plex,   '2026-02-20', '2026-03-01', '2026-04-15', null,         null, null, 45000000, 4500000, 49500000, '商業テナントビル全面改装。営業継続しながら段階施工。', '夜間工事多数。近隣説明済。'),
    (cid, 'P-2026-006', '練馬区戸建てリフォーム',   cat_renovation,   st_new,       c_suzuki, s_nerima,    ct_suzuki, '2026-04-25', null,         null,         null,         null, null, 6800000,  680000,  7480000,  'キッチン・浴室の水回りリフォーム + 内装一新。',     '見積提出予定: 2026-05-10'),
    (cid, 'P-2026-007', '中央区マンション外壁塗装', cat_maintenance,  st_started,   c_yamada, s_chuo,      ct_yamada, '2026-03-01', '2026-03-15', '2026-04-01', '2026-04-08', null, null, 5500000,  550000,  6050000,  '12階建てマンションの外壁塗装と防水工事。',          '足場組立済。GW明けから本格塗装。'),
    (cid, 'P-2026-008', '目黒区テナント改装',       cat_renovation,   st_lost,      c_sato,   s_meguro,    ct_sato,   '2026-02-10', null,         null,         null,         null, '2026-03-10', 0, 0, 0, '飲食店テナント改装。',                              '価格折り合わず失注。次回検討。'),
    (cid, 'P-2026-009', '世田谷区屋根葺き替え',     cat_construction, st_won,       c_tanaka, s_setagaya,  ct_tanaka, '2026-04-10', '2026-04-22', null,         null,         null, null, 3800000,  380000,  4180000,  '築30年戸建ての屋根葺き替え（瓦→ガルバリウム）。', '5月下旬着工予定。雨季前に完了させる。'),
    (cid, 'P-2026-010', '江東区倉庫増築',           cat_new_build,    st_quoted,    c_suzuki, s_koto,      ct_suzuki, '2026-04-18', null,         null,         null,         null, null, 22000000, 2200000, 24200000, '既存倉庫の隣に新規倉庫棟（鉄骨造、500m2）増築。',  '建築確認申請中。');
end $$;
