import { PlansView } from "@/features/plans/plans-view";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Plans",
};

export default async function PlansPage() {
  const profile = await getCurrentProfile();

  return <PlansView role={profile?.role ?? "staff"} />;
}
