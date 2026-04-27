"use client";

// 親側から `key={modalOpen ? "open" : "closed"}` を渡すことで、
// open に切り替わった瞬間に React が本コンポーネントを再 mount する
// → useState の初期値で initial が再評価され、reset が成立する。
// useEffect 内 setState（react-hooks/set-state-in-effect 違反）を排除した。
// 詳細は docs/incident-log.md INC-006 参照。

import { useState } from "react";
import { X } from "lucide-react";

export type DetailFilters = {
  customerName?: string;
  siteName?: string;
  contactName?: string;
  receivedFrom?: string;
  receivedTo?: string;
  startedFrom?: string;
  startedTo?: string;
  budgetMin?: string;
  budgetMax?: string;
};

type Props = {
  open: boolean;
  initial: DetailFilters;
  onClose: () => void;
  onApply: (filters: DetailFilters) => void;
  onClear: () => void;
};

export default function DetailFilterModal({
  open,
  initial,
  onClose,
  onApply,
  onClear,
}: Props) {
  const [filters, setFilters] = useState<DetailFilters>(initial);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold">詳細フィルター</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Section title="顧客・作業場所">
            <Field
              label="顧客名"
              value={filters.customerName}
              onChange={(v) =>
                setFilters({ ...filters, customerName: v })
              }
              placeholder="部分一致検索"
            />
            <Field
              label="作業場所名"
              value={filters.siteName}
              onChange={(v) => setFilters({ ...filters, siteName: v })}
              placeholder="部分一致検索"
            />
            <Field
              label="先方担当者名"
              value={filters.contactName}
              onChange={(v) =>
                setFilters({ ...filters, contactName: v })
              }
              placeholder="部分一致検索"
            />
          </Section>

          <Section title="日付範囲">
            <DateRange
              label="受付日"
              from={filters.receivedFrom}
              to={filters.receivedTo}
              onFrom={(v) =>
                setFilters({ ...filters, receivedFrom: v })
              }
              onTo={(v) => setFilters({ ...filters, receivedTo: v })}
            />
            <DateRange
              label="開始日"
              from={filters.startedFrom}
              to={filters.startedTo}
              onFrom={(v) =>
                setFilters({ ...filters, startedFrom: v })
              }
              onTo={(v) => setFilters({ ...filters, startedTo: v })}
            />
          </Section>

          <Section title="契約金額（税抜）">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="最小（円）"
                type="number"
                value={filters.budgetMin}
                onChange={(v) =>
                  setFilters({ ...filters, budgetMin: v })
                }
              />
              <Field
                label="最大（円）"
                type="number"
                value={filters.budgetMax}
                onChange={(v) =>
                  setFilters({ ...filters, budgetMax: v })
                }
              />
            </div>
          </Section>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t sticky bottom-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              onClear();
              setFilters({});
            }}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            全てクリア
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );
}

function DateRange({
  label,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string;
  from?: string;
  to?: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <input
          type="date"
          value={from ?? ""}
          onChange={(e) => onFrom(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="date"
          value={to ?? ""}
          onChange={(e) => onTo(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}
