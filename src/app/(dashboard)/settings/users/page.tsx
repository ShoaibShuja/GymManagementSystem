import { UsersView } from "@/features/users/users-view";
import { requireAdmin } from "@/lib/auth/server";

export const metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const profile = await requireAdmin();

  return <UsersView currentProfileId={profile.id} />;
}
