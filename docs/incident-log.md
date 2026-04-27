# インシデントログ（設計判断ミスの記録）

このファイルは「設計の判断ミス」「本番で実際に起きた事故」とその恒久対策を時系列で記録するためのものです。
**同じミスを繰り返さないために必ず追記してください。**

記録ルール:
- 1インシデント = 1セクション（INC-NNN 連番）
- 「症状 / 原因 / 修正 / 再発防止チェックリスト」の4点セットを必ず書く
- 関連 migration / commit / PR をリンクする

---

## INC-001: SECURITY DEFINER 関数の EXECUTE 権限を authenticated から外して全画面が落ちた

- **発生日**: 2026-04-27
- **影響範囲**: 本番フロント全画面（`/projects` 等、ログイン後の画面すべて）
- **影響時間**: 約 1.5 時間（ユーザー報告で発覚）
- **検出経路**: ユーザーが UI でエラーを目視（画面上に `permission denied for function current_company_id`）
- **関連 migration**: `20260427000006_security_hardening.sql`（事故原因）/ `20260427000013_fix_current_company_id_grant.sql`（修正）

### 症状

ログイン後の任意の画面で次のエラーが赤帯表示される:

```
エラー: permission denied for function current_company_id
```

DB 内のデータは正しく存在し、テストアカウントも正しい company_id に紐付いていたのに、UI 側に1件もデータが返らない状態。

### 直接原因

`20260427000006_security_hardening.sql` で次の REVOKE を実行していた:

```sql
revoke execute on function public.current_company_id() from authenticated;
```

`current_company_id()` は **すべての RLS ポリシー**から呼ばれる中核関数。
authenticated ロール（=ログイン済みユーザー）が EXECUTE 権限を失った瞬間、
RLS が関数を呼ぶたびに permission denied で落ち、結果としてフロントから
全テーブルが空 or エラーになった。

### 真因（=判断ミスの本体）

`20260427000006_security_hardening.sql` の冒頭コメントに次の記述があった:

> -- current_company_id は RLS ポリシー内で呼ばれる → REVOKE しても
> --   RLS 評価時は postgres ロールで実行されるため動作する

この前提が誤り。**RLS の評価は「クエリを発行したロール」のコンテキストで行われる**。
SECURITY DEFINER は「関数本体の中の処理」を関数所有者の権限で実行するが、
**関数を呼び出す権限（EXECUTE）はクエリ発行ロールに必要**。
authenticated に EXECUTE がないと、RLS の `using` 句で関数を呼んだ時点で弾かれる。

### 修正

`20260427000013_fix_current_company_id_grant.sql`:

```sql
grant execute on function public.current_company_id() to authenticated;
```

`handle_new_user` の方は trigger 専用で外部からは呼ばれないため REVOKE 維持。

### 再発防止チェックリスト

SECURITY DEFINER 関数に対して REVOKE / GRANT を変更する PR は、マージ前に
必ず以下を確認すること:

- [ ] その関数は **どのロール** から呼ばれるか洗い出した？
  - `authenticated` から呼ばれる関数（RLS ポリシー内、RPC、PostgREST）→ EXECUTE 必須
  - `anon` から呼ばれる関数（未ログインの公開 API）→ EXECUTE 必須
  - trigger 専用関数（auth.users INSERT 等）→ REVOKE OK（postgres が実行）
- [ ] その関数は **どこから呼ばれる** か grep した？
  - `grep -r 'current_company_id' supabase/migrations/` 等で参照箇所を全列挙
  - RLS ポリシーの `using (...)` / `with check (...)` の中身もチェック
- [ ] 本番適用前に **テストアカウントで実画面ログイン** を試した？
  - SQL クエリ単体ではなく、UI 経由で各画面が崩れていないか目視
- [ ] 「動くはず」というコメントを書く時、**実際に試した**？
  - 試していない推測コメントは禁止。試した結果のみ書く

### 副次的な気付き

