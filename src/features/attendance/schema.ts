import { z } from "zod";

import type { MemberStatus } from "@/types/database";

const databaseIdSchema = z.string().trim().min(1, "Required.");

export const attendanceCheckInSchema = z.object({
  member_id: databaseIdSchema,
  notes: z.string().trim().optional(),
});

export type AttendanceCheckInValues = z.infer<typeof attendanceCheckInSchema>;

export type AttendanceMember = {
  id: string;
  name: string;
  phone: string;
  status: MemberStatus;
  membership_end_date: string;
};

export type AttendanceLog = {
  id: string;
  member_id: string;
  check_in_time: string;
  recorded_by: string | null;
  notes: string | null;
  members: {
    name: string;
    phone: string;
    status: MemberStatus;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};
