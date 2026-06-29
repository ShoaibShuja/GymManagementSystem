"use server";

import { subMinutes } from "date-fns";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/server";
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

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireAttendanceWriteAction() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin" && profile?.role !== "staff") {
    throw new Error("You do not have permission to record attendance.");
  }

  return profile;
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
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
      return { ok: false, error: recentError.message };
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
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
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
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
