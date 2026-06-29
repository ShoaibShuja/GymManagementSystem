import { z } from "zod";

import {
  moneySchema,
  positiveIntegerSchema,
  requiredText,
} from "@/lib/validation";

export const planFormSchema = z.object({
  name: requiredText("Plan name"),
  duration_months: positiveIntegerSchema("Duration"),
  price: moneySchema("Price"),
  is_active: z.boolean(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

export type MembershipPlan = {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

export const defaultPlanValues: PlanFormValues = {
  name: "",
  duration_months: 1,
  price: 0,
  is_active: true,
};
