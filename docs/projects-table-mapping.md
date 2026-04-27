# 案件管理：サクミル ↔ 自アプリ テーブル対応表

このドキュメントは「サクミルの案件管理画面で使われているデータ」と「自アプリのDBテーブル/カラム」の対応を明示します。
UI実装時の参照先として、Phase 1 開発期間中は本ファイルを最優先で参照してください。

最終更新: 2026-04-27

---

## 1. 案件一覧画面（`/projects`）の対応表

### 表示カラム 17項目

| # | サクミル表示 | サクミル推定テーブル/カラム | 自アプリ テーブル | 自アプリ カラム/取得方法 |
|---|---|---|---|---|
| 1 | 案件番号 | projects.code | `projects` | `code` |
| 2 | 案件名 | projects.name | `projects` | `name` |
| 3 | 案件種別 | projects.project_category | `projects` + `project_categories` | `project_category_id` → JOIN `name` |
| 4 | 案件ステータス | projects.status_master | `projects` + `project_statuses` | `project_status_id` → JOIN `name`, `color` |
| 5 | 請求ステータス | invoices集計（派生） | `invoices` SUM | 案件配下の invoices.status から派生計算 |
| 6 | 顧客コード | clients.code | `customers` | `code` (via `customer_id`) |
| 7 | 顧客名 | clients.name | `customers` | `name` (via `customer_id`) |
| 8 | 作業場所コード | locations.code | `sites` | `code` (via `site_id`) |
| 9 | 作業場所名 | locations.name | `sites` | `name` (via `site_id`) |
| 10 | 先方担当者コード | client_contacts.code | `customer_contacts` | `code` (via `customer_contact_id`) |
| 11 | 先方担当者名 | client_contacts.name | `customer_contacts` | `name` (via `customer_contact_id`) |
| 12 | 受付担当者 | project_assignees(role=reception) | `project_assignees` + `auth.users` | `user_id` WHERE role='reception' |
| 13 | 営業担当者 | project_assignees(role=sales) | `project_assignees` + `auth.users` | `user_id` WHERE role='sales' |
| 14 | 現場責任者 | project_assignees(role=site_manager) または projects.manager | `project_assignees` + `auth.users` | `user_id` WHERE role='site_manager' |
| 15 | 契約金額（税抜） | contracts SUM | `contracts` SUM | SUM(`amount_excl_tax`) WHERE project_id=X |
| 16 | 原価合計（税抜） | costs SUM | `costs` SUM | SUM(`amount_excl_tax`) WHERE project_id=X |
| 17 | 粗利（税抜） | 派生（契約-原価） | 計算列 | budget_excl_tax - SUM(costs) |

### フィルター項目

| サクミル | 自アプリ |
|---|---|
| 案件名 | `projects.name` ILIKE 検索 |
| 案件ステータス | `project_statuses.name` プルダウン |
| 請求ステータス | invoices集計の派生 |
| 詳細フィルター（複数条件モーダル） | クライアント側で複数条件AND組み立て |

### 操作ボタン

| サクミル | 自アプリ実装 |
|---|---|
| 案件を作成 | `/projects/new` ページ遷移 |
| 一覧を追加（カスタムビュー） | Phase 2 持ち越し（`list_views` テーブル） |
| 一覧設定（カラム編集） | Phase 2 持ち越し |
| インポート / エクスポート | Phase 2 持ち越し |
| 全てクリア | useState reset |
| 列を編集 | Phase 2 持ち越し |

---

## 2. 案件詳細画面（`/projects/:id`）の対応表

### ステータス連動日付（タイムラインカード）

| サクミル表示 | 自アプリ カラム |
|---|---|
| 案件種別 | `projects.project_category_id` → name |
| 受付日 | `projects.received_at` |
| 初回契約日 | `projects.first_contracted_at` |
| 開始日 | `projects.started_at` |
| 着手日 | `projects.work_started_at` |
| 完了日 | `projects.completed_at` |
| 入金完了日 | `projects.payment_completed_at` |
| 失注日 | `projects.lost_at` |

### 収支サマリ

