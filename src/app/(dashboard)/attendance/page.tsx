import { CalendarCheck } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export const metadata = {
  title: "Attendance",
};

export default function AttendancePage() {
  return (
    <SectionPlaceholder
      title="Attendance"
      description="Record member check-ins and view visit history in the next phase."
      icon={CalendarCheck}
    />
  );
}
