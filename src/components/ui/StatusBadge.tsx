type StatusBadgeProps = {
  label: string | null | undefined;
  color?: string | null;
  size?: "sm" | "md";
};

// 案件ステータス・各種マスタの色付きバッジ
// マスタテーブルの `color` (HEX) を受け取り、背景・文字色を自動算出
export function StatusBadge({ label, color, size = "sm" }: StatusBadgeProps) {
  const text = label ?? "未設定";
  const bg = color ?? "#9CA3AF";

  // テキスト色: 背景が薄い色なら濃い文字、濃い色なら白
  const textColor = isLightColor(bg) ? "#1f2937" : "#ffffff";

  const sizeCls =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeCls}`}
      style={{
        backgroundColor: bg,
        color: textColor,
      }}
    >
      {text}
    </span>
  );
}

function isLightColor(hex: string): boolean {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return true;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  // 輝度（YIQ）で判定
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160;
}
