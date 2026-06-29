import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string().trim().min(2, "Plan name is required."),
  duration_months: z
    .number()
    .int("Duration must be a whole number.")
    .min(1, "Duration must be at least 1 month."),
  price: z.number().min(0, "Price cannot be negative."),
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