- CI（`.github/workflows/ci.yml`）で本番と同じ migration をローカル Supabase に流しているが、
  この CI は **ログイン操作をしないため** RLS の動作確認まではしていない。
  → 今回のような「authenticated のみで顕在化する事故」は CI では捕まらない。
  将来は seed 後に「authenticated コンテキストで select する E2E チェック」を追加検討。

---

## INC-002: seed_test_data マイグレーションが CI で FK 違反になり CI が常時赤

- **発生日**: 2026-04-27
- **影響範囲**: GitHub Actions CI（本番デプロイには影響なし）
- **関連 migration**: `20260427000011_seed_test_data.sql`

### 症状

CI の "Verify Supabase migrations" ジョブで次のエラー:

```
ERROR: insert or update on table "project_categories" violates
       foreign key constraint "project_categories_company_id_fkey"
       (SQLSTATE 23503)
```

### 直接原因

`seed_test_data.sql` は固定 UUID `1710094d-36e6-4021-b81c-12943a97969d`
（=本番の testの会社 ID）を `company_id` として参照している。
本番 DB にはこの companies レコードが存在するため動くが、
CI が起動するまっさらなローカル Supabase には companies レコードがなく、
最初の `insert into project_categories ... values (cid, ...)` で FK 違反になる。

### 真因

「本番に手で作った前提のデータ ID」を migration に直書きしたため、
migration 単体で再現性がない状態になっていた。

### 修正

seed の冒頭で `companies` レコードを存在保証する idempotent な INSERT を追加:

```sql
insert into public.companies (id, name, plan)
values ('1710094d-36e6-4021-b81c-12943a97969d', 'テスト株式会社', 'starter')
on conflict (id) do nothing;
```

本番には既にレコードが存在するため `on conflict do nothing` で no-op。
CI ではこの行で companies レコードが作られ、後続の FK が通る。

### 再発防止チェックリスト

seed / data migration を書く時は必ず:

- [ ] migration 単体で **再現可能** か？（手で作ったレコードに依存していないか）
- [ ] 参照する外部キー先のレコードは **同じ migration 内 or 過去の migration で確実に存在** するか？
- [ ] 「on conflict do nothing」で **べき等**になっているか？（複数回流しても壊れない）
- [ ] `supabase db reset` を実行して **クリーン環境で再現テスト**したか？

---

---

## INC-003: Next.js 16 で `next lint` が廃止され CI Lint ジョブが常時赤

- **発生日**: 2026-04-27
- **影響範囲**: GitHub Actions CI / Lint ジョブ（本番デプロイには影響なし）
- **関連 commit**: 本コミット

### 症状

CI の `Lint / Typecheck / Build` ジョブで:

```
> sakumiru-app@0.1.0 lint
> next lint

Invalid project directory provided, no such directory:
  /home/runner/work/sakumiru-app/sakumiru-app/lint
```

### 直接原因

Next.js 16 で `next lint` コマンドは廃止された。`package.json` の
`"lint": "next lint"` がそのまま残っており、`npm run lint` が常に失敗する。

### 真因

Next.js 16 アップグレード時に `next lint` 廃止に追従せず、ESLint 9 への移行も
未完のまま CI スクリプトだけが古い前提で残っていた。

### 暫定修正 → **恒久修正済み（同日内に追加対応）**

最初は `package.json` の `lint` スクリプトを no-op に置換して CI を通した
（ANY型のような対症療法）が、ユーザーから「型チェックの ANY のような
その場しのぎはダメ」と指摘を受け、**同日中に正規対応に切り替えた**。

恒久対応の中身:

1. `eslint` 8 → 9、`eslint-config-next` 14.2.5 → 16.2.4 に更新
2. flat config 形式の `eslint.config.mjs` を新規作成
3. `eslint-config-next` 16.x は flat config 配列を直接 export しているため
   FlatCompat は不要（最初それで詰まった）
