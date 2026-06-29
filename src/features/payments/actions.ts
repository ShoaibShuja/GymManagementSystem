"use server";

import { format } from "date-fns";
import {
  canUseOperationsProfile,
  getCurrentProfile,
  isAdminProfile,
} from "@/lib/auth/server";
import { getActionErrorMessage, getDatabaseErrorMessage } from "@/lib/errors";
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

async function requirePaymentWriteAction() {
  const profile = await getCurrentProfile();

  if (!profile || !canUseOperationsProfile(profile)) {
    throw new Error("You do not have permission to manage payments.");
  }

  return profile;
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();

  if (!profile || !isAdminProfile(profile)) {
    throw new Error("Only admins can delete payments.");
  }
}

async function activateMemberAfterAdminPayment(memberId: string) {
  const profile = await getCurrentProfile();

  if (!profile || !isAdminProfile(profile)) {
    return null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ status: "active" })
    .eq("id", memberId);

  return error;
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
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          existingError,
          "The payment status could not be checked. Refresh the page and try again.",
        ),
      };
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
        return { ok: false, error: getDatabaseErrorMessage(error) };
      }

      const memberError = await activateMemberAfterAdminPayment(
        parsed.member_id,
      );

      if (memberError) {
        return {
          ok: false,
          error: getDatabaseErrorMessage(
            memberError,
            "Payment was saved, but the member status could not be updated.",
          ),
        };
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
      return { ok: false, error: getDatabaseErrorMessage(error) };
    }

    const memberError = await activateMemberAfterAdminPayment(parsed.member_id);

    if (memberError) {
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          memberError,
          "Payment was saved, but the member status could not be updated.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
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
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The payment note could not be saved. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
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
      return {
        ok: false,
        error: getDatabaseErrorMessage(
          error,
          "The payment could not be removed. Refresh the page and try again.",
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionErrorMessage(error) };
  }
}
