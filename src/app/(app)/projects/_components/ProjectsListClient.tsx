"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, Settings2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import DetailFilterModal, { type DetailFilters } from "./DetailFilterModal";
import ProjectCreateModal from "./ProjectCreateModal";

export type ProjectRow = {
  id: string;
  code: string | null;
  name: string;
  budget_excl_tax: number | null;
  budget_incl_tax: number | null;
  received_at: string | null;
  started_at: string | null;
  project_status: { id: string; name: string; color: string | null } | null;
  project_category: { name: string } | null;
  customer: { code: string | null; name: string } | null;
  site: { code: string | null; name: string } | null;
  customer_contact: { code: string | null; name: string } | null;
  project_assignees: { role: string; user_id: string }[] | null;
};

export type StatusOption = { id: string; name: string; color: string | null };
export type CustomerOption = { id: string; code: string | null; name: string };
export type CategoryOption = { id: string; name: string; color: string | null };
export type SiteOption = {
  id: string;
  code: string | null;
  name: string;
  customer_id: string;
};
export type ContactOption = {
  id: string;
  code: string | null;
  name: string;
  customer_id: string;
};

type Tab = "all" | "active" | "billing";

type Props = {
  projects: ProjectRow[];
  statusOptions: StatusOption[];
  customers: CustomerOption[];
  categories: CategoryOption[];
  sites: SiteOption[];
  contacts: ContactOption[];
};

// 進行中ステータスの判定（タブ切替用）
const ACTIVE_STATUSES = ["受注", "段取り済み", "着手済み"];
const BILLING_STATUSES = ["完了"];

