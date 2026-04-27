# サクミル画面 → 建築SaaS データモデル対応表

**作成日**: 2026-04-27
**抽出方法**: Chrome MCP による DOM クロール（テキスト精度100%）
**対象**: サクミル PC版（pc.sakumiru.jp）の全11カテゴリ

> 既存 `docs/data-model.md` のスキーマを、サクミル実装の項目と突き合わせて修正点を整理した文書。実装着手前に SQL マイグレーション草案へ反映する。

---

## 0. URL マップ

| カテゴリ | URL | 備考 |
|---|---|---|
| 案件管理 | `/projects` | サブタブ7つ |
| 見積管理 | `/quotations` | 全案件横断 |
| 請求管理 | `/invoices` | 全案件横断 |
| 案件カレンダー | `/project-schedule` | ガントチャート |
| スケジュール | `/member-schedule` | 社員別カレンダー |
| 作業日報 | `/work-daily-reports` | 全案件横断 |
| タスク管理 | `/tasks` | テンプレートあり |
| 顧客管理 | `/clients` | |
| 作業場所管理 | `/locations` | |
| 集計・レポート | `/statistics` | 案件別出面表 |
| 設定 | `/settings/...` | マスタ・カスタマイズ・組織 |

---

## 1. 案件管理（最重要・サブタブ7つ）

### 1-1. 一覧 `/projects`

**タブ**: 全ての案件 / 進行案件 / 請求管理

**カラム（17項目）**

| サクミル項目 | docs既存 | 修正要否 |
|---|---|---|
| 案件番号 | `projects.code` | OK |
| 案件名 | `projects.name` | OK |
| **案件種別** | なし | ❌ `project_category_id` 追加 |
| 案件ステータス | `projects.status` | ⚠️ ENUM→マスタ化 |
| **請求ステータス** | なし | ❌ invoices集計の派生列 |
| 顧客コード | なし | ❌ `customers.code` 追加 |
| 顧客名 | `customers.name` | OK |
| **作業場所コード** | なし | ❌ `sites` テーブル新設 |
| **作業場所名** | なし | ❌ 同上 |
| **先方担当者コード** | なし | ❌ `customer_contacts` 新設 |
| **先方担当者名** | なし | ❌ 同上 |
| **受付担当者** | なし | ❌ `project_assignees` 新設（役割: reception） |
| **営業担当者** | なし | ❌ 同（役割: sales） |
| 現場責任者 | `projects.manager_id` | OK（または役割: site_manager に統一） |
| 契約金額（税抜） | `projects.budget` | ⚠️ 税区分カラム追加 |
| **原価合計（税抜）** | なし | ❌ costs集計の派生列 |
| **粗利（税抜）** | なし | ❌ 計算列 |

**フィルター**: 案件名 / 案件ステータス / 請求ステータス / 詳細フィルター
**操作**: 案件を作成 / 一覧を追加 / 一覧設定 / インポート / エクスポート / エクスポート履歴

### 1-2. 案件ステータス（カスタマイズ可・マスタ化必須）

**デフォルト7値**: 新規 / 見積提出済み / 受注 / 段取り済み / 着手済み / 完了 / 失注

→ `project_statuses` マスタテーブル（company_id × status_name × sort_order × color）

### 1-3. 詳細画面 `/projects/:id?tab=project`

**ヘッダ**: 案件番号 / 案件名 / 編集

**ステータスタイムライン**（フロー表示）
- 新規 → 見積提出済み → 受注 → 段取り済み → 着手済み → 完了 / 未請求 / 失注

**ステータス連動日付（カード横並び）**
- 案件種別 / 受付日 / 初回契約日 / 開始日 / 着手日 / 完了日 / 入金完了日 / 失注日
- → `projects` に各ステータスの **`reached_at`** 系日付カラム追加

**収支サマリ**
| 指標 | 税抜/税込 |
|---|---|
| 契約金額 | 両方 |
| 原価合計 | 両方 |
| 粗利（粗利率） | 両方 |
| 請求金額（税込） | 税込のみ |
| 入金金額（税込） | 税込のみ |

**案件情報3ブロック**
- **顧客情報**: 顧客コード / 顧客名 / 顧客種別 / 顧客住所 / 電話番号 / 請求締日 / 入金期日 / 備考
- **作業場所情報**: 作業場所コード / 作業場所名 / 住所 / 電話番号 / FAX / 備考
- **先方担当者情報**: 担当者コード / 担当者名 / 電話番号 / メールアドレス / 備考

**案件補足**: 依頼内容（自由記述）/ 備考

**予定セクション**（案件単位の schedule）
- 種別（色分け：作業/打合せ/現地調査）/ ステータス（未着手/進行中/完了）/ 日時 / 場所 / 担当者 / 車両・備品 / 詳細

