import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// ============================================================
// 【INC-006 暫定実装】
// 旧ダッシュボードは projects.status / projects.budget / invoices.amount /
// invoices.status といった「20260427000008_drop_legacy_project_status.sql」
// 以降に DROP / リネームされたカラムを参照しており、ランタイムで Supabase
// から PGRST204 を返されていた。
//
// Phase 2 で次の項目を新スキーマで再実装する:
//   - 進行中案件 = project_statuses.name in ('受注','段取り済み','着手済み')
//     のレコード件数 (project_status_id 経由)
//   - 総契約金額 = projects.budget_incl_tax の合計
//   - 未入金残高 = invoices.invoice_status='unpaid' の amount_incl_tax 合計
//   - 顧客数 = customers の count（これは旧来通りで OK）
//
// それまでは件数だけを安全に取得して表示する暫定 UI とする。
// ============================================================

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: projectsCount }, { count: customersCount }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">ダッシュボード</h1>
      <p className="text-xs text-slate-500 mb-6">
        Phase 2 で集計 KPI を新スキーマで再実装予定（docs/incident-log.md INC-006）
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="案件総数" value={`${projectsCount ?? 0}件`} tone="brand" />
        <Kpi label="顧客数" value={`${customersCount ?? 0}社`} tone="emerald" />
        <Kpi label="総契約金額" value="Phase 2" tone="orange" />
        <Kpi label="未入金残高" value="Phase 2" tone="rose" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 text-sm text-slate-600">
        進行中案件・未入金残高の集計は Phase 2 で実装します。
        現在は <Link className="underline text-brand-700" href="/projects">案件管理</Link> から個別に確認してください。
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "brand" | "emerald" | "orange" | "rose";
}) {
  const colors: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[tone]}`}>
      <div className="text-xs mb-1 text-slate-600">{label}</div>
      <div className="text-lg md:text-xl font-bold">{value}</div>
    </div>
  );
}
