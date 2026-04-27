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
