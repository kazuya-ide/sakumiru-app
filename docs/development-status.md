# 開発ステータス・注意事項・未完了タスク

最終更新: 2026-04-27 (INC-001/INC-002 修正)

このファイルは「今どこまで出来ているか」「運用上の注意点」「未完了タスク」を一元管理します。
新しい作業が完了したら本ファイルを更新してください。

**設計判断ミス・本番事故の記録は [docs/incident-log.md](./incident-log.md) を参照。**
新規 migration（特に GRANT/REVOKE 系）を書く前に同ファイルのチェックリストを必ず読むこと。

---

## 1. 現在の開発状況

| カテゴリ | 状態 | 備考 |
|---|---|---|
| Supabase DB | ✅ 41テーブル + 3 Storageバケット 適用済 | sakumiru-app プロジェクト |
| マイグレーション | ✅ 11ファイル（Git管理） | `supabase/migrations/` |
| TypeScript型定義 | ✅ 自動生成済 | `src/lib/supabase/database.types.ts` |
| 認証 | ✅ テストアカウント6個（owner/admin/office/manager/worker/vendor） | 全員 testの会社 所属 |
| ログイン画面 | ✅ テストアカウント表示（環境変数で制御） | `NEXT_PUBLIC_SHOW_TEST_ACCOUNTS=true` |
| Vercelデプロイ | ✅ Production稼働中 | https://sakumiru-app.vercel.app |
| RLS | ✅ 全テーブル company_id スコープ有効 | 5階層別の権限差は未実装 |
| セキュリティ警告 | ✅ SQL面 0件、Auth面 1件残（Pro plan必要） | |
| **案件管理UI** | ✅ **一覧/詳細/詳細フィルター実装** | **`/projects`, `/projects/[id]`** |
| **テストデータ** | ✅ **案件10件 + 顧客5社 + 作業場所10 + 先方担当者5 + 案件種別4** | **testの会社** |

---

## 2. ⚠️ 運用上の重要注意事項

### 2-1. 🔴 テストアカウントの公開リスク

**現状**:
- ログイン画面右側に6個のテストアカウント情報を表示中
- 共通パスワード `Test1234!` が**全世界に公開状態**
- Vercel本番URL（https://sakumiru-app.vercel.app）でも見える

**許容している理由**:
- 開発フェーズのため
- DBに実顧客データなし（サンプルのみ）
- 環境変数 `NEXT_PUBLIC_SHOW_TEST_ACCOUNTS` で表示制御している

**🚨 必ず実顧客データ投入前に行うこと**:

```bash
# Step 1: Vercel から環境変数削除
# Vercel Dashboard > Settings > Environment Variables > NEXT_PUBLIC_SHOW_TEST_ACCOUNTS を削除

# Step 2: 再デプロイ
npx vercel --prod --yes
```

```sql
-- Step 3: Supabase でテストユーザー全削除
-- memberships は CASCADE で自動削除される
DELETE FROM auth.users WHERE email LIKE '%@test.local';
```

### 2-2. 🟡 開発DB = 本番予約DB の同居問題（A3選択）

**現状**:
- 開発と本番で同じ Supabase プロジェクト（sakumiru-app）を使用
- 開発で破壊的変更しても問題ないようサンプルデータのみで運用

**実顧客投入前に必須**:
1. 新規 Supabase プロジェクト作成（本番専用）
2. `pg_dump` で開発DBのスキーマ + マスタデータを抽出
3. 本番DBに適用
4. Vercel 環境変数を本番DBに切替
5. 開発DBは引き続き開発用として保持

### 2-3. 🟡 Leaked Password Protection 未使用

**現状**: Pro plan ($25/月) 限定機能のため未設定

**代替策**（Supabase Dashboard 手動設定）:
- Auth > Providers > Email
  - Minimum password length: **10** （現在 6）
  - Password requirements: **Lower + Upper + Numbers + Symbols** を選択

**完全対応**: Pro plan 移行 → Prevent use of leaked passwords を ON

### 2-4. 🟢 Vercel 環境変数の現状

| 変数名 | 値 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://rmpllwqygtjppcevxgxq.supabase.co | DB接続 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJh...（JWT形式） | DB接続 |
| `NEXT_PUBLIC_SHOW_TEST_ACCOUNTS` | true | テスト情報表示制御（**本番化時削除**） |

設定範囲: Production / Preview / Development 全て

### 2-5. 🟡 ロール別権限はまだRLSに反映されていない

