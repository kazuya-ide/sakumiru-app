import { createClient } from "@/lib/supabase/server";
import { relName } from "@/lib/supabase/relation-types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "未入金", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "入金済", cls: "bg-emerald-100 text-emerald-700" },
  overdue: { label: "延滞", cls: "bg-red-100 text-red-700" },
  void: { label: "無効", cls: "bg-slate-100 text-slate-600" },
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, no, issue_date, due_date, amount, status, project:projects(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">請求管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 新規請求
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">請求番号</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2">金額</th>
              <th className="text-left px-4 py-2">期日</th>
              <th className="text-left px-4 py-2">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  請求がまだ登録されていません
                </td>
              </tr>
            ) : (
              invoices!.map((inv) => {
                const st = STATUS_LABEL[inv.status] ?? STATUS_LABEL.unpaid;
                return (
                  <tr key={inv.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{inv.no ?? "-"}</td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {relName(inv.project) ?? "-"}
                    </td>
                    <td className="px-4 py-2">
                      ¥{(inv.amount ?? 0).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-2">{inv.due_date ?? "-"}</td>
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