**ファイル**: フォルダ階層 + **顧客フォルダ・作業場所フォルダが自動生成**

**写真**: 撮影日順表示 + フォルダ階層 + 顧客/作業場所フォルダ自動生成

**右サイドバー**
- タスク（未完了のみ表示切替）
- 案件担当者（受付/営業/現場 の3タブ、複数アサイン可）
- 写真台帳（複数台帳作成可）

### 1-4. サブタブ「見積」 `?tab=quotation`

**カラム**: 見積番号 / 見積名 / ステータス / 見積日 / 有効期限 / 作成者 / 見積金額（税抜）/ 原価金額（税抜）/ 粗利（税抜）/ 社内メモ
**ステータス4値**: 下書き / 提出済み / 受注 / 失注

### 1-5. サブタブ「契約」 `?tab=project-contract`

**カラム**: 契約日 / 契約工期（開始日）/ 契約工期（終了日）/ 金額（税抜）/ 金額（税額）/ 金額（税込）/ 見積（紐付き）/ 備考
**特徴**: **1案件に複数契約OK**（追加工事用）

### 1-6. サブタブ「実行予算」 `?tab=cost-budget`

**サマリ**: 契約金額 / 原価合計 / 粗利（粗利率）
**集計4分類**: 材料費 / 労務費 / 外注費 / 諸経費（色分け）
**集計種別**: 原価種別 / 工種 / 仕入先（3パターン切替）
**月別予算消化テーブル**: 原価種別 / 実行予算 / 原価合計 / 消費率 / 予算残高 / 月別カラム
**実行予算ステータス**: 未確定 / 確定 等

### 1-7. サブタブ「原価明細」 `?tab=cost-detail`

**カラム**: 登録方法 / 日付 / 原価分類 / 原価種別 / 品目 / 仕様 / 数量 / 単位 / 単価 / 金額（税抜）/ 金額（税込）/ 仕入先 / 工種 / 備考 / 更新日時 / 作成日時 / 作成者
**登録方法**: 直接 / 変換（作業実績→原価変換）
**原価分類**（マスタ）: 材料費 / 労務費 / 外注費 / 諸経費
**原価種別**（マスタ）: 上記の下位、自由設定可

### 1-8. サブタブ「作業実績・日報」 `?tab=work-result`

**カラム**: 労務費 / 日付 / 対象者 / 作成者 / ステータス / 合計人工 / 詳細 / 備考
**労務費フラグ**: 未変換 / 変換済み（原価明細への変換状態）
**ステータス**: 下書き / 承認済 (他あれば追加)

### 1-9. サブタブ「請求・入金」 `?tab=invoice`

**サマリ**: 契約金額（税込）/ 請求金額（税込）/ 入金金額（税込）
**カラム**: 請求番号 / 請求名 / 請求日 / 入金期日 / 請求/入金ステータス / 請求金額 / 請求金額（当初）/ 入金金額 / 入金金額（当初）/ 最終入金日 / 顧客名 / 入金方法 / 社内メモ
**請求/入金ステータス4値**: 未請求 / 請求済み / 一部入金 / 入金完了

### 1-10. 見積詳細 `/projects/:id/quotations/:qid?tab=info`

**ヘッダ操作**: 編集 / 複製 / 変換 / 印刷 / ダウンロード / メール送付
**サブタブ**: 見積情報 / プレビュー
**右サイド**: 送付履歴（メール送信ログ）/ 実行予算（当初金額・最終金額）

→ `quotation_send_history` テーブル必要

---

## 2. 顧客管理 `/clients`

**タブ**: 全ての顧客
**カラム（13項目）**: 顧客コード / 顧客名 / 顧客種別 / フリガナ / 郵便番号? / 住所 / 電話番号 / FAX番号 / メールアドレス / 請求締日 / 入金月 / 入金日 / (操作)

→ 案件詳細で見えていた付帯項目: 顧客住所 / 入金期日 / 備考

**顧客種別**（マスタ）: 法人 / 個人 / 他 → `client_categories` テーブル

---

## 3. 見積管理（独立メニュー）`/quotations`

**タブ**: 全ての見積 / 下書き・提出済み
**カラム（11項目）**: 見積番号 / 見積名 / 見積日 / 有効期限 / 見積ステータス / 見積金額（税抜）/ 原価金額（税抜）/ 粗利（税抜）/ **顧客名（見積書）** / 案件名 / 社内メモ

🔴 **発見**: 「顧客名（見積書）」は案件の顧客と異なる可能性 → 見積書宛先が独立して書ける

---