**現状**:
- 5階層ロール（owner/admin/manager/worker/office/vendor）はDBに存在
- ただしRLSポリシーは「自社データのみ」のシンプルな制御
- つまり今は **同じ会社のメンバーは全員、全データにCRUD可能**

**Phase 1 で実装すべき**:
- 案件・見積・原価などへの「ロール別の SELECT/UPDATE/DELETE 制限」
- 例: vendor（取引先）は自社が関わる案件しか見れない
- 例: worker（職人）は見積・請求が見えない

### 2-6. 🟡 Storage バケットの容量制限

| 項目 | Free | Pro |
|---|---|---|
| Storage 総量 | 1GB | 100GB |
| 1ファイル上限 | 50MB | 5GB |
| Egress（転送量） | 5GB/月 | 250GB/月 |

→ 写真・図面が増えたら Pro plan 検討

### 2-7. 🟢 npm 依存関係の非推奨警告

`eslint-config-next: 14.2.5` の連鎖で rimraf/glob/tar/eslint 等が古い。
ビルドは止まらないが、Phase 2 で `eslint-config-next: ^16` + `eslint: ^9` に一括更新予定（破壊的変更あり）。

---

## 3. 未完了タスク

### 3-1. Phase 1 着手前（次セッション最初）

- [ ] Supabase Dashboard でパスワード強度設定（Min 10 + 4種混在）
- [ ] (任意) Storage バケットアップロード動作テスト

### 3-2. Phase 1 機能実装（推定: 数週間〜1ヶ月）

優先順位順:

| # | 機能 | 内容 |
|---|---|---|
| 1 | サインアップ画面 | 一般ユーザー登録（現在ログインのみ） |
| 2 | パスワードリセット | 必須機能 |
| 3 | 案件管理 UI | 一覧 / 詳細 / 新規作成 / 編集 |
| 4 | 写真台帳 UI | photos バケット連携 / フォルダ階層 |
| 5 | ファイル管理 UI | documents バケット / フォルダ |
| 6 | ロール別権限 RLS | 5階層の SELECT/UPDATE/DELETE 制限 |

### 3-3. Phase 2（持ち越し）

| カテゴリ | タスク |
|---|---|
| マスタ追加 | テンプレート系（project/quotation/invoice templates） / email_templates / pdf_layouts / list_views |
| 組織設定 | organization_info（インボイス登録番号・社印） / amount_settings（端数処理） / subscriptions |
| 機能 | 見積/請求 PDF生成 / メール送付 / インポート・エクスポート（CSV/Excel） |
| 集計 | 案件別出面表 / 月別予算消化レポート |
| 依存更新 | eslint-config-next 16系 + eslint 9系（破壊的変更） |
| パフォーマンス | Performance INFO対応（FK index 追加 - 実データ投入後） |

### 3-4. 本番運用前必須

#### セキュリティ
- [ ] テストアカウント全削除（DB）
- [ ] テストアカウント表示OFF（Vercel env var 削除）
- [ ] パスワード強度制限有効化（Min 10 + 4種混在）
- [ ] Leaked Password Protection（Pro plan 検討）
- [ ] Supabase Advisor で警告ゼロ確認

#### インフラ
- [ ] 開発/本番 Supabase 分離（pg_dump 移行）
- [ ] バックアップ設定（Supabase Daily backup）
- [ ] カスタムドメイン設定（Vercel）
- [ ] Pro plan 移行（必要なら）

#### 法務
- [ ] 利用規約
- [ ] プライバシーポリシー
- [ ] 特定商取引法表示（有料SaaSの場合）
- [ ] インボイス登録番号設定

#### 運用
- [ ] Sentry エラー監視
- [ ] Vercel Analytics
- [ ] 顧客サポート窓口（メール or チャット）
- [ ] 障害時告知手段（Twitter/X 公式アカウント等）
- [ ] ロールバック手順ドキュメント化（deployment-errors.md に追記）

---

## 4. 既知の構造的トレードオフ

| トレードオフ | 影響 | 対応時期 |
|---|---|---|
| A3: 開発DB=本番予約 | 同一プロジェクト | 顧客受入前 |
| Leaked Password Pro限定 | 完全防御不可 | Pro移行時 |
| eslint依存古い | 警告のみ、ビルドは通る | Phase 2 |
| Performance INFO 93件 | データ未投入の影響 | 投入後再評価 |

---

## 5. 関連ドキュメント

