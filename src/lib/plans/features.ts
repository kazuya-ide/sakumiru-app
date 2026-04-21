/**
 * プラン別機能制限の定義
 * UI/API 両方でこの定数を参照して機能ON/OFFを制御する
 */

export type PlanTier = "starter" | "standard" | "business";

export type FeatureKey =
  // --- Starter (基本4機能) ---
  | "customers"
  | "projects"
  | "estimates"
  | "invoices"
  // --- Standard (現場オペ5機能) ---
  | "schedule"
  | "construction_ledger"
  | "files"
  | "daily_reports"
  | "photos"
  // --- Business (上位3機能) ---
  | "cost_management"
  | "attendance"
  | "purchase_orders";

export const PLAN_FEATURES: Record<PlanTier, FeatureKey[]> = {
  starter: ["customers", "projects", "estimates", "invoices"],
  standard: [
    "customers",
    "projects",
    "estimates",
    "invoices",
    "schedule",
    "construction_ledger",
    "files",
    "daily_reports",
    "photos",
  ],
  business: [
    "customers",
    "projects",
    "estimates",
    "invoices",
    "schedule",
    "construction_ledger",
    "files",
    "daily_reports",
    "photos",
    "cost_management",
    "attendance",
    "purchase_orders",
  ],
};

export const PLAN_PRICES: Record<PlanTier, { monthly: number; label: string }> = {
  starter: { monthly: 4800, label: "Starter" },
  standard: { monthly: 9800, label: "Standard" },
  business: { monthly: 19800, label: "Business" },
};

export const FEATURE_META: Record<FeatureKey, { label: string; icon: string; path: string }> = {
  customers: { label: "顧客管理", icon: "👥", path: "/customers" },
  projects: { label: "案件管理", icon: "📋", path: "/projects" },
  estimates: { label: "見積管理", icon: "🧮", path: "/estimates" },
  invoices: { label: "請求管理", icon: "💳", path: "/invoices" },
  schedule: { label: "スケジュール", icon: "📅", path: "/schedule" },
  construction_ledger: { label: "工事台帳", icon: "📖", path: "/ledger" },
  files: { label: "ファイル管理", icon: "📄", path: "/files" },
  daily_reports: { label: "作業日報", icon: "📝", path: "/reports" },
  photos: { label: "写真管理", icon: "📷", path: "/photos" },
  cost_management: { label: "実行予算・原価管理", icon: "💴", path: "/costs" },
  attendance: { label: "出面管理", icon: "🪪", path: "/attendance" },
  purchase_orders: { label: "発注・仕入管理", icon: "📦", path: "/purchase" },
};

export function hasFeature(plan: PlanTier, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}
