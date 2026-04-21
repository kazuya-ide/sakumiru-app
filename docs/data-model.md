# データモデル

## ER図 (簡易)

```
auth.users ─┬─ memberships ──┬── companies ─┬─ customers
            │                │              ├─ projects ─┬─ tasks
            │                │              │            ├─ schedules
            │                │              │            ├─ estimates ─── estimate_items
            │                │              │            ├─ invoices
            │                │              │            ├─ files
            │                │              │            ├─ photos
            │                │              │            ├─ daily_reports
            │                │              │            ├─ costs
            │                │              │            └─ attendance
            │                │              ├─ workers
            │                │              ├─ vendors
            │                │              └─ purchase_orders ── purchase_order_items
```

## 主要テーブル定義

### companies (テナント)
| カラム | 型 | 備考 |
|----|----|----|
| id | uuid (PK) | |
| name | text | 会社名 |
| plan | plan_tier | 'starter' / 'standard' / 'business' |

### memberships (ユーザー ↔ 会社)
| カラム | 型 | 備考 |
|----|----|----|
| user_id | uuid (FK auth.users) | |
| company_id | uuid (FK companies) | |
| role | member_role | 'owner'/'admin'/'manager'/'worker'/'office' |

1ユーザーが複数会社に所属することも可能 (将来的にマルチ会社切り替えUI対応)。

### projects (案件)
| カラム | 型 | 備考 |
|----|----|----|
| id | uuid (PK) | |
| company_id | uuid (FK) | **RLSスコープキー** |
| code | text | 案件コード (P-2026-001 等) |
| name | text | 案件名 |
| customer_id | uuid (FK customers) | |
| status | project_status | quoting/active/completed/cancelled |
| start_date / end_date | date | |
| budget | bigint | 契約金額 (円、整数) |

### 金額の扱い

- **bigint (円単位)** で統一。浮動小数点は禁止 (丸め誤差)
- 税計算は `amount * tax_rate / 100` で整数演算、端数は切り捨て
- 表示時のみ `toLocaleString('ja-JP')` でカンマ区切り

### 日付の扱い

- `date` 型を基本とする (時刻不要な場合)
- タイムスタンプは `timestamptz` (UTC保存、表示時にJSTへ変換)

## インデックス方針

- すべての `company_id` カラムに単独インデックス (RLS高速化)
- 頻出検索カラム (`company_id + date`) は複合インデックス
- `projects.status`, `invoices.status` など列挙型はBitmapスキャン効いて不要

## マイグレーション運用

- 1マイグレーション = 1トランザクション。ALTERと大量DMLは別ファイルに
- カラム削除は **2段階デプロイ** (deprecate → 削除)
- 本番で大きなテーブルにカラム追加する場合は `default` 値を付けず後続でUPDATE (ロック短縮)

## Supabase Storage バケット設計

| バケット | 用途 | 公開 | 命名 |
|----|----|----|----|
| `photos` | 現場写真 | Private | `{company_id}/{project_id}/{uuid}.jpg` |
| `documents` | 契約書・図面 | Private | `{company_id}/{project_id}/{uuid}_{filename}` |
| `avatars` | ユーザーアバター | Public | `{user_id}.png` |

Storage にも RLS ポリシー (path の先頭セグメントが自社 company_id と一致) を設定。
