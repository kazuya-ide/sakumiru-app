# アーキテクチャ

## 技術スタック

```
┌─────────────────────────────────────────────┐
│ Vercel (Next.js 14 App Router)              │
│  ├─ SSR / Server Components                  │
│  ├─ Server Actions (CRUD)                    │
│  ├─ Middleware (認証チェック)                │
│  └─ Tailwind CSS + TypeScript                │
└──────────────┬──────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────┐
│ Supabase                                    │
│  ├─ Postgres 15 (with RLS)                   │
│  ├─ Auth (email/pass, OAuth)                 │
│  ├─ Storage (写真・書類)                     │
│  ├─ Edge Functions (外部連携・バッチ)        │
│  └─ Realtime (通知・コラボ)                  │
└─────────────────────────────────────────────┘
```

## マルチテナント戦略

**方式**: 単一DB + `company_id` 行レベル分離 (Shared Schema)

- すべての業務テーブルに `company_id uuid not null` を必須化
- RLS ポリシーで `company_id = current_company_id()` を強制
- `current_company_id()` は SECURITY DEFINER 関数で memberships テーブルを参照

### なぜこの方式か

| 方式 | メリット | デメリット |
|----|----|----|
| Shared Schema (採用) | コスト低・運用シンプル | 大口顧客データ混在の懸念 |
| Schema per tenant | 隔離性高 | スキーマ変更コスト大 |
| DB per tenant | 完全隔離 | 数十社で破綻 |

初期は Shared Schema で進め、数百社規模になったら Enterprise プランのみ DB分離、という段階的戦略が定石。

## 認証フロー

```
1. ユーザーがサインアップ (email + password)
   ↓
2. auth.users に追加される (Supabase Auth)
   ↓
3. TRIGGER on_auth_user_created が発火
   - companies に新規会社を作成
   - memberships に user ↔ company (role=owner) を挿入
   ↓
4. Middleware で companies/memberships を照会 → current_company_id 確定
   ↓
5. 以降のリクエストは RLS で自動スコープ
```

## データフロー例: 日報を投稿

```
Client: Server Action を呼ぶ (formData)
   ↓
Server Action: createClient (cookies付き) で Supabase 接続
   ↓
INSERT INTO daily_reports (company_id, ...) VALUES (...)
   ↓
Postgres: RLS ポリシーが with check (company_id = current_company_id())
   → 自社以外へのINSERT は拒否される
   ↓
revalidatePath("/reports") で ISR キャッシュ破棄
```

## セキュリティ境界

- **Service Role Key は絶対にクライアントに出さない**
  - Webhook / バッチ処理 / Edge Functions のみ使用
- **RLS は必ずテーブル全部に有効化** + ポリシー記述
  - 忘れ防止のため CI でチェック (`pg_dump` + grep で `row security` 確認)
- **Auth Hook でカスタムクレーム** を JWT に埋め込みたい場合は将来対応
  - 現在は memberships テーブル参照方式 (シンプル優先)

## デプロイ環境

| 環境 | URL | ブランチ | Supabase |
|----|----|----|----|
| Local | localhost:3000 | - | `supabase start` |
| Preview | *.vercel.app | feature/* | Supabase Branch (PR単位) |
| Staging | staging.example.com | develop | staging-db |
| Production | app.example.com | main | production-db |

Vercel は Next.js をブランチごとに Preview デプロイ。Supabase の Branching 機能と連携すると、PR単位で DB スキーマも独立テストできる。

## 観測・運用

- **エラー監視**: Sentry (フロント+サーバー)
- **ログ**: Vercel Logs + Supabase Logs
- **分析**: PostHog (機能利用率・コンバージョン)
- **アップタイム**: Better Uptime or UptimeRobot
- **障害通知**: Slack Webhook
