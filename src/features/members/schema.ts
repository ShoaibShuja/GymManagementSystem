import { addMonths, format, parseISO, subDays } from "date-fns";
import { z } from "zod";

import type { MemberStatus } from "@/types/database";

export const memberStatuses = ["active", "inactive", "expired"] as const;

export const memberFormSchema = z.object({
  name: z.string().trim().min(2, "Member name is required."),
  phone: z.string().trim().min(3, "Phone number is required."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional(),
  status: z.enum(memberStatuses),
  membership_plan_id: z.string().uuid("Select a membership plan."),
  membership_start_date: z.string().min(1, "Start date is required."),
  membership_end_date: z.string().min(1, "End date is required."),
  notes: z.string().trim().optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export type MemberPlanSummary = {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  is_active: boolean;
};

export type MemberWithPlan = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  join_date: string;
  status: MemberStatus;
  membership_plan_id: string | null;
  membership_start_date: string;
  membership_end_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  membership_plans: MemberPlanSummary | null;
};

export function calculateMembershipEndDate(
  startDate: string,
  durationMonths: number,
) {
  if (!startDate || durationMonths < 1) {
    return "";
  }

  return format(
    subDays(addMonths(parseISO(startDate), durationMonths), 1),
    "yyyy-MM-dd",
  );
}

export function getDefaultMemberValues(today: string): MemberFormValues {
  return {
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
    membership_plan_id: "",
    membership_start_date: today,
    membership_end_date: today,
    notes: "",
  };
}
