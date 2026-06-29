"use server";

import { getCurrentProfile, isAdminProfile } from "@/lib/auth/server";
import { getActionErrorMessage, getDatabaseErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  assignmentFormSchema,
  trainerFormSchema,
  type AssignmentFormValues,
  type TrainerFormValues,
} from "@/features/trainers/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!isAdminProfile(profile)) {
    throw new Error("Only admins can manage trainers and assignments.");
  }
}

function toTrainerPayload(values: TrainerFormValues) {
  const parsed = trainerFormSchema.parse(values);

  return {
    name: parsed.name,
    phone: emptyToNull(parsed.phone),
    specialty: emptyToNull(parsed.specialty),
    status: parsed.status,
    notes: emptyToNull(parsed.notes),
  };
}

export async function createTrainerAction(
  values: TrainerFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("trainers")
      .insert(toTrainerPayload(values));

    if (error) {
      return { ok: false, error: getDatabaseErrorMessage(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}

export async function updateTrainerAction(
  id: string,
  values: TrainerFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("trainers")
      .update(toTrainerPayload(values))
      .eq("id", id);

    if (error) {
      return { ok: false, error: getDatabaseErrorMessage(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}

export async function deactivateTrainerAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("trainers")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The trainer could not be deactivated. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}

export async function assignMemberToTrainerAction(
  trainerId: string,
  values: AssignmentFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const parsed = assignmentFormSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase.from("trainer_member_assignments").insert({
      trainer_id: trainerId,
      member_id: parsed.member_id,
    });

    if (error) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The member could not be assigned. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}

export async function removeTrainerAssignmentAction(
  assignmentId: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("trainer_member_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The assignment could not be removed. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}
