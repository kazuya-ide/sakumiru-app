import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, name, start_date, end_date, progress, project:projects(name)")
    .order("sort_order", { ascending: true });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">工事台帳</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 工程追加
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">工程名</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">開始</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">終了</th>
              <th className="text-left px-4 py-2">進捗</th>
            </tr>
          </thead>
          <tbody>
            {(tasks ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  工程がまだ登録されていません
                </td>
              </tr>
            ) : (
              tasks!.map((t) => (
                <tr key={t.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{t.name}</td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    {(t.project as any)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">{t.start_date ?? "-"}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{t.end_date ?? "-"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-[60px]">
                        <div
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{t.progress}%</span>
                    </div>
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
