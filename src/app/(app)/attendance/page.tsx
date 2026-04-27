import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: records, error } = await supabase
    .from("attendance")
    .select("id, work_date, hours, type, worker:workers(name), project:projects(name)")
    .order("work_date", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  const totalHours = (records ?? []).reduce((s, r) => s + (r.hours ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">出面管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 出面入力
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex justify-between items-center">
        <span className="text-sm text-blue-700 font-medium">総稼働時間</span>
        <span className="text-xl font-bold text-blue-700">
          {totalHours.toLocaleString("ja-JP")} h
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">日付</th>
              <th className="text-left px-4 py-2">作業員</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">区分</th>
              <th className="text-right px-4 py-2">時間</th>
            </tr>
          </thead>
          <tbody>
            {(records ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  出面データがまだ登録されていません
                </td>
              </tr>
            ) : (
              records!.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">{r.work_date}</td>
                  <td className="px-4 py-2 font-medium">
                    {(r.worker as any)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    {(r.project as any)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">{r.type ?? "日勤"}</td>
                  <td className="px-4 py-2 text-right">{r.hours}h</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
