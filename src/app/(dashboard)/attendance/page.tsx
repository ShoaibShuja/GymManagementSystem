import { AttendanceView } from "@/features/attendance/attendance-view";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Attendance",
};

export default async function AttendancePage() {
  const profile = await getCurrentProfile();

  return <AttendanceView role={profile?.role ?? "staff"} />;
}
