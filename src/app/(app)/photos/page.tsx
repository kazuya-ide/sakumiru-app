import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data: photos, error } = await supabase
    .from("photos")
    .select("id, taken_at, tag, caption, storage_path, project:projects(name)")
    .order("created_at", { ascending: false });

  if (error) return <p className="text-rose-600">エラー: {error.message}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">写真管理</h1>
        <button className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
          + アップロード
        </button>
      </div>

      {(photos ?? []).length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          写真がまだ登録されていません
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos!.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <div className="aspect-square bg-slate-100 flex items-center justify-center text-4xl">
                📷
              </div>
              <div className="p-2">
                {p.caption && (
                  <div className="text-xs font-medium truncate">{p.caption}</div>
                )}
                <div className="text-xs text-slate-400 mt-0.5">
                  {p.taken_at ?? "-"}
                  {p.tag && ` · ${p.tag}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