export default function ProjectsListClient({
  projects,
  statusOptions,
  customers,
  categories,
  sites,
  contacts,
}: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [billingStatus, setBillingStatus] = useState<string>("");
  const [detailFilters, setDetailFilters] = useState<DetailFilters>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const detailCount = useMemo(
    () => Object.values(detailFilters).filter((v) => v && v !== "").length,
    [detailFilters],
  );

  // フィルタリング（タブ → キーワード → ステータス → 詳細）
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      // タブ
      const sname = p.project_status?.name;
      if (tab === "active" && (!sname || !ACTIVE_STATUSES.includes(sname)))
        return false;
      if (tab === "billing" && (!sname || !BILLING_STATUSES.includes(sname)))
        return false;

      // キーワード
      if (keyword) {
        const k = keyword.toLowerCase();
        const matched =
          p.name.toLowerCase().includes(k) ||
          p.code?.toLowerCase().includes(k) ||
          p.customer?.name.toLowerCase().includes(k) ||
          p.site?.name.toLowerCase().includes(k);
        if (!matched) return false;
      }
      // ステータス multi
      if (selectedStatusIds.length > 0 && p.project_status) {
        if (!selectedStatusIds.includes(p.project_status.id)) return false;
      }
      // 詳細フィルター
      const f = detailFilters;
      if (f.customerName && !p.customer?.name.includes(f.customerName))
        return false;
      if (f.siteName && !p.site?.name.includes(f.siteName)) return false;
      if (
        f.contactName &&
        !p.customer_contact?.name.includes(f.contactName)
      )
        return false;
      if (f.receivedFrom && p.received_at && p.received_at < f.receivedFrom)
        return false;
      if (f.receivedTo && p.received_at && p.received_at > f.receivedTo)
        return false;
      if (f.startedFrom && p.started_at && p.started_at < f.startedFrom)
        return false;
      if (f.startedTo && p.started_at && p.started_at > f.startedTo)
        return false;
      const budget = p.budget_excl_tax ?? 0;
      if (f.budgetMin && budget < Number(f.budgetMin)) return false;
      if (f.budgetMax && budget > Number(f.budgetMax)) return false;
      return true;
    });
  }, [projects, tab, keyword, selectedStatusIds, detailFilters]);

  // 集計（合計行）
  const totals = useMemo(() => {
    const sumExcl = filtered.reduce(
      (s, p) => s + (p.budget_excl_tax ?? 0),
      0,
    );
    return {
      count: filtered.length,
      budgetExcl: sumExcl,
      // 原価合計と粗利は Phase 2（INC-006 dashboard と同じ理由で集計未実装）
      cost: null as number | null,
      profit: null as number | null,
    };
  }, [filtered]);

  function clearAll() {
    setKeyword("");
    setSelectedStatusIds([]);
    setBillingStatus("");
    setDetailFilters({});
  }

  // 担当者の role → 名前ヘルパー（user_id は短縮表示。Phase 2 で memberships JOIN）
  function assigneeOf(p: ProjectRow, role: string): string {
    const a = p.project_assignees?.find((x) => x.role === role);
    return a ? a.user_id.slice(0, 6) + "…" : "-";
  }

  return (
    <div>
      {/* 上段: タブ + 操作ボタン */}
      <div className="flex items-end justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1 border-b border-slate-200 -mb-px">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            全ての案件
          </TabButton>
          <TabButton active={tab === "active"} onClick={() => setTab("active")}>
            進行案件
          </TabButton>
          <TabButton
            active={tab === "billing"}
            onClick={() => setTab("billing")}
          >
            請求管理
          </TabButton>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="一覧設定は Phase 2 で実装予定"
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed"
          >
            <Settings2 className="w-4 h-4" />
            一覧設定
          </button>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" />
            案件を作成
          </button>
        </div>
      </div>

      {/* フィルターバー */}
      <div className="bg-white rounded-xl border p-3 md:p-4 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* 案件名キーワード */}
          <div className="md:col-span-4">
            <label className="block">
              <span className="text-xs text-slate-500">案件名・顧客・場所</span>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="部分一致で検索"
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>

          {/* 案件ステータス */}
          <div className="md:col-span-3">
            <label className="block">
              <span className="text-xs text-slate-500">案件ステータス</span>
              <MultiStatusSelect
                options={statusOptions}
                selected={selectedStatusIds}
                onChange={setSelectedStatusIds}
              />
            </label>
          </div>

          {/* 請求ステータス（UI のみ・Phase 2） */}
          <div className="md:col-span-3">
            <label className="block">
              <span className="text-xs text-slate-500">
                請求ステータス
                <span className="ml-1 text-[10px] text-slate-400">
                  (Phase 2)
                </span>
              </span>
              <select
                value={billingStatus}
                onChange={(e) => setBillingStatus(e.target.value)}
                disabled
                className="mt-1 w-full border rounded-lg px-2 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              >
                <option value="">全て</option>
                <option value="unbilled">未請求</option>
                <option value="partial">一部請求</option>
                <option value="billed">請求済</option>
                <option value="paid">入金済</option>
              </select>
            </label>
          </div>

          {/* 詳細フィルター + クリア */}
          <div className="md:col-span-2 flex md:flex-col items-stretch md:items-end gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 flex-1 md:flex-initial justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              詳細フィルター
              {detailCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold px-1">
                  {detailCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              全てクリア
            </button>
          </div>
        </div>
      </div>

      {/* テーブル（md以上） */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>案件番号</Th>
                <Th>案件名</Th>
                <Th>案件種別</Th>
                <Th>案件ステータス</Th>
                <Th>請求ステータス</Th>
                <Th>顧客コード</Th>
                <Th>顧客名</Th>
                <Th>作業場所コード</Th>
                <Th>作業場所名</Th>
                <Th>先方担当者コード</Th>
                <Th>先方担当者名</Th>
                <Th>受付担当者</Th>
                <Th>営業担当者</Th>
                <Th>現場責任者</Th>
                <Th align="right">契約金額（税抜）</Th>
                <Th align="right">原価合計（税抜）</Th>
                <Th align="right">粗利（税抜）</Th>
                <Th align="center">操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* 合計行 */}
              <tr className="bg-slate-50/60 font-medium">
                <Td colSpan={1}>合計: {totals.count}件</Td>
                <Td colSpan={13}></Td>
                <Td align="right">
                  ¥{totals.budgetExcl.toLocaleString("ja-JP")}
                </Td>
                <Td align="right" className="text-slate-300">
                  ¥{(totals.cost ?? 0).toLocaleString("ja-JP")}
                </Td>
                <Td align="right" className="text-slate-300">
                  ¥{(totals.profit ?? 0).toLocaleString("ja-JP")}
                </Td>
                <Td></Td>
              </tr>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={18}
                    className="text-center text-slate-400 py-8 text-sm"
                  >
                    案件がありません
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td>{p.code ?? "-"}</Td>
                    <Td>
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-brand-600 hover:underline font-medium"
                      >
                        {p.name}
                      </Link>
                    </Td>
                    <Td>{p.project_category?.name ?? "-"}</Td>
                    <Td>
                      <StatusBadge
                        label={p.project_status?.name}
                        color={p.project_status?.color}
                      />
                    </Td>
                    <Td className="text-slate-300">未請求</Td>
                    <Td>{p.customer?.code ?? "-"}</Td>
                    <Td>{p.customer?.name ?? "-"}</Td>
                    <Td>{p.site?.code ?? "-"}</Td>
                    <Td>{p.site?.name ?? "-"}</Td>
                    <Td>{p.customer_contact?.code ?? "-"}</Td>
                    <Td>{p.customer_contact?.name ?? "-"}</Td>
                    <Td>{assigneeOf(p, "reception")}</Td>
                    <Td>{assigneeOf(p, "sales")}</Td>
                    <Td>{assigneeOf(p, "site_manager")}</Td>
                    <Td align="right">
                      ¥{(p.budget_excl_tax ?? 0).toLocaleString("ja-JP")}
                    </Td>
                    <Td align="right" className="text-slate-300">
                      -
                    </Td>
                    <Td align="right" className="text-slate-300">
                      -
                    </Td>
                    <Td align="center">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        詳細
                      </Link>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* カード形式（md未満） */}
      <div className="md:hidden space-y-2">
        <div className="text-xs text-slate-500 mb-1">
          合計: <span className="font-bold text-slate-700">{totals.count}件</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">
            案件がありません
          </p>
        ) : (
          filtered.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition block"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-400">
                    {p.code ?? "-"}
                  </div>
                  <div className="font-bold text-sm truncate">{p.name}</div>
                </div>
                <StatusBadge
                  label={p.project_status?.name}
                  color={p.project_status?.color}
                />
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="truncate">
                  <span className="text-slate-400">顧客:</span>{" "}
                  {p.customer?.name ?? "-"}
                </div>
                <div className="truncate">
                  <span className="text-slate-400">場所:</span>{" "}
                  {p.site?.name ?? "-"}
                </div>
                <div>
                  <span className="text-slate-400">契約:</span> ¥
                  {(p.budget_excl_tax ?? 0).toLocaleString("ja-JP")}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 詳細フィルターモーダル */}
      <DetailFilterModal
        key={filterModalOpen ? "open" : "closed"}
        open={filterModalOpen}
        initial={detailFilters}
        onClose={() => setFilterModalOpen(false)}
        onApply={(f) => setDetailFilters(f)}
        onClear={() => setDetailFilters({})}
      />

      {/* 案件作成モーダル */}
      <ProjectCreateModal
        key={createModalOpen ? "create-open" : "create-closed"}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        statusOptions={statusOptions}
        customers={customers}
        categories={categories}
        sites={sites}
        contacts={contacts}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-2 text-sm font-medium border-b-2 transition " +
        (active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-slate-500 hover:text-slate-700")
      }
    >
      {children}
    </button>
  );
}

function MultiStatusSelect({
  options,
  selected,
  onChange,
}: {
  options: StatusOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    selected.length === 0
      ? "全て"
      : selected.length === 1
        ? (options.find((o) => o.id === selected[0])?.name ?? "1件")
        : `${selected.length}件選択中`;

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-center justify-between"
      >
        <span className={selected.length === 0 ? "text-slate-400" : ""}>
          {label}
        </span>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
            {options.map((s) => {
              const checked = selected.includes(s.id);
              return (
                <label
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      onChange(
                        checked
                          ? selected.filter((x) => x !== s.id)
                          : [...selected, s.id],
                      );
                    }}
                  />
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: s.color ?? "#9CA3AF" }}
                  />
                  <span>{s.name}</span>
                </label>
              );
            })}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-xs text-slate-500 hover:text-slate-700 underline mt-1"
              >
                クリア
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const a =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";
  return (
    <th className={`px-3 py-2.5 font-semibold ${a} whitespace-nowrap`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  colSpan,
  className = "",
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  colSpan?: number;
  className?: string;
}) {
  const a =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";
  return (
    <td
      colSpan={colSpan}
      className={`px-3 py-2.5 ${a} whitespace-nowrap ${className}`}
    >
      {children}
    </td>
  );
}
