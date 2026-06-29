import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/layout/access-denied";
import { getCurrentProfile } from "@/lib/auth/server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    return <AccessDenied />;
  }

  return children;
}
