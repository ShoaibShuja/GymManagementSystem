import { PaymentsView } from "@/features/payments/payments-view";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Payments",
};

export default async function PaymentsPage() {
  const profile = await getCurrentProfile();

  return <PaymentsView role={profile?.role ?? "staff"} />;
}
