"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Check, Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/browser";
import {
  deletePaymentAction,
  markPaymentPaidAction,
  updatePaymentNotesAction,
} from "@/features/payments/actions";
import {
  paymentNotesSchema,
  type MarkPaidValues,
  type MonthPayment,
  type PaymentHistoryRow,
  type PaymentMember,
  type PaymentNotesValues,
} from "@/features/payments/schema";

const membersQueryKey = ["payment-members"] as const;
const monthPaymentsQueryKey = "month-payments";
const paymentHistoryQueryKey = ["payment-history"] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type PaymentFilter = "all" | "paid" | "unpaid";
type PaymentOverviewRow = {
  member: PaymentMember;
  payment: MonthPayment | null;
  amountDue: number;
  status: "paid" | "unpaid";
};

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
}

function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

function toPaymentMonth(monthValue: string) {
  return `${monthValue}-01`;
}

function formatMonth(value: string) {
  return format(parseISO(value), "MMMM yyyy");
}

function formatDate(value: string | null) {
  return value ? format(parseISO(value), "MMM d, yyyy") : "Not set";
}

async function fetchMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select(
      `
        id,
        name,
        phone,
        status,
        membership_plan_id,
        membership_plans (
          id,
          name,
          price,
          duration_months,
          is_active
        )
      `,
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PaymentMember[];
}

async function fetchMonthPayments(paymentMonth: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, member_id, membership_plan_id, amount, payment_month, payment_date, status, notes, recorded_by, created_at",
    )
    .eq("payment_month", paymentMonth)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MonthPayment[];
}

