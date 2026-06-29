import { z } from "zod";

import type { MemberStatus, TrainerStatus } from "@/types/database";

export const trainerStatuses = ["active", "inactive"] as const;

export const trainerFormSchema = z.object({
  name: z.string().trim().min(2, "Trainer name is required."),
  phone: z.string().trim().optional(),
  specialty: z.string().trim().optional(),
  status: z.enum(trainerStatuses),
  notes: z.string().trim().optional(),
});

export const assignmentFormSchema = z.object({
  member_id: z.string().uuid("Select a member."),
});

export type TrainerFormValues = z.infer<typeof trainerFormSchema>;
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export type Trainer = {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  status: TrainerStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AssignmentMember = {
  id: string;
  name: string;
  phone: string;
  status: MemberStatus;
};

export type TrainerAssignment = {
  id: string;
  trainer_id: string;
  member_id: string;
  assigned_at: string;
  members: AssignmentMember | null;
};

export const defaultTrainerValues: TrainerFormValues = {
  name: "",
  phone: "",
  specialty: "",
  status: "active",
  notes: "",
};
