import { MembersView } from "@/features/members/members-view";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const profile = await getCurrentProfile();

  return <MembersView role={profile?.role ?? "staff"} />;
}
