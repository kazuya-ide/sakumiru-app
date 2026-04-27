import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ProjectDetailTabs from "../_components/ProjectDetailTabs";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab ?? "project";

  const supabase = await createClient();

  // 案件詳細取得
  const { data: rawProject, error } = await supabase
    .from("projects")
    .select(
      `
      id, code, name, request_content, memo,
      received_at, first_contracted_at, started_at, work_started_at,
      completed_at, payment_completed_at, lost_at,
      budget_excl_tax, budget_tax, budget_incl_tax,
      project_status:project_statuses(id, name, color),
      project_category:project_categories(id, name),
      customer:customers(
        id, code, name, address, phone, email,
        closing_day, payment_month_offset, payment_day, payment_terms_memo, memo
      ),
      site:sites(id, code, name, postal_code, address, phone, fax, memo),
      customer_contact:customer_contacts(id, code, name, phone, email, memo)
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !rawProject) {
    notFound();
  }

  // Supabaseの型推論はJOINを配列扱いするので、明示的にキャスト
  const project = rawProject as unknown as ProjectFull;

  // 担当者
  const { data: assignees } = await supabase
    .from("project_assignees")
    .select("role, user_id")
    .eq("project_id", id);

  // タスク（未完了）
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, name, due_date, is_completed, assigned_to")
    .eq("project_id", id)
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(10);

  // 写真台帳
  const { data: albums } = await supabase
    .from("photo_albums")
    .select("id, name, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // ステータスタイムライン用の日付配列
  const timeline = [
    { label: "案件種別", value: project.project_category?.name ?? "-", icon: "📋" },
    { label: "受付日", value: project.received_at, icon: "📅" },
    { label: "初回契約日", value: project.first_contracted_at, icon: "📝" },
    { label: "開始日", value: project.started_at, icon: "🚀" },
    { label: "着手日", value: project.work_started_at, icon: "🔨" },
    { label: "完了日", value: project.completed_at, icon: "✅" },
    { label: "入金完了日", value: project.payment_completed_at, icon: "💰" },
    { label: "失注日", value: project.lost_at, icon: "❌" },
  ];

  return (
    <div className="space-y-4">
      {/* パンくず + 戻る */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/projects"
          className="inline-flex items-center text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
          案件一覧
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 truncate">{project.name}</span>
      </div>

      {/* ヘッダ */}
      <div className="bg-white rounded-xl border p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 mb-1">
              案件番号: {project.code ?? "未設定"}
            </div>
            <h1 className="text-xl md:text-2xl font-bold break-words">
              {project.name}
            </h1>
          </div>
          <button
            type="button"
            disabled
            title="編集機能は Phase 1.5 で実装予定"
            className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm text-slate-400 cursor-not-allowed"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">編集</span>
          </button>
        </div>

        {/* ステータスバッジ */}
        <div className="mb-4">
          <StatusBadge
            label={project.project_status?.name}
            color={project.project_status?.color}
            size="md"
          />
        </div>

        {/* タイムライン（横スクロール対応）*/}
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <div className="flex gap-2 min-w-max md:grid md:grid-cols-4 lg:grid-cols-8 md:min-w-0">
            {timeline.map((t) => (
              <div
                key={t.label}
                className="flex-shrink-0 w-32 md:w-auto bg-slate-50 rounded-lg p-2.5 text-center"
              >
                <div className="text-base">{t.icon}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {t.label}
                </div>
                <div className="text-xs font-bold mt-0.5 truncate">
                  {t.value ?? "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メイン: 2カラム（md以上）/ 1カラム（md未満） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左: サブタブ + コンテンツ */}
        <div className="lg:col-span-9 space-y-4">
          <ProjectDetailTabs projectId={project.id} activeTab={activeTab}>
            {activeTab === "project" && (
              <ProjectMainTab project={project} />
            )}
            {activeTab !== "project" && (
              <Placeholder tab={activeTab} />
            )}
          </ProjectDetailTabs>
        </div>

        {/* 右: サイドバー */}
        <aside className="lg:col-span-3 space-y-4">
          <SidebarCard title="✅ タスク（未完了）">
            {!tasks || tasks.length === 0 ? (
              <p className="text-xs text-slate-400">タスクはありません</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="text-xs">
                    <div className="font-medium">{t.name}</div>
                    {t.due_date && (
                      <div className="text-slate-400">{t.due_date}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SidebarCard>

          <SidebarCard title="👥 案件担当者">
            <AssigneeGroup
              assignees={(assignees ?? []) as { role: string; user_id: string }[]}
            />
          </SidebarCard>

          <SidebarCard title="📷 写真台帳">
            {!albums || albums.length === 0 ? (
              <p className="text-xs text-slate-400">写真台帳はありません</p>
            ) : (
              <ul className="space-y-2">
                {albums.map((a) => (
                  <li key={a.id} className="text-xs">
                    <div className="font-medium">{a.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </SidebarCard>
        </aside>
      </div>
    </div>
  );
}

// ===== 型 =====
type ProjectFull = ProjectDetail & {
  received_at: string | null;
  first_contracted_at: string | null;
  started_at: string | null;
  work_started_at: string | null;
  completed_at: string | null;
  payment_completed_at: string | null;
  lost_at: string | null;
  project_status: { id: string; name: string; color: string | null } | null;
  project_category: { id: string; name: string } | null;
};

type ProjectDetail = {
  id: string;
  code: string | null;
  name: string;
  request_content: string | null;
  memo: string | null;
  budget_excl_tax: number | null;
  budget_tax: number | null;
  budget_incl_tax: number | null;
  customer: {
    code: string | null;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    closing_day: number | null;
    payment_month_offset: number | null;
    payment_day: number | null;
    payment_terms_memo: string | null;
    memo: string | null;
  } | null;
  site: {
    code: string | null;
    name: string;
    postal_code: string | null;
    address: string | null;
    phone: string | null;
    fax: string | null;
    memo: string | null;
  } | null;
  customer_contact: {
    code: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    memo: string | null;
  } | null;
};

// ===== 「案件管理」サブタブの中身 =====
function ProjectMainTab({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-4">
      {/* 収支サマリ */}
      <Section title="📊 収支サマリ">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <SummaryCard
            label="契約金額"
            excl={project.budget_excl_tax}
            incl={project.budget_incl_tax}
          />
          <SummaryCard
            label="原価合計"
            excl={null}
            incl={null}
            note="集計機能は Phase 1.5"
          />
          <SummaryCard
            label="粗利"
            excl={null}
            incl={null}
            note="集計機能は Phase 1.5"
          />
        </div>
      </Section>

      {/* 案件情報 3ブロック */}
      <Section title="📋 案件情報">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InfoBlock title="顧客情報">
            <KV k="顧客コード" v={project.customer?.code} />
            <KV k="顧客名" v={project.customer?.name} />
            <KV k="住所" v={project.customer?.address} />
            <KV k="電話番号" v={project.customer?.phone} />
            <KV k="メール" v={project.customer?.email} />
            <KV
              k="請求締日"
              v={project.customer?.closing_day?.toString()}
            />
            <KV
              k="支払条件"
              v={project.customer?.payment_terms_memo}
            />
          </InfoBlock>

          <InfoBlock title="作業場所情報">
            <KV k="作業場所コード" v={project.site?.code} />
            <KV k="作業場所名" v={project.site?.name} />
            <KV k="郵便番号" v={project.site?.postal_code} />
            <KV k="住所" v={project.site?.address} />
            <KV k="電話番号" v={project.site?.phone} />
            <KV k="FAX" v={project.site?.fax} />
            <KV k="備考" v={project.site?.memo} />
          </InfoBlock>

          <InfoBlock title="先方担当者情報">
            <KV k="担当者コード" v={project.customer_contact?.code} />
            <KV k="担当者名" v={project.customer_contact?.name} />
            <KV k="電話番号" v={project.customer_contact?.phone} />
            <KV k="メール" v={project.customer_contact?.email} />
            <KV k="備考" v={project.customer_contact?.memo} />
          </InfoBlock>
        </div>
      </Section>

      {/* 案件補足 */}
      <Section title="📝 案件補足">
        <div className="space-y-3">
          <KV k="依頼内容" v={project.request_content} block />
          <KV k="備考" v={project.memo} block />
        </div>
      </Section>
    </div>
  );
}

// ===== 共通UI =====
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 md:p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-xs font-bold text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-3">
      <h3 className="text-xs font-bold text-slate-600 mb-2 uppercase">
        {title}
      </h3>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function KV({
  k,
  v,
  block = false,
}: {
  k: string;
  v?: string | null;
  block?: boolean;
}) {
  if (block) {
    return (
      <div>
        <dt className="text-[10px] text-slate-500">{k}</dt>
        <dd className="text-sm text-slate-700 whitespace-pre-wrap">
          {v || <span className="text-slate-300">-</span>}
        </dd>
      </div>
    );
  }
  return (
    <div className="flex justify-between text-xs gap-2">
      <dt className="text-slate-500 flex-shrink-0">{k}</dt>
      <dd className="text-slate-700 text-right truncate">
        {v || <span className="text-slate-300">-</span>}
      </dd>
    </div>
  );
}

function SummaryCard({
  label,
  excl,
  incl,
  note,
}: {
  label: string;
  excl: number | null;
  incl: number | null;
  note?: string;
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold mt-1">
        ¥{(excl ?? 0).toLocaleString("ja-JP")}
        <span className="text-xs text-slate-400 ml-1">税抜</span>
      </div>
      {incl != null && (
        <div className="text-[10px] text-slate-500">
          税込 ¥{incl.toLocaleString("ja-JP")}
        </div>
      )}
      {note && (
        <div className="text-[10px] text-slate-400 mt-1">{note}</div>
      )}
    </div>
  );
}

function AssigneeGroup({
  assignees,
}: {
  assignees: { role: string; user_id: string }[];
}) {
  const groups = {
    reception: assignees.filter((a) => a.role === "reception"),
    sales: assignees.filter((a) => a.role === "sales"),
    site_manager: assignees.filter((a) => a.role === "site_manager"),
  };
  const labels = {
    reception: "受付",
    sales: "営業",
    site_manager: "現場",
  } as const;

  return (
    <div className="space-y-2 text-xs">
      {(["reception", "sales", "site_manager"] as const).map((k) => (
        <div key={k}>
          <div className="text-[10px] text-slate-400">{labels[k]}</div>
          {groups[k].length === 0 ? (
            <div className="text-slate-300 text-xs">未割当</div>
          ) : (
            groups[k].map((a) => (
              <div key={a.user_id} className="text-slate-700 truncate">
                {a.user_id.slice(0, 8)}…
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function Placeholder({ tab }: { tab: string }) {
  const labels: Record<string, string> = {
    quotation: "見積",
    "project-contract": "契約",
    "cost-budget": "実行予算",
    "cost-detail": "原価明細",
    "work-result": "作業実績・日報",
    invoice: "請求・入金",
  };
  const name = labels[tab] ?? tab;
  return (
    <div className="bg-white rounded-xl border p-8 text-center">
      <div className="text-slate-300 text-4xl mb-2">🚧</div>
      <h2 className="text-base font-bold text-slate-700">
        「{name}」タブは Phase 1.5 で実装予定
      </h2>
      <p className="text-xs text-slate-500 mt-1">
        DB 側はテーブル作成済 / UI 実装中
      </p>
    </div>
  );
}
