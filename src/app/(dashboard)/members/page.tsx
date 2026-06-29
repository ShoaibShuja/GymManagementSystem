import { UsersRound } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Members",
};

export default function MembersPage() {
  return (
    <SectionPlaceholder
      title="Members"
      description="Add, edit, search, and manage gym members in the next phase."
      icon={UsersRound}
    />
  );
}
