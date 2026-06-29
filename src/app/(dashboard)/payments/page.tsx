import { WalletCards } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return (
    <SectionPlaceholder
      title="Payments"
      description="Track manual paid and unpaid monthly payments in the next phase."
      icon={WalletCards}
    />
  );
}
