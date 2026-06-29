import { Settings } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <SectionPlaceholder
      title="Settings"
      description="Admin-only app settings will be added after core workflows are complete."
      icon={Settings}
    />
  );
}
