"use server";

import { format } from "date-fns";

import { getCurrentProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  markPaidSchema,
  paymentNotesSchema,
  type MarkPaidValues,
  type PaymentNotesValues,
} from "@/features/payments/schema";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requirePaymentWriteAction() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin" && profile?.role !== "staff") {
    throw new Error("You do not have permission to manage payments.");
  }

  return profile;
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    throw new Error("Only admins can delete payments.");
  }
}

export async function markPaymentPaidAction(
  values: MarkPaidValues,
): Promise<ActionResult> {
  try {
    const profile = await requirePaymentWriteAction();
    const parsed = markPaidSchema.parse(values);
    const supabase = await createClient();
    const paymentDate = format(new Date(), "yyyy-MM-dd");

    const { data: existingPayment, error: existingError } = await supabase
      .from("payments")
      .select("id")
      .eq("member_id", parsed.member_id)
      .eq("payment_month", parsed.payment_month)
      .maybeSingle();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (existingPayment) {
      const { error } = await supabase
        .from("payments")
        .update({
          amount: parsed.amount,
          membership_plan_id: parsed.membership_plan_id,
          notes: emptyToNull(parsed.notes),
          payment_date: paymentDate,
          recorded_by: profile.id,
          status: "paid",
        })
        .eq("id", existingPayment.id);

      if (error) {
        return { ok: false, error: error.message };
      }

      return { ok: true };
    }

    const { error } = await supabase.from("payments").insert({
      amount: parsed.amount,
      member_id: parsed.member_id,
      membership_plan_id: parsed.membership_plan_id,
      notes: emptyToNull(parsed.notes),
      payment_date: paymentDate,
      payment_month: parsed.payment_month,
      recorded_by: profile.id,
      status: "paid",
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updatePaymentNotesAction(
  paymentId: string,
  values: PaymentNotesValues,
): Promise<ActionResult> {
  try {
    await requirePaymentWriteAction();
    const parsed = paymentNotesSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase
      .from("payments")
      .update({ notes: emptyToNull(parsed.notes) })
      .eq("id", paymentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function deletePaymentAction(
  paymentId: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const supabase = await createClient();

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
