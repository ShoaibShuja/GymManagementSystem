import { addMonths, format, parseISO, subDays } from "date-fns";
import { z } from "zod";

import {
  dateStringSchema,
  optionalText,
  phoneSchema,
  requiredText,
} from "@/lib/validation";
import type { MemberStatus } from "@/types/database";

export const memberStatuses = ["active", "inactive", "expired"] as const;

export const memberFormSchema = z
  .object({
    name: requiredText("Member name"),
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .optional()
      .or(z.literal("")),
    address: optionalText(200),
    status: z.enum(memberStatuses, {
      error: "Select a valid member status.",
    }),
    membership_plan_id: z.string().uuid("Select a membership plan."),
    membership_start_date: dateStringSchema("Start date"),
    membership_end_date: dateStringSchema("End date"),
    notes: optionalText(),
  })
  .refine(
    (values) =>
      parseISO(values.membership_end_date) >=
      parseISO(values.membership_start_date),
    {
      message: "End date cannot be before the start date.",
      path: ["membership_end_date"],
    },
  );

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
