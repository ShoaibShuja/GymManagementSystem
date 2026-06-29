import { Dumbbell } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Trainers",
};

export default function TrainersPage() {
  return (
    <SectionPlaceholder
      title="Trainers"
      description="Manage trainer profiles and member assignments in the next phase."
      icon={Dumbbell}
    />
  );
}
