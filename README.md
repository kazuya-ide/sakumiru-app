# Sakumiru-like Construction Management SaaS

現場管理SaaS (サクミル参考) のフルスタックリポジトリ。

- **フロント**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **ホスティング**: Vercel (フロント) / Supabase Cloud (BE)
- **CI/CD**: GitHub Actions

## 🚀 セットアップ

```bash
# 1. 依存パッケージインストール
pnpm install     # or npm install / yarn

# 2. Supabase CLI をインストール (初回のみ)
npm install -g supabase

# 3. ローカル Supabase を起動 (Docker Desktop が必要)
supabase start

# 4. 環境変数を設定
cp .env.example .env.local
# supabase start の出力から NEXT_PUBLIC_SUPABASE_URL / ANON_KEY を .env.local にコピー

# 5. マイグレーションとシード実行
supabase db reset   # migrations + seed.sql を実行

# 6. Next.js 起動
pnpm dev
# → http://localhost:3000
```

## 📁 ディレクトリ構成

```
sakumiru-app/
├── .github/workflows/      # CI/CD (Next.js build / Supabase deploy)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # ログイン・サインアップ
│   │   └── (app)/          # 認証後の画面群 (ダッシュボード等)
│   ├── components/         # UIコンポーネント
│   ├── lib/
│   │   ├── supabase/       # Supabase client (browser/server/middleware)
│   │   └── plans/          # プラン別機能制限ロジック
│   └── types/              # TypeScript型定義
├── supabase/
│   ├── migrations/         # DB マイグレーション (SQL)
│   ├── functions/          # Edge Functions
│   ├── seed.sql            # 初期データ
│   └── config.toml
├── docs/                   # 仕様書・設計ドキュメント
└── middleware.ts           # 認証・テナント分離
```

## 🧩 プラン構成

| プラン | 月額 | 機能 |
|----|----|----|
| **Starter** | ¥4,800 | 顧客管理 / 案件管理 / 見積管理 / 請求管理 |
| **Standard** | ¥9,800 | + スケジュール / 工事台帳 / ファイル管理 / 作業日報 / 写真管理 |
| **Business** | ¥19,800 | + 実行予算・原価管理 / 出面管理 / 発注・仕入管理 |

詳細は [docs/features.md](./docs/features.md) 参照。

## 🔄 開発フロー

```
# 新しいマイグレーションを作る
supabase migration new add_photos_table

# SQL を書く
# supabase/migrations/<timestamp>_add_photos_table.sql

# ローカル DB に反映
supabase db reset

# 型を再生成
pnpm gen:types

# コミット & プッシュ
git add supabase/migrations
git commit -m "feat(db): add photos table"
git push origin feature/photos

# PR → main マージで GitHub Actions が Supabase 本番にデプロイ
```

## 📚 ドキュメント

- [機能一覧とプラン](./docs/features.md)
- [アーキテクチャ](./docs/architecture.md)
- [データモデル](./docs/data-model.md)

## 🔑 環境変数

[.env.example](./.env.example) 参照。本番の Supabase URL/Key は Vercel の環境変数に設定。

## 📄 ライセンス

Proprietary. All rights reserved.
