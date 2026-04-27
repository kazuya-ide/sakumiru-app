"use server";

// ============================================================
// 案件管理 Server Actions
//
// クライアントから直接 Supabase 書き込みを行わず、Server Action 経由で
// バリデーション + RLS scope 確認 + revalidatePath まで一括で行う。
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateProjectSchema = z.object({
  // 顧客系（任意）
  customer_id: z.string().uuid().optional().nullable(),
  site_id: z.string().uuid().optional().nullable(),
  customer_contact_id: z.string().uuid().optional().nullable(),

  // 案件
  code: z.string().max(64).optional().nullable(),
  code_mode: z.enum(["auto", "manual"]),
  project_category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "案件名は必須です").max(255),
  project_status_id: z.string().uuid({ message: "案件ステータスは必須です" }),

  // 日付
  started_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),

  // テキスト
  request_content: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export type CreateProjectResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createProject(
  formData: FormData,
): Promise<CreateProjectResult> {
  const supabase = await createClient();

  // 認証チェック（middleware で守られているが二重に確認）
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "未ログインです" };

  // 所属会社取得（RLS でも判定されるが、INSERT に必要なため明示取得）
  const { data: membership } = await supabase
    .from("memberships")
    .select("company_id")
    .eq("user_id", user.id)
    .single();
  if (!membership)
    return { ok: false, error: "会社情報が取得できませんでした" };

  // FormData → object
  const raw = Object.fromEntries(formData.entries());
  const parsed = CreateProjectSchema.safeParse({
    customer_id: emptyToNull(raw.customer_id),
    site_id: emptyToNull(raw.site_id),
    customer_contact_id: emptyToNull(raw.customer_contact_id),
    code: emptyToNull(raw.code),
    code_mode: raw.code_mode,
    project_category_id: emptyToNull(raw.project_category_id),
    name: raw.name,
    project_status_id: raw.project_status_id,
    started_at: emptyToNull(raw.started_at),
    completed_at: emptyToNull(raw.completed_at),
    request_content: emptyToNull(raw.request_content),
    memo: emptyToNull(raw.memo),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" / "),
    };
  }
  const v = parsed.data;

  // 案件番号の決定
  let code: string | null = v.code ?? null;
  if (v.code_mode === "auto") {
    code = await generateProjectCode(supabase, membership.company_id);
  }

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({
      company_id: membership.company_id,
      code,
      name: v.name,
      project_category_id: v.project_category_id,
      project_status_id: v.project_status_id,
      customer_id: v.customer_id,
      site_id: v.site_id,
      customer_contact_id: v.customer_contact_id,
      started_at: v.started_at,
      completed_at: v.completed_at,
      request_content: v.request_content,
      memo: v.memo,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "登録に失敗しました" };
  }

  revalidatePath("/projects");
  return { ok: true, id: inserted.id };
}

// 案件番号 自動採番: P-YYYY-NNN（同年内の連番）
async function generateProjectCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `P-${year}-`;

  const { data: existing } = await supabase
    .from("projects")
    .select("code")
    .eq("company_id", companyId)
    .like("code", `${prefix}%`)
    .order("code", { ascending: false })
    .limit(1);

  const last = existing?.[0]?.code;
  const lastNum = last ? Number(last.replace(prefix, "")) : 0;
  const next = String((isFinite(lastNum) ? lastNum : 0) + 1).padStart(3, "0");
  return `${prefix}${next}`;
}

function emptyToNull(v: FormDataEntryValue | undefined): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