| サクミル表示 | 自アプリ算出方法 |
|---|---|
| 契約金額 (税抜/税込) | `projects.budget_excl_tax` / `budget_incl_tax` |
| 原価合計 (税抜/税込) | SUM(`costs.amount_excl_tax`) / SUM(`costs.amount_incl_tax`) |
| 粗利（粗利率） | 契約金額 - 原価合計 / 粗利率 = 粗利 / 契約金額 |
| 請求金額（税込） | SUM(`invoices.amount`) WHERE project_id=X |
| 入金金額（税込） | SUM(`invoices.paid_amount`) WHERE project_id=X |

### サブタブ7つ

| サクミルサブタブ | URLパラメータ | 自アプリのデータソース | Phase |
|---|---|---|---|
| 案件管理 | `?tab=project` | projects + 関連 | **Phase 1** |
| 見積 | `?tab=quotation` | `estimates` WHERE project_id=X | Phase 1.5 |
| 契約 | `?tab=project-contract` | `contracts` WHERE project_id=X | Phase 1.5 |
| 実行予算 | `?tab=cost-budget` | `costs` 集計 | Phase 2 |
| 原価明細 | `?tab=cost-detail` | `costs` 一覧 | Phase 1.5 |
| 作業実績・日報 | `?tab=work-result` | `daily_reports` WHERE project_id=X | Phase 2 |
| 請求・入金 | `?tab=invoice` | `invoices` WHERE project_id=X | Phase 1.5 |

### 案件情報3ブロック

| ブロック | サクミル参照 | 自アプリ取得 |
|---|---|---|
| 顧客情報 | clients (via customer_id) | `customers` JOIN |
| 作業場所情報 | locations (via location_id) | `sites` JOIN |
| 先方担当者情報 | client_contacts (via contact_id) | `customer_contacts` JOIN |

### 右サイドバー

| サクミル | 自アプリ |
|---|---|
| タスク（未完了のみ） | `tasks` WHERE project_id=X AND is_completed=false |
| 案件担当者（受付/営業/現場 の3タブ） | `project_assignees` GROUP BY role |
| 写真台帳 | `photo_albums` WHERE project_id=X |

---

## 3. 実装メモ

### 3-1. 取得クエリの基本形

```typescript
const { data: projects } = await supabase
  .from("projects")
  .select(`
    id, code, name,
    project_status:project_statuses(id, name, color),
    project_category:project_categories(id, name),
    customer:customers(id, code, name),
    site:sites(id, code, name),
    customer_contact:customer_contacts(id, code, name),
    budget_excl_tax,
    received_at, first_contracted_at, started_at, work_started_at,
    completed_at, payment_completed_at, lost_at
  `)
  .is("deleted_at", null)
  .order("created_at", { ascending: false });
```

### 3-2. 派生値の算出

「原価合計」「粗利」「請求金額」「入金金額」は SQL ビュー化するか、
クライアント側で別途集計クエリを発行（N+1回避のため後者非推奨）。

→ **推奨**: PostgreSQL ビュー `projects_with_summary` を Phase 1.5 で作成

### 3-3. レスポンシブ方針

| 画面幅 | 一覧画面 | 詳細画面 |
|---|---|---|
| `≥ md` (768px+) | テーブル全カラム表示 | 2カラム（メイン + サイドバー） |
| `< md` | カード形式（主要4項目+詳細展開） | 1カラム縦並び（サイドバー下方） |

---

## 4. Phase 1 実装スコープ

| 機能 | 完成度 |
|---|---|
| 一覧表示 | ★★★ 全カラム |
| フィルター（案件名 / ステータス） | ★★★ |
| 詳細フィルター（複数条件モーダル） | ★★★ |
| 案件作成 | ★（ボタンのみ、画面はPhase 1.5） |
| 詳細画面 ヘッダ | ★★★ |
| 詳細画面 ステータスフロー | ★★★ |
| 詳細画面 案件情報3ブロック | ★★★ |
| 詳細画面 サブタブナビ | ★★★ |
| サブタブ「案件管理」中身 | ★★★ |
| サブタブ「見積/契約/原価明細/請求」中身 | ★（プレースホルダー） |
| サブタブ「実行予算/作業実績」中身 | ★（プレースホルダー） |
| 右サイドバー（タスク/担当者/写真台帳） | ★★ 表示のみ |
| 編集機能 | ☆ Phase 1.5 |

---

## 関連ドキュメント

- [docs/sakumiru-mapping.md](sakumiru-mapping.md) - サクミル全画面マッピング（500行）
- [docs/data-model.md](data-model.md) - データモデル定義
- [docs/development-status.md](development-status.md) - 開発ステータス全体
