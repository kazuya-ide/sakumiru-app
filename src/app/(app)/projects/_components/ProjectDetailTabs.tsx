import Link from "next/link";

const TABS = [
  { id: "project", label: "案件管理" },
  { id: "quotation", label: "見積" },
  { id: "project-contract", label: "契約" },
  { id: "cost-budget", label: "実行予算" },
  { id: "cost-detail", label: "原価明細" },
  { id: "work-result", label: "作業実績・日報" },
  { id: "invoice", label: "請求・入金" },
] as const;

type Props = {
  projectId: string;
  activeTab: string;
  children: React.ReactNode;
};

export default function ProjectDetailTabs({
  projectId,
  activeTab,
  children,
}: Props) {
  return (
    <div>
      {/* タブナビ（横スクロール対応）*/}
      <div className="bg-white rounded-t-xl border border-b-0 overflow-x-auto">
        <nav className="flex min-w-max">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <Link
                key={t.id}
                href={`/projects/${projectId}?tab=${t.id}`}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? "border-brand-600 text-brand-600 font-bold bg-brand-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* タブの中身 */}
      <div className="bg-slate-50 rounded-b-xl border border-t-0 p-3 md:p-4">
        {children}
      </div>
    </div>
  );
}
