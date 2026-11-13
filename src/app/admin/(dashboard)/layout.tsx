import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/admin";
import { signOutAction } from "../auth-actions";
import { getWeddingSettings } from "@/services/content";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdminPage();
  const wedding = await getWeddingSettings();
  return (
    <AdminShell brand={wedding.website_title ?? "Wedding Admin"} adminName={profile.full_name} role={profile.role === "owner" ? "Owner" : "Administrator"} signOut={signOutAction}>
      {children}
    </AdminShell>
  );
}
