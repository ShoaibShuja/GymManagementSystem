"use server";

import { subMinutes } from "date-fns";

import {
  canUseOperationsProfile,
  getCurrentProfile,
  isAdminProfile,
} from "@/lib/auth/server";
import { getActionErrorMessage, getDatabaseErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  attendanceCheckInSchema,
  type AttendanceCheckInValues,
} from "@/features/attendance/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function requireAttendanceWriteAction() {
  const profile = await getCurrentProfile();

  if (!profile || !canUseOperationsProfile(profile)) {
    throw new Error("You do not have permission to record attendance.");
  }

  return profile;
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!profile || !isAdminProfile(profile)) {
    throw new Error("Only admins can delete attendance records.");
  }
}

export async function checkInMemberAction(
  values: AttendanceCheckInValues,
): Promise<ActionResult> {
  try {
    const profile = await requireAttendanceWriteAction();
    const parsed = attendanceCheckInSchema.parse(values);
    const supabase = await createClient();
    const duplicateWindowStart = subMinutes(new Date(), 10).toISOString();

    const { data: recentLog, error: recentError } = await supabase
      .from("attendance_logs")
      .select("id")
      .eq("member_id", parsed.member_id)
      .gte("check_in_time", duplicateWindowStart)
      .maybeSingle();

    if (recentError) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          recentError,
          "Could not check recent attendance. Refresh the page and try again.",
        ),
      };
    }

    if (recentLog) {
      return {
        ok: false,
        error: "This member was already checked in within the last 10 minutes.",
      };
    }

    const { error } = await supabase.from("attendance_logs").insert({
      member_id: parsed.member_id,
      notes: emptyToNull(parsed.notes),
      recorded_by: profile.id,
    });

    if (error) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The check-in could not be saved. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}

export async function deleteAttendanceLogAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("attendance_logs")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The attendance record could not be deleted. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}
