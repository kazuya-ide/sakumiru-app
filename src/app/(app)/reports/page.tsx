import { createClient } from "@/lib/supabase/server";
import { relName } from "@/lib/supabase/relation-types";

export const dynamic = "force-dynamic";

const WEATHER_ICON: Record<string, string> = {
  晴れ: "☀️",
  曇り: "☁️",
  雨: "🌧️",
  雪: "❄️",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports, error } = await supabase
    .from("daily_reports")
    .select("id, report_date, weather, worker_count, content, project:projects(name)")
    .order("report_date", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">作業日報</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + 日報作成
        </button>
      </div>

      <div className="space-y-3">
        {(reports ?? []).length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
            日報がまだ登録されていません
          </div>
        ) : (
          reports!.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{r.report_date}</span>
                  {r.weather && (
                    <span className="text-sm">
                      {WEATHER_ICON[r.weather] ?? "🌤️"} {r.weather}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  作業員 {r.worker_count ?? 0}名
                </div>
              </div>
              {(() => {
                const projName = relName(r.project);
                return projName ? (
                  <div className="text-xs text-slate-400 mb-1">
                    案件: {projName}
                  </div>
                ) : null;
              })()}
              {r.content && (
                <p className="text-sm text-slate-700 line-clamp-2">{r.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