4. `package.json` の `lint` を `eslint .` に戻す
5. 自動生成ファイル（`database.types.ts`）は ignore に追加

```js
// eslint.config.mjs
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  { ignores: [".next/**", "node_modules/**", "src/lib/supabase/database.types.ts", ...] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];
```

これで本物の lint が動き出し、INC-006 の問題群（as any 14箇所 / setState in
effect / DROP済カラム参照 / Link 未使用 等）が一気に検出された。
それらの修正は INC-006 を参照。

### 再発防止チェックリスト

メジャーバージョンアップ系の PR は必ず:

- [ ] そのフレームワークの **Breaking Changes** ドキュメントを読んだ？
- [ ] CI の各ステップ（lint / typecheck / build / test）が **アップグレード後も通る** ことを確認した？
- [ ] 「使ってない」と判断したコマンドがある場合、`package.json` から削除 or no-op 化した？
- [ ] no-op 化した場合は **必ず incident-log に「恒久対応 TODO」を残す**
      （その場しのぎを永続化させない）

### 再発防止チェックリスト

メジャーバージョンアップ系の PR は必ず:

- [ ] そのフレームワークの **Breaking Changes** ドキュメントを読んだ？
- [ ] CI の各ステップ（lint / typecheck / build / test）が **アップグレード後も通る** ことを確認した？
- [ ] 「使ってない」と判断したコマンドがある場合、`package.json` から削除 or no-op 化した？

---

## INC-004: 旧 `supabase/seed.sql` が DROP 済みカラムを参照し CI が常時赤

- **発生日**: 2026-04-27
- **影響範囲**: GitHub Actions CI / Verify Supabase migrations（本番デプロイには影響なし）
- **関連 migration**: `20260427000008_drop_legacy_project_status.sql`（カラム削除元）
- **関連 commit**: 本コミット

### 症状

`supabase db reset` の最後の `Seeding data from supabase/seed.sql` 段階で:

```
ERROR: column "status" of relation "projects" does not exist (SQLSTATE 42703)
```

### 直接原因

`supabase/seed.sql` が次の旧スキーマカラムを参照:

```sql
insert into public.projects
  (company_id, code, name, status, start_date, end_date, budget) values ...
```

しかし `20260427000008_drop_legacy_project_status` で `projects.status` カラムは
`project_status_id` (FK to `project_statuses` マスタ) に置換済。
`start_date / end_date / budget` も `received_at / first_contracted_at / budget_*`
等にリネーム済。

### 真因

スキーマ変更時に migration は更新したが、`supabase/seed.sql` 側の追従を忘れた。
さらに「seed.sql」と「migration の seed 系 SQL（`20260427000011_seed_test_data.sql`）」
の **2 ファイルで同じテストデータを管理する二重構造** になっており、
新しい方だけ更新されて古い方が壊れた。

### 修正（本コミット）

- `supabase/seed.sql` を空のスタブに置き換え（コメントのみ）
- 経緯と「今後どこに seed を書くか」のルールをファイル冒頭に明記
- テストデータの単一ソースを `supabase/migrations/20260427000011_seed_test_data.sql`
  に確定

### 再発防止チェックリスト

スキーマ変更（特に DROP COLUMN / RENAME）の PR は必ず:

- [ ] `grep -r '<旧カラム名>' supabase/` で全参照を確認した？
- [ ] `supabase/seed.sql` も `migrations/*.sql` 同様にチェック対象に入っているか？
- [ ] 「テストデータの管理場所」を **1 箇所だけ** に保てているか？
  （seed.sql と migration seed の二重管理は禁止）

---

## INC-005: `Deploy Supabase` ワークフローが GitHub Secrets 未設定で常時赤

- **発生日**: 2026-04-27
- **影響範囲**: GitHub Actions / Deploy Supabase ジョブ（本番デプロイには影響なし）
- **関連ファイル**: `.github/workflows/supabase-deploy.yml`

### 症状

