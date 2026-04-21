import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  quoting: { label: "見積中", cls: "bg-amber-100 text-amber-700" },
  active: { label: "進行中", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", cls: "bg-slate-200 text-slate-700" },
  cancelled: { label: "中止", cls: "bg-red-100 text-red-700" },
};

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, code, name, status, start_date, end_date, budget, customer:customers(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">案件管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 新規
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(projects ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">案件がまだ登録されていません</p>
        ) : (
          projects!.map((p: any) => {
            const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.active;
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-slate-500">{p.code}</div>
                    <div className="font-bold">{p.name}</div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-1">
                  顧客: {p.customer?.name ?? "-"}
                </div>
                <div className="text-xs text-slate-500 mb-1">
                  工期: {p.start_date ?? "-"} 〜 {p.end_date ?? "-"}
                </div>
                <div className="text-xs text-slate-500">
                  予算: ¥{(p.budget ?? 0).toLocaleString("ja-JP")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
