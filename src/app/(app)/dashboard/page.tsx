import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  // Aggregate KPIs. RLS が自動でテナント境界を強制してくれる。
  const [projectsRes, customersRes, invoicesRes] = await Promise.all([
    supabase.from("projects").select("id, status, budget", { count: "exact" }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("invoices").select("amount, status"),
  ]);

  const projects = projectsRes.data ?? [];
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
  const invoices = invoicesRes.data ?? [];
  const unpaid = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="進行中案件" value={`${activeProjects}件`} tone="brand" />
        <Kpi label="顧客数" value={`${customersRes.count ?? 0}社`} tone="emerald" />
        <Kpi
          label="総契約金額"
          value={`¥${totalBudget.toLocaleString("ja-JP")}`}
          tone="orange"
        />
        <Kpi
          label="未入金残高"
          value={`¥${unpaid.toLocaleString("ja-JP")}`}
          tone="rose"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h2 className="font-bold mb-3">進行中案件</h2>
        {projects.filter((p) => p.status === "active").length === 0 ? (
          <p className="text-sm text-slate-500">
            進行中の案件はありません。「案件管理」から登録してください。
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {projects
              .filter((p) => p.status === "active")
              .map((p: any) => (
                <li key={p.id}>• {p.id}</li>
              ))}
          </ul>
        )}
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
