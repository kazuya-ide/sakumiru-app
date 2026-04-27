"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import DetailFilterModal, { type DetailFilters } from "./DetailFilterModal";

export type ProjectRow = {
  id: string;
  code: string | null;
  name: string;
  budget_excl_tax: number | null;
  received_at: string | null;
  started_at: string | null;
  project_status: { name: string; color: string | null } | null;
  project_category: { name: string } | null;
  customer: { code: string | null; name: string } | null;
  site: { code: string | null; name: string } | null;
  customer_contact: { code: string | null; name: string } | null;
};

export type StatusOption = { id: string; name: string; color: string | null };

type Props = {
  projects: ProjectRow[];
  statusOptions: StatusOption[];
};

export default function ProjectsListClient({
  projects,
  statusOptions,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [detailFilters, setDetailFilters] = useState<DetailFilters>({});
  const [modalOpen, setModalOpen] = useState(false);

  // 詳細フィルター数（バッジ用）
  const detailCount = useMemo(
    () => Object.values(detailFilters).filter((v) => v && v !== "").length,
    [detailFilters]
  );

  // フィルタリング
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      // キーワード検索
      if (keyword) {
        const k = keyword.toLowerCase();
        const matched =
          p.name.toLowerCase().includes(k) ||
          p.code?.toLowerCase().includes(k) ||
          p.customer?.name.toLowerCase().includes(k) ||
          p.site?.name.toLowerCase().includes(k);
        if (!matched) return false;
      }
      // ステータスフィルター
      if (selectedStatusIds.length > 0 && p.project_status) {
        const matched = statusOptions
          .filter((s) => selectedStatusIds.includes(s.id))
          .some((s) => s.name === p.project_status?.name);
        if (!matched) return false;
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
  }, [projects, keyword, selectedStatusIds, detailFilters, statusOptions]);

  function clearAll() {
    setKeyword("");
    setSelectedStatusIds([]);
    setDetailFilters({});
  }

  return (
    <div>
      {/* ヘッダ */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">案件管理</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1 bg-brand-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">案件を作成</span>
          <span className="sm:hidden">作成</span>
        </Link>
      </div>

      {/* フィルターバー */}
      <div className="bg-white rounded-xl border p-3 md:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* キーワード検索 */}
          <div className="md:col-span-5">
            <label className="block">
              <span className="text-xs text-slate-500">案件名・顧客・場所</span>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="検索..."
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </label>
          </div>

          {/* ステータスマルチ選択 */}
          <div className="md:col-span-5">
            <span className="text-xs text-slate-500">案件ステータス</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {statusOptions.map((s) => {
                const checked = selectedStatusIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStatusIds((prev) =>
                        checked
                          ? prev.filter((x) => x !== s.id)
                          : [...prev, s.id]
                      );
                    }}
                    className={`text-xs px-2 py-1 rounded-full border transition ${
                      checked
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.color ?? "#9CA3AF" }}
                      />
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 詳細フィルター + クリア */}
          <div className="md:col-span-2 flex md:flex-col items-stretch md:items-end gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 flex-1 md:flex-initial justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              詳細
              {detailCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
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

      {/* 結果件数 */}
      <div className="mb-2 text-xs text-slate-500">
        合計: <span className="font-bold text-slate-700">{filtered.length}件</span>
        {filtered.length !== projects.length && (
          <> / 全 {projects.length} 件</>
        )}
      </div>

      {/* テーブル（md以上） */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs">
              <tr>
                <Th>案件番号</Th>
                <Th>案件名</Th>
                <Th>種別</Th>
                <Th>ステータス</Th>
                <Th>顧客名</Th>
                <Th>作業場所</Th>
                <Th>先方担当者</Th>
                <Th align="right">契約金額（税抜）</Th>
                <Th align="center">操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                    <Td>{p.customer?.name ?? "-"}</Td>
                    <Td>{p.site?.name ?? "-"}</Td>
                    <Td>{p.customer_contact?.name ?? "-"}</Td>
                    <Td align="right">
                      ¥{(p.budget_excl_tax ?? 0).toLocaleString("ja-JP")}
                    </Td>
                    <Td align="center">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-xs text-brand-600 hover:underline"
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
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm col-span-full">
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
        open={modalOpen}
        initial={detailFilters}
        onClose={() => setModalOpen(false)}
        onApply={(f) => setDetailFilters(f)}
        onClear={() => setDetailFilters({})}
      />
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
    <td className={`px-3 py-2.5 ${a} whitespace-nowrap`}>{children}</td>
  );
}
