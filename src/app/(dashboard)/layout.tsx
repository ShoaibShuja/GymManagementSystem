import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