## 4. 請求管理（独立メニュー）`/invoices`

**タブ**: 全ての請求 / 未入金
**カラム（12項目）**: 請求番号 / 請求名 / 請求日 / 入金期日 / 請求/入金ステータス / 請求金額 / 入金金額 / 最終入金日 / 顧客名 / 案件名 / 入金方法 / 社内メモ
**入金方法**: 銀行振込 等（マスタ or text）
**操作ボタン**: 「入金」ボタン（請求行に表示、入金登録モーダル）

---

## 5. 案件カレンダー `/project-schedule`

**表示**: ガントチャート風（開始日順）
**フィルター**: 表示日 / 案件ステータス / 詳細フィルター
**並び替え**: 開始日の古い順

---

## 6. スケジュール（社員別）`/member-schedule`

**タブ**: 全ての予定
**表示切替**: 日 / 週 / 2週 / 月
**特徴**:
- 社員別グループ表示（担当未定 / 各メンバー）
- **祝日マスタ**搭載（昭和の日、憲法記念日 等）
- ドラッグ&ドロップで予定移動

→ `holidays` マスタテーブル（または外部API連携）

---

## 7. 作業日報（独立メニュー）`/work-daily-reports`

**カラム**: 労務費 / 日付 / 対象者 / 作成者 / ステータス / 出勤日時 / 退勤日時 / 案件名 / 備考
**docs不足項目**: 対象者 / 出勤日時 / 退勤日時 / ステータス / 労務費フラグ
**docs余分項目**: weather / worker_count / content / issues

---

## 8. タスク管理 `/tasks`

**タブ**: 未完了のタスク / 全てのタスク / **サクミル初期設定**（オンボーディング）
**カラム**: 完了 / タスク名 / 担当者 / 案件名 / 顧客名 / 期日 / タスク種別 / 詳細メモ
**タスク種別**（マスタ）: → `task_categories` テーブル
**特徴**: 案件と紐付くタスク + 単独タスクの両方OK

---

## 9. 作業場所管理 `/locations`

**カラム（9項目）**: 作業場所コード / 作業場所名 / 顧客コード / 顧客名 / 郵便番号 / 住所 / 電話番号 / FAX番号 / 備考
**特徴**:
- **1顧客に複数の作業場所**を紐付け可能
- 住所はGoogle Maps検索リンク自動生成

---

## 10. 集計・レポート `/statistics`

**タブ**: 案件別出面表（他は未実装 or 別タブ）
**集計内容**: 作業日報の人工
**フィルター**: 集計月 / 対象者 / 現場責任者
**出力**: 日別人工合計（30日分カラム + 月末合計）

---

## 11. 設定 `/settings/...`

### 11-1. 個人設定
- スケジュール表示（祝日/六曜/週の始まり）

### 11-2. 組織設定
| メニュー | URL | 機能 |
|---|---|---|
| メンバー管理 | `/settings/organization/member` | ユーザー招待・役割設定 |
| 車両・備品 | `/settings/organization/event-resource` | 予定で割り当てるリソース |
| 登録番号・社印ロゴ | `/settings/organization/information` | インボイス登録番号・社印 |
| 金額端数 | `/settings/organization/amount` | 端数処理ルール |
| 利用状況・プラン | `/settings/organization/plan` | サブスクリプション |

**メンバー管理**
- カラム: 表示順序 / 名前 / 役割 / メールアドレス
- 役割: **「組織管理者」**（他選択肢は招待モーダルで要確認）
- セクション: アクティブ / 招待中 / 無効化・削除済

### 11-3. データ管理
- インポート / エクスポート（一括CSV/Excel）

### 11-4. マスタ設定（マスタテーブル群）
| メニュー | URL | テーブル候補 |
|---|---|---|
| 商品 | `/settings/master/product` | `products` |
| 商品分類 | `/settings/master/product-category` | `product_categories` |
| 原価種別 | `/settings/master/cost-category` | `cost_categories` |
| 工種 | `/settings/master/construction-category` | `construction_categories` |
| 仕入先 | `/settings/master/supplier` | `suppliers`（=既存vendors） |
| 仕入先種別 | `/settings/master/supplier-category` | `supplier_categories` |
| 人工単価 | `/settings/master/person-day-unit-price` | `person_day_unit_prices` |
| 単位 | `/settings/master/unit` | `units` |

### 11-5. カスタマイズ設定
| エンティティ | カスタマイズ項目 |
|---|---|
| 案件 | 案件ステータス / 案件種別 / テンプレート / 一覧設定 |
| 見積 | テンプレート / メールテンプレート / カスタムレイアウト（PDF）/ 一覧設定 |
| 請求 | テンプレート / メールテンプレート / カスタムレイアウト / 一覧設定 |
| 予定 | イベントカラー / テンプレート / 一覧設定 |
| タスク | タスク種別 / 一覧設定 |
| 顧客 | 顧客種別 / テンプレート / 一覧設定 |
| 作業場所 | テンプレート / 一覧設定 |

