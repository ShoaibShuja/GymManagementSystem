"use server";

import { getCurrentProfile, isAdminProfile } from "@/lib/auth/server";
import { getActionErrorMessage, getDatabaseErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { planFormSchema, type PlanFormValues } from "@/features/plans/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

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
      return { ok: false, error: getDatabaseErrorMessage(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
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
      return { ok: false, error: getDatabaseErrorMessage(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
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
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The plan could not be deactivated. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}
