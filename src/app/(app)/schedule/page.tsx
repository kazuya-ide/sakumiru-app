import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: schedules, error } = await supabase
    .from("schedules")
    .select("id, date, title, location, project:projects(name)")
    .order("date", { ascending: true });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">スケジュール</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 予定追加
        </button>
      </div>

      <div className="space-y-2">
        {(schedules ?? []).length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
            予定がまだ登録されていません
          </div>
        ) : (
          schedules!.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border p-4 flex gap-4 items-start shadow-sm">
              <div className="min-w-[80px] text-center">
                <div className="text-xs text-slate-500">{s.date?.slice(0, 7)}</div>
                <div className="text-2xl font-bold text-brand-600">
                  {s.date?.slice(8, 10)}
                </div>
              </div>
              <div>
                <div className="font-medium">{s.title}</div>
                {s.location && <div className="text-xs text-slate-500 mt-0.5">📍 {s.location}</div>}
                {(s.project as any)?.name && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    案件: {(s.project as any).name}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
