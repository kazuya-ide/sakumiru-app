import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, contact, phone, email, address")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-rose-600">エラー: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        <Link
          href="/customers/new"
          className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          + 新規
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">会社名</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">担当者</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">電話</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell">メール</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  顧客がまだ登録されていません
                </td>
              </tr>
            ) : (
              customers!.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/customers/${c.id}`}
                      className="hover:text-brand-600"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">{c.contact ?? "-"}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{c.phone ?? "-"}</td>
                  <td className="px-4 py-2 hidden lg:table-cell">{c.email ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
