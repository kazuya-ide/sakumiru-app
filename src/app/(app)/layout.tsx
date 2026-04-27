import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import type { PlanTier } from "@/lib/plans/features";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user's company membership and plan
  const { data: membership } = await supabase
    .from("memberships")
    .select("role, company:companies(id, name, plan)")
    .eq("user_id", user.id)
    .single();

  const plan: PlanTier =
    (membership?.company as any)?.plan ?? "starter";
  const companyName = (membership?.company as any)?.name ?? "会社名未設定";

  return (
    <AppShell
      plan={plan}
      companyName={companyName}
      userEmail={user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