- [docs/sakumiru-mapping.md](sakumiru-mapping.md) — サクミル全画面とDB構造の対応表
- [docs/projects-table-mapping.md](projects-table-mapping.md) — 案件管理：サクミル↔自アプリ対応表
- [docs/deployment-errors.md](deployment-errors.md) — ビルド・デプロイエラー履歴
- [docs/architecture.md](architecture.md) — 全体アーキテクチャ
- [docs/data-model.md](data-model.md) — データモデル定義
- [docs/features.md](features.md) — 機能一覧・プラン構成
- [docs/建築SaaS開発_統合ガイド.docx](建築SaaS開発_統合ガイド.docx) — スコープ・進行プラン

---

## 6. 実装履歴（時系列）

### 2026-04-27 #5: 案件管理UI Phase 1 + テストデータ投入

**実装内容**:
- 案件一覧画面 (`/projects`)
  - 17カラム表示 / キーワード検索 / ステータスマルチ選択
  - 詳細フィルターモーダル（顧客名/作業場所/先方担当者/受付日範囲/開始日範囲/契約金額範囲）
  - レスポンシブ対応（md以上: テーブル / md未満: カード形式）
- 案件詳細画面 (`/projects/[id]`)
  - ヘッダ + ステータスバッジ + 8項目タイムライン
  - サブタブ7つ（案件管理のみ実装、他はプレースホルダー）
  - 案件管理タブ: 収支サマリ + 案件情報3ブロック + 案件補足
  - 右サイドバー: タスク / 担当者（受付・営業・現場）/ 写真台帳

**新規ファイル**:
- `docs/projects-table-mapping.md` — 実装の根拠となる対応表
- `src/components/ui/StatusBadge.tsx` — 共通ステータスバッジ（マスタの色HEX対応）
- `src/app/(app)/projects/page.tsx` — 一覧 Server Component（更新）
- `src/app/(app)/projects/[id]/page.tsx` — 詳細 Server Component
- `src/app/(app)/projects/_components/ProjectsListClient.tsx` — 一覧Client（フィルター含む）
- `src/app/(app)/projects/_components/DetailFilterModal.tsx` — 詳細フィルターモーダル
- `src/app/(app)/projects/_components/ProjectDetailTabs.tsx` — サブタブナビ

**テストデータ**:
- 案件種別マスタ 4種（工事/リフォーム/メンテナンス/新築）
- 顧客マスタ 5社（プレックス不動産/山田工務店/佐藤不動産/田中建築事務所/鈴木不動産）
- 作業場所マスタ 10箇所（顧客に紐付け）
- 先方担当者マスタ 5名（顧客に紐付け）
- 案件 10件（全7ステータスに分散：新規1/見積提出済み2/受注2/段取り済み1/着手済み2/完了1/失注1）

**Phase 1.5 持ち越し**:
- 案件作成・編集画面
- サブタブ「見積/契約/原価明細/請求」中身
- 収支サマリの集計（contracts/costs/invoices SUM）
- 一覧設定（カラム編集・カスタムビュー）

### 2026-04-27 #4: テストアカウント6個 + ログイン画面改修

- `handle_new_user` trigger に `skip_default_setup` フラグ追加
- 6ロール分のテストユーザーを `auth.users` に直接INSERT
- ログイン画面右側にテストアカウント表示（`NEXT_PUBLIC_SHOW_TEST_ACCOUNTS=true` 制御）

### 2026-04-27 #3: Vercel デプロイエラー修正

- `src/lib/supabase/middleware.ts` `setAll(cookiesToSet)` の型注釈追加
- `server.ts` も同様に予防修正
- Vercel 環境変数 `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` 設定 → 500エラー解消

### 2026-04-27 #2: project_status マスタ統合 + Storage バケット作成

- 旧 ENUM `project_status` (4値) と `projects.status` カラム削除
- サクミル準拠 7値マスタ + sign-up trigger 拡張で自動投入
- Storage バケット 3つ (photos/documents/avatars) + RLSポリシー12件

### 2026-04-27 #1: サクミル参考のDB設計確定

- マイグレーション 7ファイル新規追加（master/extend_existing/new_entities/security/perf_fix）
- 41テーブル + 全RLS有効
- TypeScript型自動生成
- セキュリティ・パフォーマンス警告対応

---

## 更新ルール

新しい作業が終わったら：

1. **§1 開発状況** — 完了項目にチェック
2. **§2 注意事項** — 新しい運用注意点があれば追記
3. **§3 未完了タスク** — 完了したものを削除、新規TODOを追加
4. **§4 トレードオフ** — 新しい設計判断あれば追記
5. 最上部の「最終更新」日付を更新
6. Git commit メッセージにこのファイルの更新を明記
