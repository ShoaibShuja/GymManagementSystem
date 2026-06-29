"use server";

import { z } from "zod";

import { getCurrentProfile, isAdminProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateProfileRoleSchema,
  type UpdateProfileRoleValues,
} from "@/features/users/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!profile || !isAdminProfile(profile)) {
    throw new Error("Only admins can manage user roles.");
  }

  return profile;
}

export async function updateProfileRoleAction(
  profileId: string,
  values: UpdateProfileRoleValues,
): Promise<ActionResult> {
  try {
    const currentProfile = await requireAdminAction();
    const parsed = updateProfileRoleSchema.parse(values);

    if (currentProfile.id === profileId && parsed.role !== "admin") {
      return {
        ok: false,
        error: "You cannot remove your own admin access.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: parsed.role })
      .eq("id", profileId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