→ 各エンティティに **テンプレート機能**（新規作成時の初期値を保存）あり

---

## 12. 必要な新規テーブル一覧（マイグレーション草案用）

### 12-1. マスタ系
- `project_statuses`（案件ステータス、カスタマイズ可）
- `project_categories`（案件種別）
- `client_categories`（顧客種別）
- `task_categories`（タスク種別）
- `cost_categories`（原価種別）
- `cost_classifications`（原価分類：材料/労務/外注/諸経費）
- `construction_categories`（工種）
- `products`（商品）
- `product_categories`（商品分類）
- `suppliers`（仕入先、既存vendorsをリネーム）
- `supplier_categories`（仕入先種別）
- `units`（単位：式/個/人工 等）
- `person_day_unit_prices`（人工単価）
- `event_colors`（予定の色分けマスタ）
- `event_resources`（車両・備品）
- `holidays`（祝日マスタ）

### 12-2. エンティティ系
- `sites`（作業場所、1顧客に複数）
- `customer_contacts`（先方担当者、1顧客に複数）
- `project_assignees`（案件×ユーザー×役割：受付/営業/現場）
- `contracts`（契約、1案件に複数可）
- `quotation_send_history`（見積送付履歴）
- `invoice_send_history`（請求送付履歴）
- `photo_albums`（写真台帳）
- `file_folders`（ファイルフォルダ階層）
- `event_templates`（予定テンプレート）
- `quotation_templates` / `invoice_templates` / `client_templates` / `location_templates` / `project_templates`（各テンプレート）
- `email_templates`（メールテンプレート）
- `pdf_layouts`（PDFカスタムレイアウト）
- `list_views`（カスタムビュー設定）

### 12-3. 組織設定系
- `organization_info`（登録番号・社印）
- `amount_settings`（金額端数処理）
- `subscriptions`（プラン契約）

### 12-4. 既存テーブル拡張
- `projects`: + `project_category_id`, `site_id`, `customer_contact_id`, `各ステータス到達日`(reached_at系), 税区分
- `customers`: + `code`, `category_id`, `furigana`, `closing_day`(請求締日), `payment_month`, `payment_day`
- `estimates`: + `status` ENUM(draft/submitted/won/lost), `amount_excl_tax`, `cost_amount_excl_tax`, `gross_profit`, `client_id_for_quotation`
- `invoices`: + `original_amount`, `original_paid_amount`, `last_paid_at`, `payment_method`, `status` ENUM(unbilled/billed/partially_paid/paid)
- `daily_reports`: + `target_user_id`(対象者), `start_time`(出勤), `end_time`(退勤), `status`(draft/approved), `total_person_days`(合計人工), `cost_converted`(変換済みフラグ)
- `costs`: + `registration_type`(direct/converted), `classification_id`, `category_id`, `item_name`, `specification`, `quantity`, `unit_id`, `unit_price`, `amount_excl_tax`, `amount_incl_tax`, `supplier_id`, `construction_category_id`
- `vendors` → `suppliers` にリネーム
- `tasks`: + `category_id`, `client_id`, `assigned_to`, `due_date`

---

## 13. 既存docs記載と現実のズレ（要確定事項）

| # | 項目 | docs定義 | サクミル実装 | 対応 |
|---|---|---|---|---|
| 1 | `member_role` ENUM | 5値 owner/admin/manager/worker/office | サクミルは2-3階層（組織管理者ほか） | 井手様指定の5階層で独自設計 |
| 2 | `project_status` ENUM | 4値 quoting/active/completed/cancelled | カスタマイズ可7値 | マスタテーブル化 |
| 3 | `invoice_status` ENUM | 4値 unpaid/paid/overdue/void | 4値 未請求/請求済み/一部入金/入金完了 | 値を置換 |
| 4 | Storage バケット | photos/documents/avatars 定義済 | 未実装（マイグレーション） | 追加マイグレーション要 |
| 5 | RLS の権限差 | 全社員同一 | 役割なし（組織管理者のみ） | 5階層RLSポリシー追加 |
| 6 | 取引先（下請け） | 不明 | サクミルにも明示なし | `member_role` に `vendor` 追加 |

---

## 14. 次のアクション

1. このマッピング表をベースに **修正マイグレーション SQL 草案** を作成
2. 井手様確認後、Supabase に適用
3. Phase 1 機能（案件管理＋写真図面管理）の実装着手
