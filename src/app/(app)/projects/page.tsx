import { createClient } from "@/lib/supabase/server";
import ProjectsListClient, {
  type ProjectRow,
  type StatusOption,
} from "./_components/ProjectsListClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();

  // 案件一覧（マスタJOIN）
  const { data: rawProjects, error } = await supabase
    .from("projects")
    .select(
      `
      id, code, name, budget_excl_tax,
      received_at, started_at,
      project_status:project_statuses(name, color),
      project_category:project_categories(name),
      customer:customers(code, name),
      site:sites(code, name),
      customer_contact:customer_contacts(code, name)
    `
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

  // 型を整形（Supabaseの自動型は少し緩いので型アサーション）
  const projects = (rawProjects ?? []) as unknown as ProjectRow[];
  const statusOptions = (statuses ?? []) as StatusOption[];

  return (
    <ProjectsListClient projects={projects} statusOptions={statusOptions} />
  );
}
