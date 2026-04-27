"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, Briefcase, User } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import type {
  StatusOption,
  CustomerOption,
  CategoryOption,
  SiteOption,
  ContactOption,
} from "./ProjectsListClient";

type Props = {
  open: boolean;
  onClose: () => void;
  statusOptions: StatusOption[];
  customers: CustomerOption[];
  categories: CategoryOption[];
  sites: SiteOption[];
  contacts: ContactOption[];
};

export default function ProjectCreateModal({
  open,
  onClose,
  statusOptions,
  customers,
  categories,
  sites,
  contacts,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 顧客選択 → 作業場所 / 先方担当者 を絞り込み
  const [customerId, setCustomerId] = useState<string>("");
  const filteredSites = customerId
    ? sites.filter((s) => s.customer_id === customerId)
    : [];
  const filteredContacts = customerId
    ? contacts.filter((c) => c.customer_id === customerId)
    : [];

  // デフォルトの「新規」ステータスID
  const defaultStatusId =
    statusOptions.find((s) => s.name === "新規")?.id ?? statusOptions[0]?.id;

  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createProject(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        action={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        {/* ヘッダ */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">案件を作成</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 本体（スクロール領域） */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 顧客について */}
          <Section title="顧客について" icon={<Building2 className="w-4 h-4" />}>
            <Field label="顧客">
              <select
                name="customer_id"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">選択してください</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="作業場所">
              <select
                name="site_id"
                disabled={!customerId}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">
                  {customerId
                    ? filteredSites.length === 0
                      ? "（この顧客に登録なし）"
                      : "選択してください"
                    : "顧客を先に選択"}
                </option>
                {filteredSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `${s.code} ` : ""}
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="先方担当者">
              <select
                name="customer_contact_id"
                disabled={!customerId}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">
                  {customerId
                    ? filteredContacts.length === 0
                      ? "（この顧客に登録なし）"
                      : "選択してください"
                    : "顧客を先に選択"}
                </option>
                {filteredContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* 案件について */}
          <Section title="案件について" icon={<Briefcase className="w-4 h-4" />}>
            <Field label="案件番号" required>
              <div className="flex items-center gap-3 mb-2">
                <label className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="code_mode"
                    value="auto"
                    checked={codeMode === "auto"}
                    onChange={() => setCodeMode("auto")}
                  />
                  自動入力
                </label>
                <label className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="code_mode"
                    value="manual"
                    checked={codeMode === "manual"}
                    onChange={() => setCodeMode("manual")}
                  />
                  手動入力
                </label>
              </div>
              {codeMode === "manual" && (
                <input
                  type="text"
                  name="code"
                  placeholder="例: P-2026-099"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              )}
              {codeMode === "auto" && (
                <p className="text-xs text-slate-400">
                  保存時に「P-{new Date().getFullYear()}-連番」で自動採番されます
                </p>
              )}
            </Field>

            <Field label="案件種別">
              <select
                name="project_category_id"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">選択してください</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="案件名" required>
              <input
                type="text"
                name="name"
                required
                maxLength={255}
                placeholder="例: 新宿区マンション改修工事"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="案件ステータス" required>
                <select
                  name="project_status_id"
                  defaultValue={defaultStatusId}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="請求ステータス">
                <select
                  disabled
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                >
                  <option>未請求 (Phase 2)</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="開始日">
                <input
                  type="date"
                  name="started_at"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </Field>
              <Field label="終了日">
                <input
                  type="date"
                  name="completed_at"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </Field>
            </div>

            <Field label="依頼内容">
              <textarea
                name="request_content"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>

            <Field label="備考">
              <textarea
                name="memo"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>
          </Section>

          {/* 社内担当者（Phase 2） */}
          <Section
            title="社内担当者について"
            icon={<User className="w-4 h-4" />}
          >
            <p className="text-xs text-slate-400">
              担当者割り当ては Phase 2 で実装予定です。作成後の案件詳細画面から登録可能になります。
            </p>
          </Section>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* フッタ */}
        <div className="flex justify-end gap-2 p-5 border-t bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3 pb-2 border-b">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 inline-flex items-center gap-1">
        {label}
        {required && (
          <span className="text-[10px] text-rose-600 font-bold">必須</span>
        )}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
