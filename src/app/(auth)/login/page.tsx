"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ⚠️ 開発用テストアカウント（本番リリース前に削除）
const TEST_ACCOUNTS = [
  { label: "マスター（owner）",     email: "master@test.local",   password: "Test1234!", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { label: "管理者（admin）",       email: "admin@test.local",    password: "Test1234!", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { label: "経理（office）",        email: "keiri@test.local",    password: "Test1234!", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { label: "現場監督（manager）",   email: "genba@test.local",    password: "Test1234!", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { label: "職人（worker）",        email: "shokunin@test.local", password: "Test1234!", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { label: "取引先（vendor）",      email: "torihiki@test.local", password: "Test1234!", color: "bg-rose-100 text-rose-700 border-rose-300" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function fillTestAccount(testEmail: string, testPassword: string) {
    setEmail(testEmail);
    setPassword(testPassword);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-white">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <h1 className="text-2xl font-bold mb-1">ログイン</h1>
          <p className="text-sm text-slate-500 mb-6">現場管理へようこそ</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">メールアドレス</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">パスワード</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>

        {/* テストアカウント一覧 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-800">⚠️ 開発用テストアカウント</h2>
            <p className="text-xs text-slate-500 mt-1">
              クリックで自動入力 / 本番リリース前に削除予定
            </p>
            <p className="text-xs text-slate-400 mt-1">
              共通パスワード: <code className="bg-slate-100 px-1.5 py-0.5 rounded">Test1234!</code>
            </p>
          </div>

          <div className="space-y-2">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillTestAccount(acc.email, acc.password)}
                className={`w-full text-left rounded-lg border px-3 py-2 hover:opacity-80 transition ${acc.color}`}
              >
                <div className="text-xs font-bold">{acc.label}</div>
                <div className="text-xs font-mono mt-0.5 break-all">{acc.email}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            全員 <code className="bg-slate-100 px-1 rounded">testの会社</code> に所属。
            ロール別の権限差は今後実装。
          </p>
        </div>
      </div>
    </main>
  );
}
