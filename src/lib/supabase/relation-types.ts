// ============================================================
// Supabase の relation join (.select('foo:foos(name)' 等) の戻り値型
//
// 【背景・INC-006】
// Supabase の自動生成型は relation join を常に配列 (`T[]`) として推論するが、
// 実際の to-one 関係（FK 参照）では単一オブジェクトが返ってくる。
// この乖離を吸収するため、本ファイルで「単一 or 配列の両対応型」と
// 「最初の name を安全に取り出すヘルパー」を提供する。
// これにより `as any` を一切使わずに型安全にアクセスできる。
// ============================================================

import type { Database } from "./database.types";

/** name フィールドを持つ relation 結果（単一・配列・null すべて対応） */
export type RelationName =
  | { name: string }
  | { name: string }[]
  | null;

/**
 * relation join 結果から最初のレコードの name を安全に取り出す。
 * 単一オブジェクトでも配列でも null でも一貫して扱える。
 *
 *   const { data } = await supabase
 *     .from('attendance')
 *     .select('id, worker:workers(name), project:projects(name)');
 *   data?.forEach(r => console.log(relName(r.worker), relName(r.project)));
 */
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

/** companies の最小情報（layout で plan / name を読む用） */
export type RelationCompany =
  | Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "plan">
  | Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "plan">[]
  | null;

/** RelationCompany から「最初の」company を 1 件取り出す */
export function firstCompany(
  c: RelationCompany | undefined,
):
  | Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "plan">
  | undefined {
  if (!c) return undefined;
  return Array.isArray(c) ? c[0] : c;
}
