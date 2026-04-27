# デプロイ・ビルドエラー記録

このファイルは Vercel 等のデプロイ時に発生したビルドエラーと、それに対する修正内容を時系列で記録します。
今後同じ問題が起きたとき、または別環境に移行する際の参考用。

---

## 2026-04-27: Vercel ビルドエラー — TypeScript 型注釈不足

### 環境
- Next.js: **16.2.4**（Turbopack）
- TypeScript: 5.5.x（`strict: true` / `noImplicitAny: true`）
- Supabase SSR: `@supabase/ssr@^0.5.0`
- デプロイ先: Vercel

### エラー内容（原文）

```
./src/lib/supabase/middleware.ts:15:16
型エラー: パラメータ 'cookiesToSet' は暗黙的に 'any' 型になっています。
13 |            return request.cookies.getAll();
14 |          },
>  15 |          setAll(cookiesToSet) {
   | ^
16 |            cookiesToSet.forEach(({ name, value }) =>
17 |              request.cookies.set(name, value)
18 |            );
Next.jsビルドワーカーがコード1、シグナルnullで終了しました。
エラー: コマンド「npm run build」が終了コード1で終了しました
```

### 原因

- `tsconfig.json` で `strict: true`（`noImplicitAny: true` を含む）が有効
- `setAll(cookiesToSet)` のパラメータ `cookiesToSet` に型注釈がないため `any` と推論される
- `noImplicitAny` 違反でコンパイルエラー
- 同パターンが `src/lib/supabase/server.ts` にも存在

### 修正

`@supabase/ssr` から `CookieOptions` をインポートし、ローカル型 `CookieToSet` を定義して明示的に注釈：

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// ...
setAll(cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => /* ... */);
}
```

修正対象：
- `src/lib/supabase/middleware.ts:15`
- `src/lib/supabase/server.ts:15`

### 関連する非推奨警告（npm install 時）

ビルドエラーではないが、依存関係に古いパッケージあり：

```
npm warn deprecated rimraf@3.0.2
npm warn deprecated inflight@1.0.6
npm warn deprecated @humanwhocodes/config-array@0.13.0
npm warn deprecated glob@7.2.3 / glob@10.3.10
npm warn deprecated @humanwhocodes/object-schema@2.0.3
npm warn deprecated node-domexception@1.0.0
npm warn deprecated tar@7.4.3
npm warn deprecated eslint@8.57.1
```

これらは主に **`eslint-config-next: 14.2.5`**（package.json 上の現行バージョン）が連鎖的に古い依存を引きずっているため。
Next.js 本体は 16.2.4（最新系）に上げているが、ESLint 周りの devDependencies が追従できていない。

### 今回は対応見送り（次フェーズで対応）

- `eslint-config-next` を 16 系へ更新するには ESLint 9 への移行が必要（破壊的変更あり）
- 現状の警告はビルドを止めない（INFO レベル）
- Phase 1 実装着手後、安定した時点で `npm-check-updates` で一括更新する想定

### バージョン更新の判断基準

| 状況 | 対応 |
|---|---|
| ビルドが止まる | 即時修正（今回の middleware.ts のような型エラー） |
| セキュリティ脆弱性（npm audit で HIGH/CRITICAL） | 24h 以内に修正 |
| 非推奨警告のみ | 月次でまとめて更新 |
| Major バージョン更新 | 別ブランチで検証してから main へ |

---

## ログ追加ルール

新しいビルドエラー・デプロイエラーが発生したら：

1. 上記のフォーマットでセクションを追加
2. 日付 + 環境 + エラー原文 + 原因 + 修正 を必ず記載
3. 同じエラーが再発しないように、根本原因と再発防止策まで書く
4. コミットメッセージにこのファイルの更新を明記

---

## 関連ドキュメント

- [docs/sakumiru-mapping.md](sakumiru-mapping.md) — サクミル画面とDB構造の対応表
- [docs/architecture.md](architecture.md) — 全体アーキテクチャ
- [docs/data-model.md](data-model.md) — データモデル
