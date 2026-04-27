import { createClient } from "@/lib/supabase/server";
import ProjectsListClient, {
  type ProjectRow,
  type StatusOption,
} from "./_components/ProjectsListClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();

  // 案件一覧（マスタJOIN）
  // サクミル準拠: 担当者群もまとめて取得し、テーブル列に表示
  const { data: rawProjects, error } = await supabase
    .from("projects")
    .select(
      `
      id, code, name, budget_excl_tax, budget_incl_tax,
      received_at, started_at,
      project_status:project_statuses(id, name, color),
      project_category:project_categories(name),
      customer:customers(code, name),
      site:sites(code, name),
      customer_contact:customer_contacts(code, name),
      project_assignees(role, user_id)
    `,
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-700">
        エラー: {error.message}
      </div>
    );
  }

  // ステータスマスタ（フィルター用）
  const { data: statuses } = await supabase
    .from("project_statuses")
    .select("id, name, color")
    .order("sort_order", { ascending: true });

  // 顧客マスタ（作成モーダル用、Phase 2 でも使い回す）
  const { data: customers } = await supabase
    .from("customers")
    .select("id, code, name")
    .is("deleted_at", null)
    .order("code", { ascending: true });

  // 案件種別マスタ（作成モーダル用）
  const { data: categories } = await supabase
    .from("project_categories")
    .select("id, name, color")
    .order("sort_order", { ascending: true });

  // 作業場所 / 先方担当者（作成モーダルで顧客→絞り込み）
  const { data: sites } = await supabase
    .from("sites")
    .select("id, code, name, customer_id")
    .order("code", { ascending: true });

  const { data: contacts } = await supabase
    .from("customer_contacts")
    .select("id, code, name, customer_id")
    .order("code", { ascending: true });

  const projects = (rawProjects ?? []) as unknown as ProjectRow[];
  const statusOptions = (statuses ?? []) as StatusOption[];

  return (
    <ProjectsListClient
      projects={projects}
      statusOptions={statusOptions}
      customers={customers ?? []}
      categories={categories ?? []}
      sites={sites ?? []}
      contacts={contacts ?? []}
    />
  );
}
