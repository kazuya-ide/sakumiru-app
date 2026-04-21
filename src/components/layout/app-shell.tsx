"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FEATURE_META,
  PLAN_FEATURES,
  PLAN_PRICES,
  type PlanTier,
  type FeatureKey,
} from "@/lib/plans/features";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AppShell({
  children,
  plan,
  companyName,
  userEmail,
}: {
  children: React.ReactNode;
  plan: PlanTier;
  companyName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const enabledFeatures = PLAN_FEATURES[plan];
  const allFeatures = Object.keys(FEATURE_META) as FeatureKey[];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 w-64 bg-white border-r shadow-sm
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          transition-transform flex flex-col`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
              現
            </div>
            <div>
              <div className="font-bold">現場管理</div>
              <div className="text-[10px] text-slate-500">{companyName}</div>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs inline-block">
            {PLAN_PRICES[plan].label} プラン
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 ${
              pathname === "/dashboard"
                ? "bg-brand-50 border-r-4 border-brand-600 font-semibold"
                : ""
            }`}
          >
            <span>🏠</span>
            <span>ダッシュボード</span>
          </Link>

          {allFeatures.map((key) => {
            const meta = FEATURE_META[key];
            const enabled = enabledFeatures.includes(key);
            const active = pathname.startsWith(meta.path);
            return (
              <Link
                key={key}
                href={enabled ? meta.path : "#"}
                onClick={(e) => !enabled && e.preventDefault()}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 ${
                  !enabled ? "opacity-40 cursor-not-allowed" : ""
                } ${
                  active && enabled
                    ? "bg-brand-50 border-r-4 border-brand-600 font-semibold"
                    : ""
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                {!enabled && (
                  <span className="ml-auto text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t text-xs text-slate-500">
          <div className="truncate mb-1">{userEmail}</div>
          <button onClick={signOut} className="text-rose-600 hover:underline">
            ログアウト
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b">
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              className="md:hidden text-2xl"
              onClick={() => setSidebarOpen(true)}
              aria-label="menu"
            >
              ☰
            </button>
            <div className="font-bold">現場管理</div>
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
