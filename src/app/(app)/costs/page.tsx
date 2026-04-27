import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: costs, error } = await supabase
    .from("costs")
    .select("id, cost_date, category, vendor, amount, memo, project:projects(name)")
    .order("cost_date", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  const total = (costs ?? []).reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">実行予算・原価管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 原価入力
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-orange-700 font-medium">原価合計</span>
        <span className="text-xl font-bold text-orange-700">
          ¥{total.toLocaleString("ja-JP")}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">日付</th>
              <th className="text-left px-4 py-2">カテゴリ</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">仕入先</th>
              <th className="text-right px-4 py-2">金額</th>
            </tr>
          </thead>
          <tbody>
            {(costs ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  原価データがまだ登録されていません
                </td>
              </tr>
            ) : (
              costs!.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">{c.cost_date}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    {(c.project as any)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">{c.vendor ?? "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    ¥{(c.amount ?? 0).toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