```
Run supabase link --project-ref "$SUPABASE_PROJECT_REF"
env:
  SUPABASE_ACCESS_TOKEN:
  SUPABASE_DB_PASSWORD:
  SUPABASE_PROJECT_REF:
Cannot find project ref. Have you run supabase link?
##[error]Process completed with exit code 1.
```

### 直接原因

ワークフローが要求する `SUPABASE_ACCESS_TOKEN` / `SUPABASE_DB_PASSWORD` /
`SUPABASE_PROJECT_REF` が GitHub リポジトリ Secrets に未登録。
push のたびに必ず失敗していた。

### 真因

migration 適用は当面「ローカル or MCP 経由で本番に手動 push」する運用に
切り替えていたのに、自動 deploy 用のワークフローを残したまま secrets
未設定 → 毎回赤で運用上のノイズになっていた。

### 修正（本コミット）

`supabase-deploy.yml` に `preflight` ジョブを追加し、`SUPABASE_PROJECT_REF`
secret が空ならば deploy ジョブ自体を skip する:

```yaml
preflight:
  outputs:
    configured: ${{ steps.check.outputs.configured }}
  steps:
    - id: check
      run: |
        if [ -n "$SUPABASE_PROJECT_REF" ]; then
          echo "configured=true" >> "$GITHUB_OUTPUT"
        else
          echo "configured=false" >> "$GITHUB_OUTPUT"
        fi

deploy:
  needs: preflight
  if: needs.preflight.outputs.configured == 'true'
  ...
```

これで secrets 未設定の現状では skip され CI 全体が緑になる。
将来 secrets を設定した時点で自動的に deploy が動き出す。

### 再発防止チェックリスト

外部サービス連携を要する CI ワークフローを追加する時は必ず:

- [ ] 必須 secrets が **未設定でも CI が緑** になるよう preflight skip を入れる？
- [ ] README or `docs/` に「設定すべき secrets 一覧」を明記する？
- [ ] 「使う気がないワークフロー」を残すなら、最低限 `if:` ガードで赤を出さない？

---

## INC-006: ESLint 9 を本物として動かしたら 18 件の本物の問題が出た

- **発生日**: 2026-04-27
- **影響範囲**: 全 `(app)/*/page.tsx`、ダッシュボード、DetailFilterModal、postcss.config.mjs
- **関連 commit**: 本コミット（INC-003 の恒久対応と同時に実施）

### 経緯

INC-003 で `eslint-config-next` 16.x + ESLint 9 + flat config を導入し、
`npm run lint` を no-op から本物に切り戻したところ、以下 18 件が検出された。

| カテゴリ | 件数 | 代表例 |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 14 | `(r.worker as any)?.name` |
| DROP 済カラム参照（型推論失敗） | 1 | dashboard の `p.status === "active"` |
| `react-hooks/set-state-in-effect` | 1 | DetailFilterModal の `useEffect` 内 setState |
| `@next/next/no-html-link-for-pages` | 1 | dashboard の `<a href="/projects">` |
| `import/no-anonymous-default-export` | 1 (warning) | postcss.config.mjs |

これらは「lint を黙らせていた間ずっと潜んでいた本物の問題」であり、
ANY 型という対症療法を放置することの危険性を示している。

### 修正方針と中身

#### A. `as any` × 14 → 共通 helper `relName()` に置換

Supabase の自動生成型は relation join (`select('foo:foos(name)')`) を
**常に配列 `T[]`** で型付けするが、実際の to-one 関係では単一オブジェクトが
返ってくる。この乖離を `as any` で逃げていたため一掃した。

新設: `src/lib/supabase/relation-types.ts`

