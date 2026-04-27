import { createClient } from "@/lib/supabase/server";
import { relName } from "@/lib/supabase/relation-types";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: files, error } = await supabase
    .from("files")
    .select("id, name, category, size_bytes, mime_type, created_at, project:projects(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">ファイル管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + アップロード
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">ファイル名</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">カテゴリ</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">案件</th>
              <th className="text-left px-4 py-2">サイズ</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell">登録日</th>
            </tr>
          </thead>
          <tbody>
            {(files ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  ファイルがまだ登録されていません
                </td>
              </tr>
            ) : (
              files!.map((f) => (
                <tr key={f.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">📄 {f.name}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{f.category ?? "-"}</td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    {relName(f.project) ?? "-"}
                  </td>
                  <td className="px-4 py-2">{formatBytes(f.size_bytes)}</td>
                  <td className="px-4 py-2 hidden lg:table-cell">
                    {f.created_at?.slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
