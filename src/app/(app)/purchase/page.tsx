import { createClient } from "@/lib/supabase/server";
import { relName } from "@/lib/supabase/relation-types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "下書き", cls: "bg-slate-100 text-slate-600" },
  sent: { label: "発注済", cls: "bg-blue-100 text-blue-700" },
  received: { label: "納品済", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "取消", cls: "bg-red-100 text-red-700" },
};

export default async function PurchasePage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("purchase_orders")
    .select("id, no, order_date, delivery_date, status, total_amount, vendor:vendors(name), project:projects(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  const total = (orders ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">発注・仕入管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 発注書作成
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-emerald-700 font-medium">発注総額</span>
        <span className="text-xl font-bold text-emerald-700">
          ¥{total.toLocaleString("ja-JP")}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">発注番号</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">業者</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2">発注日</th>
              <th className="text-right px-4 py-2">金額</th>
              <th className="text-left px-4 py-2">状態</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  発注データがまだ登録されていません
                </td>
              </tr>
            ) : (
              orders!.map((o) => {
                const st = STATUS_LABEL[o.status ?? "draft"] ?? STATUS_LABEL.draft;
                return (
                  <tr key={o.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{o.no ?? "-"}</td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {relName(o.vendor) ?? "-"}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {relName(o.project) ?? "-"}
                    </td>
                    <td className="px-4 py-2">{o.order_date}</td>
                    <td className="px-4 py-2 text-right">
                      ¥{(o.total_amount ?? 0).toLocaleString("ja-JP")}
                    </td>
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
