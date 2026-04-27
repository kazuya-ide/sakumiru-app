// ============================================================
// ESLint 9 flat config（Next.js 16 対応）
//
// 旧 .eslintrc.json + `next lint` は Next.js 16 で廃止。
// eslint-config-next 16.x は flat config 配列を直接 export しているので
// そのまま spread するだけで動く（FlatCompat 不要）。
// 詳細は docs/incident-log.md INC-003 参照。
// ============================================================
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/lib/supabase/database.types.ts", // 自動生成ファイル
      "src/types/database.types.ts",         // 自動生成ファイル
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
