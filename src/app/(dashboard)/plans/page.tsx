import { CreditCard } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Plans",
};

export default function PlansPage() {
  return (
    <SectionPlaceholder
      title="Membership plans"
      description="Create and manage monthly, quarterly, and yearly plans in the next phase."
      icon={CreditCard}
    />
  );
}