```ts
export type RelationName = { name: string } | { name: string }[] | null;

export function relName(r: unknown): string | undefined {
  if (!r) return undefined;
  if (Array.isArray(r)) {
    const first = r[0];
    if (first && typeof first === "object" && "name" in first) {
      const n = (first as { name: unknown }).name;
      return typeof n === "string" ? n : undefined;
    }
    return undefined;
  }
  if (typeof r === "object" && "name" in r) {
    const n = (r as { name: unknown }).name;
    return typeof n === "string" ? n : undefined;
  }
  return undefined;
}

export type RelationCompany = ... | ...[] | null;
export function firstCompany(c: RelationCompany | undefined) { ... }
```

各ファイルで `(x.project as any)?.name ?? "-"` → `relName(x.project) ?? "-"`
に置換。型は完全に絞られ、any は1つも残っていない。

#### B. dashboard の DROP 済カラム参照

旧 dashboard は `projects.status` / `projects.budget` / `invoices.status` /
`invoices.amount` を直接 select していた。これらは
`20260427000008_drop_legacy_project_status.sql` 以降で DROP / リネーム済。
ランタイムでは Supabase が PGRST204 を返していたが、フロントは表示崩れだけで
気付きにくい状態だった。

Phase 2 で正式に再実装するまでは件数だけを安全に取得する暫定 UI に置換し、
ファイル冒頭に Phase 2 で実装すべきクエリを明記:

- 進行中案件 = `project_statuses.name in ('受注','段取り済み','着手済み')`
  に紐づく案件件数（`project_status_id` 経由）
- 総契約金額 = `projects.budget_incl_tax` の合計
- 未入金残高 = `invoices.invoice_status='unpaid'` の `amount_incl_tax` 合計

#### C. DetailFilterModal の `useEffect(() => setState(initial))`

`react-hooks/set-state-in-effect`（React 19 推奨）違反。
useEffect 内 setState は cascading render を招く。

修正: useEffect を削除し、親 (`ProjectsListClient`) で
`<DetailFilterModal key={modalOpen ? "open" : "closed"} ... />` と
key prop による再 mount で `useState` の初期値経由で reset するように変更。
React 公式推奨パターン。

#### D. `<a href="/projects">` → `<Link>`

Next.js 16 の `@next/next/no-html-link-for-pages` ルール違反。
`<a>` だとクライアント側ルーティングを使わずフルリロードになるため
`next/link` の `<Link>` に変更。

#### E. postcss.config.mjs の anonymous default export

`export default { ... }` を `const config = { ... }; export default config;` に。
named binding 経由で export することで lint warning 解消。

### 再発防止チェックリスト

- [ ] `as any` を書こうとした時、本当に「型を諦める」しかないか？
      多くの場合 `unknown` + 型ガード関数 / Pick 型 で代替可能
- [ ] スキーマ変更（DROP/RENAME）した時、その列を参照している
      アプリコードを `grep -rn '<col_name>' src/` で全件確認した？
- [ ] 「lint を黙らせる」「any で逃げる」誘惑が出たら、
      まず INC-006 を見て「あの時 18 件溜まっていた」事実を思い出す
- [ ] 新しい page.tsx を作る時、Supabase の relation join アクセスは
      `relName()` / `firstCompany()` 等の helper 経由で書く（直 `.name` 禁止）

### 副次的な気付き

- 暫定 stopgap (lint を no-op にする) を入れる時は **必ず incident-log に
  「次に必ずやるべき恒久対応」を書く**。さもなくば永久に放置される。
- 18 件の中には「型エラー」だけでなく「ランタイムバグ」(dashboard) も
  混じっていた。lint は単なるスタイルチェックではなく **本物のバグ検出器** であり、
  止めることは「飛行機の警告灯を絆創膏で隠す」のと同じ。

---

## 追加時のテンプレート

新しいインシデントを追記する時は次のテンプレートを使うこと:

```markdown
## INC-NNN: 一行サマリ

- **発生日**: YYYY-MM-DD
- **影響範囲**:
- **影響時間**:
- **検出経路**:
- **関連 migration / PR / commit**:

### 症状

### 直接原因

### 真因（=判断ミスの本体）

### 修正

### 再発防止チェックリスト

- [ ]
- [ ]
```
