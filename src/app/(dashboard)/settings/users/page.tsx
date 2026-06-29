import { UserRound } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <SectionPlaceholder
      title="Users"
      description="Admin-only user and role management will be added after authentication is finalized."
      icon={UserRound}
    />
  );
}
