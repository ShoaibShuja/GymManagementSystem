"use server";

import { getCurrentProfile, isAdminProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { planFormSchema, type PlanFormValues } from "@/features/plans/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!isAdminProfile(profile)) {
    throw new Error("Only admins can manage membership plans.");
  }
}

export async function createPlanAction(
  values: PlanFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const parsed = planFormSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase.from("membership_plans").insert(parsed);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updatePlanAction(
  id: string,
  values: PlanFormValues,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const parsed = planFormSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase
      .from("membership_plans")
      .update(parsed)
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function deactivatePlanAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("membership_plans")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