async function fetchPaymentHistory() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
        id,
        member_id,
        membership_plan_id,
        amount,
        payment_month,
        payment_date,
        status,
        notes,
        recorded_by,
        created_at,
        members (
          name,
          phone
        ),
        profiles (
          full_name
        )
      `,
    )
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PaymentHistoryRow[];
}

function PaymentStatusBadge({ status }: { status: "paid" | "unpaid" }) {
  return status === "paid" ? (
    <Badge>Paid</Badge>
  ) : (
    <Badge variant="destructive">Unpaid</Badge>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function NotesForm({
  title,
  description,
  defaultNotes,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  title: string;
  description: string;
  defaultNotes: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: PaymentNotesValues) => void;
}) {
  const form = useForm<PaymentNotesValues>({
    resolver: zodResolver(paymentNotesSchema),
    values: { notes: defaultNotes },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Optional payment notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export function PaymentsView({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [markingRow, setMarkingRow] = useState<PaymentOverviewRow | null>(null);
  const [editingPayment, setEditingPayment] = useState<MonthPayment | null>(
    null,
  );
  const [paymentToDelete, setPaymentToDelete] =
    useState<PaymentHistoryRow | null>(null);

  const paymentMonth = toPaymentMonth(selectedMonth);
  const membersQuery = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  });
  const monthPaymentsQuery = useQuery({
    queryKey: [monthPaymentsQueryKey, paymentMonth],
    queryFn: () => fetchMonthPayments(paymentMonth),
  });
  const historyQuery = useQuery({
    queryKey: paymentHistoryQueryKey,
    queryFn: fetchPaymentHistory,
  });

  const overviewRows = useMemo(() => {
    const paymentsByMember = new Map(
      (monthPaymentsQuery.data ?? []).map((payment) => [
        payment.member_id,
        payment,
      ]),
    );

    return (membersQuery.data ?? []).map<PaymentOverviewRow>((member) => {
      const payment = paymentsByMember.get(member.id) ?? null;
      const amountDue = member.membership_plans?.price ?? 0;

      return {
        member,
        payment,
        amountDue,
        status: payment?.status === "paid" ? "paid" : "unpaid",
      };
    });
  }, [membersQuery.data, monthPaymentsQuery.data]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return overviewRows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        row.member.name.toLowerCase().includes(normalizedSearch) ||
        row.member.phone.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [overviewRows, search, statusFilter]);

  const totals = useMemo(() => {
    const paid = overviewRows.filter((row) => row.status === "paid").length;

    return {
      paid,
      unpaid: overviewRows.length - paid,
      totalDue: overviewRows.reduce((total, row) => total + row.amountDue, 0),
      totalPaid: overviewRows.reduce(
        (total, row) => total + (row.payment?.amount ?? 0),
        0,
      ),
    };
  }, [overviewRows]);

  const invalidatePayments = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [monthPaymentsQueryKey, paymentMonth],
      }),
      queryClient.invalidateQueries({ queryKey: paymentHistoryQueryKey }),
      queryClient.invalidateQueries({ queryKey: ["members"] }),
    ]);
  };

  const markPaidMutation = useMutation({
    mutationFn: async (values: PaymentNotesValues) => {
      if (!markingRow) {
        throw new Error("Select a member first.");
      }

      const payload: MarkPaidValues = {
        amount: markingRow.amountDue,
        member_id: markingRow.member.id,
        membership_plan_id: markingRow.member.membership_plan_id,
        notes: values.notes,
        payment_month: paymentMonth,
      };

      await ensureAction(await markPaymentPaidAction(payload));
    },
    onSuccess: async () => {
      await invalidatePayments();
      toast.success("Payment marked as paid.");
      setMarkingRow(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (values: PaymentNotesValues) => {
      if (!editingPayment) {
        throw new Error("Select a payment first.");
      }

      await ensureAction(
        await updatePaymentNotesAction(editingPayment.id, values),
      );
    },
    onSuccess: async () => {
      await invalidatePayments();
      toast.success("Payment notes updated.");
      setEditingPayment(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await ensureAction(await deletePaymentAction(paymentId));
    },
    onSuccess: async () => {
      await invalidatePayments();
      toast.success("Payment removed.");
      setPaymentToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const isOverviewLoading =
    membersQuery.isLoading || monthPaymentsQuery.isLoading;
  const overviewError = membersQuery.error ?? monthPaymentsQuery.error;
  const historyRows = historyQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Record manual monthly payments. No online money collection is used.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[auto_auto]">
          <Input
            aria-label="Payment month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.currentTarget.value)}
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PaymentFilter)}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>{totals.paid}</CardTitle>
            <CardDescription>Paid members</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>{totals.unpaid}</CardTitle>
            <CardDescription>Unpaid members</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>{currency.format(totals.totalDue)}</CardTitle>
            <CardDescription>Expected amount</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>{currency.format(totals.totalPaid)}</CardTitle>
            <CardDescription>Recorded paid</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatMonth(paymentMonth)} overview</CardTitle>
          <CardDescription>
            Expected amount comes from each member&apos;s selected membership
            plan.
          </CardDescription>
          <CardAction>
            <Input
              className="w-64"
              placeholder="Search name or phone"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {isOverviewLoading ? (
            <TableSkeleton />
          ) : overviewError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load payment overview. {overviewError.message}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No matching members</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the month, status filter, or search text.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.member.id}>
                    <TableCell className="font-medium">
                      {row.member.name}
                    </TableCell>
                    <TableCell>{row.member.phone}</TableCell>
                    <TableCell>
                      {row.member.membership_plans?.name ?? "No plan"}
                    </TableCell>
                    <TableCell>{currency.format(row.amountDue)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal">
                      {row.payment?.notes ?? "No notes"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {row.status === "unpaid" ? (
                          <Button
                            disabled={markPaidMutation.isPending}
                            size="sm"
                            onClick={() => setMarkingRow(row)}
                          >
                            <Check />
                            Mark paid
                          </Button>
                        ) : (
                          row.payment && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPayment(row.payment)}
                            >
                              <Edit />
                              Notes
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>
            Recent manual payment records across all months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyQuery.isLoading ? (
            <TableSkeleton rows={4} />
          ) : historyQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load payment history. {historyQuery.error.message}
            </div>
          ) : historyRows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No payment history yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mark a member as paid to create the first history record.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment month</TableHead>
                  <TableHead>Payment date</TableHead>
                  <TableHead>Recorded by</TableHead>
                  <TableHead>Notes</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {payment.members?.name ?? "Unknown member"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.members?.phone ?? "No phone"}
                      </div>
                    </TableCell>
                    <TableCell>{currency.format(payment.amount)}</TableCell>
                    <TableCell>{formatMonth(payment.payment_month)}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      {payment.profiles?.full_name ?? "Unknown user"}
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal">
                      {payment.notes ?? "No notes"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPayment(payment)}
                          >
                            <Edit />
                            Notes
                          </Button>
                          <Button
                            disabled={deletePaymentMutation.isPending}
                            size="sm"
                            variant="destructive"
                            onClick={() => setPaymentToDelete(payment)}
                          >
                            <Trash2 />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!markingRow}
        onOpenChange={(open) => !open && setMarkingRow(null)}
      >
        <DialogContent>
          {markingRow && (
            <NotesForm
              title="Mark as paid"
              description={`Record a manual ${currency.format(markingRow.amountDue)} payment for ${markingRow.member.name}.`}
              defaultNotes=""
              submitLabel="Mark as paid"
              isSubmitting={markPaidMutation.isPending}
              onSubmit={(values) => markPaidMutation.mutate(values)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingPayment}
        onOpenChange={(open) => !open && setEditingPayment(null)}
      >
        <DialogContent>
          {editingPayment && (
            <NotesForm
              title="Edit payment notes"
              description="Update the note stored with this manual payment."
              defaultNotes={editingPayment.notes ?? ""}
              submitLabel="Save notes"
              isSubmitting={updateNotesMutation.isPending}
              onSubmit={(values) => updateNotesMutation.mutate(values)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!paymentToDelete}
        onOpenChange={(open) => {
          if (!open && !deletePaymentMutation.isPending) {
            setPaymentToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove payment?</DialogTitle>
            <DialogDescription>
              This removes the manual payment record. It does not refund or move
              any money.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              disabled={deletePaymentMutation.isPending || !paymentToDelete}
              variant="destructive"
              onClick={() => {
                if (paymentToDelete) {
                  deletePaymentMutation.mutate(paymentToDelete.id);
                }
              }}
            >
              {deletePaymentMutation.isPending
                ? "Removing..."
                : "Remove payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
