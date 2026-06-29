"use server";

import { getCurrentProfile, isAdminProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  memberFormSchema,
  type MemberFormValues,
} from "@/features/members/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toMemberPayload(values: MemberFormValues) {
  const parsed = memberFormSchema.parse(values);

  return {
    name: parsed.name,
    phone: parsed.phone,
    email: emptyToNull(parsed.email),
    address: emptyToNull(parsed.address),
    status: parsed.status,
    membership_plan_id: parsed.membership_plan_id,
    membership_start_date: parsed.membership_start_date,
    membership_end_date: parsed.membership_end_date,
    join_date: parsed.membership_start_date,
    notes: emptyToNull(parsed.notes),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireMemberWriteAction() {
  const profile = await getCurrentProfile();

  if (!isAdminProfile(profile)) {
    throw new Error("Only admins can manage members.");
  }
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!isAdminProfile(profile)) {
    throw new Error("Only admins can delete members.");
  }
}

export async function createMemberAction(
  values: MemberFormValues,
): Promise<ActionResult> {
  try {
    await requireMemberWriteAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("members")
      .insert(toMemberPayload(values));

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateMemberAction(
  id: string,
  values: MemberFormValues,
): Promise<ActionResult> {
  try {
    await requireMemberWriteAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("members")
      .update(toMemberPayload(values))
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function deleteMemberAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase.from("members").delete().eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
