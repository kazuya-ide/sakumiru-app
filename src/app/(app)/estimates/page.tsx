import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "下書き", cls: "bg-slate-100 text-slate-600" },
  sent: { label: "送付済", cls: "bg-blue-100 text-blue-700" },
  approved: { label: "承認", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "却下", cls: "bg-red-100 text-red-700" },
};

export default async function EstimatesPage() {
  const supabase = await createClient();
  const { data: estimates, error } = await supabase
    .from("estimates")
    .select("id, no, issue_date, status, tax_rate, project:projects(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">見積管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 新規見積
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">見積番号</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2">発行日</th>
              <th className="text-left px-4 py-2">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {(estimates ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  見積がまだ登録されていません
                </td>
              </tr>
            ) : (
              estimates!.map((e) => {
                const st = STATUS_LABEL[e.status ?? "draft"] ?? STATUS_LABEL.draft;
                return (
                  <tr key={e.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{e.no ?? "-"}</td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {(e.project as any)?.name ?? "-"}
                    </td>
                    <td className="px-4 py-2">{e.issue_date}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
