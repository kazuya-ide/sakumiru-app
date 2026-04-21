/**
 * このファイルは `supabase gen types typescript --local > src/types/database.types.ts`
 * で自動生成します。commit 前に再生成してください。
 *
 * 初期プレースホルダ:
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          plan: "starter" | "standard" | "business";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
      };
      // ... 他は supabase gen types で自動生成
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_tier: "starter" | "standard" | "business";
      member_role: "owner" | "admin" | "manager" | "worker" | "office";
      project_status: "quoting" | "active" | "completed" | "cancelled";
      invoice_status: "unpaid" | "paid" | "overdue" | "void";
    };
  };
}
