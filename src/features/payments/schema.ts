import { z } from "zod";

import type { MemberStatus, PaymentStatus } from "@/types/database";

export const paymentNotesSchema = z.object({
  notes: z.string().trim().optional(),
});

export const markPaidSchema = paymentNotesSchema.extend({
  member_id: z.string().uuid("Member is required."),
  membership_plan_id: z.string().uuid().nullable(),
  amount: z.number().min(0, "Amount cannot be negative."),
  payment_month: z.string().regex(/^\d{4}-\d{2}-01$/, "Invalid payment month."),
});

export type PaymentNotesValues = z.infer<typeof paymentNotesSchema>;
export type MarkPaidValues = z.infer<typeof markPaidSchema>;

export type PaymentPlanSummary = {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  is_active: boolean;
};

export type PaymentMember = {
  id: string;
  name: string;
  phone: string;
  status: MemberStatus;
  membership_plan_id: string | null;
  membership_plans: PaymentPlanSummary | null;
};

export type MonthPayment = {
  id: string;
  member_id: string;
  membership_plan_id: string | null;
  amount: number;
  payment_month: string;
  payment_date: string | null;
  status: PaymentStatus;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type PaymentHistoryRow = MonthPayment & {
  members: {
    name: string;
    phone: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};
