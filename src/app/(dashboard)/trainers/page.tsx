import { TrainersView } from "@/features/trainers/trainers-view";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Trainers",
};

export default async function TrainersPage() {
  const profile = await getCurrentProfile();

  return <TrainersView role={profile?.role ?? "staff"} />;
}
