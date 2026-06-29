"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarClock, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import type { AttendanceLog } from "@/features/attendance/schema";
import type { AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/browser";
import {
  createMemberAction,
  deleteMemberAction,
  updateMemberAction,
} from "@/features/members/actions";
import {
  calculateMembershipEndDate,
  getDefaultMemberValues,
  memberFormSchema,
  type MemberFormValues,
  type MemberPlanSummary,
  type MemberWithPlan,
} from "@/features/members/schema";

const membersQueryKey = ["members"] as const;
const activePlansQueryKey = ["membership-plans", "active"] as const;
const memberPaymentsQueryKey = "member-month-payments";
const memberAttendanceQueryKey = "member-attendance";

type MemberStatusFilter = "all" | MemberWithPlan["status"];
type MemberPaymentFilter = "all" | "paid" | "unpaid";
type MemberMonthPayment = {
  member_id: string;
  status: "paid" | "unpaid";
};

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
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
        email,
        address,
        join_date,
        status,
        membership_plan_id,
        membership_start_date,
        membership_end_date,
        notes,
        created_at,
        updated_at,
        membership_plans (
          id,
          name,
          duration_months,
          price,
          is_active
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as MemberWithPlan[];
}

async function fetchActivePlans() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, name, duration_months, price, is_active")
    .eq("is_active", true)
    .order("duration_months", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MemberPlanSummary[];
}

async function fetchMemberMonthPayments(paymentMonth: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("member_id, status")
    .eq("payment_month", paymentMonth);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MemberMonthPayment[];
}

async function fetchMemberAttendance(memberId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attendance_logs")
    .select(
      `
        id,
        member_id,
        check_in_time,
        recorded_by,
        notes,
        members (
          name,
          phone,
          status
        ),
        profiles (
          full_name
        )
      `,
    )
    .eq("member_id", memberId)
    .order("check_in_time", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as AttendanceLog[];
}

function formatDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

function formatDateTime(value: string) {
  return format(parseISO(value), "MMM d, yyyy h:mm a");
}

function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

function toPaymentMonth(monthValue: string) {
  return `${monthValue}-01`;
}

function statusVariant(status: MemberWithPlan["status"]) {
  if (status === "active") {
    return "default";
  }

  if (status === "expired") {
    return "destructive";
  }

  return "secondary";
}

function MembersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function toFormValues(member: MemberWithPlan | null, today: string) {
  if (!member) {
    return getDefaultMemberValues(today);
  }

  return {
    name: member.name,
    phone: member.phone,
    email: member.email ?? "",
    address: member.address ?? "",
    status: member.status,
    membership_plan_id: member.membership_plan_id ?? "",
    membership_start_date: member.membership_start_date,
    membership_end_date: member.membership_end_date,
    notes: member.notes ?? "",
  };
}

function MemberForm({
  member,
  plans,
  onSubmit,
  isSubmitting,
}: {
  member: MemberWithPlan | null;
  plans: MemberPlanSummary[];
  onSubmit: (values: MemberFormValues) => void;
  isSubmitting: boolean;
}) {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    values: toFormValues(member, today),
  });
  const selectedPlanId = useWatch({
    control: form.control,
    name: "membership_plan_id",
  });
  const startDate = useWatch({
    control: form.control,
    name: "membership_start_date",
  });

  useEffect(() => {
    const plan = plans.find((item) => item.id === selectedPlanId);

    if (!plan || !startDate) {
      return;
    }

    form.setValue(
      "membership_end_date",
      calculateMembershipEndDate(startDate, plan.duration_months),
      { shouldValidate: true },
    );
  }, [form, plans, selectedPlanId, startDate]);

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Ali Khan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+93 700 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="membership_plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership plan</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membership_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membership_end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date</FormLabel>
                <FormControl>
                  <Input readOnly type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional member notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button disabled={isSubmitting || plans.length === 0} type="submit">
            {isSubmitting ? "Saving..." : "Save member"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function MembersView({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithPlan | null>(
    null,
  );
  const [memberToDelete, setMemberToDelete] = useState<MemberWithPlan | null>(
    null,
  );
  const [attendanceMember, setAttendanceMember] =
    useState<MemberWithPlan | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] =
    useState<MemberPaymentFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const paymentMonth = toPaymentMonth(selectedMonth);

  const membersQuery = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  });
  const plansQuery = useQuery({
    queryKey: activePlansQueryKey,
    queryFn: fetchActivePlans,
  });
  const memberAttendanceQuery = useQuery({
    queryKey: [memberAttendanceQueryKey, attendanceMember?.id],
    queryFn: () => fetchMemberAttendance(attendanceMember?.id ?? ""),
    enabled: !!attendanceMember,
  });
  const memberPaymentsQuery = useQuery({
    queryKey: [memberPaymentsQueryKey, paymentMonth],
    queryFn: () => fetchMemberMonthPayments(paymentMonth),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: MemberFormValues) => {
      await ensureAction(
        editingMember
          ? await updateMemberAction(editingMember.id, values)
          : await createMemberAction(values),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: membersQueryKey });
      toast.success(editingMember ? "Member updated." : "Member added.");
      setOpen(false);
      setEditingMember(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await ensureAction(await deleteMemberAction(id));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: membersQueryKey });
      toast.success("Member deleted.");
      setMemberToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const paidMemberIds = useMemo(
    () =>
      new Set(
        (memberPaymentsQuery.data ?? [])
          .filter((payment) => payment.status === "paid")
          .map((payment) => payment.member_id),
      ),
    [memberPaymentsQuery.data],
  );
  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const isPaid = paidMemberIds.has(member.id);
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.phone.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      const matchesPlan =
        planFilter === "all" || member.membership_plan_id === planFilter;
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" ? isPaid : !isPaid);

      return matchesSearch && matchesStatus && matchesPlan && matchesPayment;
    });
  }, [members, paidMemberIds, paymentFilter, planFilter, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Members</h1>
          <p className="text-sm text-muted-foreground">
            Add members, assign plans, and track membership dates.
          </p>
        </div>
        <Button
          disabled={plansQuery.isLoading || plans.length === 0}
          onClick={() => {
            setEditingMember(null);
            setOpen(true);
          }}
        >
          <Plus />
          Add member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member list</CardTitle>
          <CardDescription>
            Delete actions are only available to admins.
          </CardDescription>
          <CardAction>
            <Input
              className="w-60"
              placeholder="Search name or phone"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-4">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as MemberStatusFilter)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={(value) =>
                setPaymentFilter(value as MemberPaymentFilter)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Input
              aria-label="Payment filter month"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.currentTarget.value)}
            />
          </div>

          {membersQuery.isLoading || memberPaymentsQuery.isLoading ? (
            <MembersSkeleton />
          ) : membersQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load members. {membersQuery.error.message}
            </div>
          ) : memberPaymentsQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load payment filters.{" "}
              {memberPaymentsQuery.error.message}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No members yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the first member after creating at least one active plan.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No matching members</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the search text, status, plan, or payment filter.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join date</TableHead>
                  <TableHead>End date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      {member.membership_plans?.name ?? "No plan"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.join_date)}</TableCell>
                    <TableCell>
                      {formatDate(member.membership_end_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAttendanceMember(member)}
                        >
                          <CalendarClock />
                          Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMember(member);
                            setOpen(true);
                          }}
                        >
                          <Edit />
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            disabled={deleteMutation.isPending}
                            size="sm"
                            variant="destructive"
                            onClick={() => setMemberToDelete(member)}
                          >
                            <Trash2 />
                            Delete
                          </Button>
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

      {plansQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load active plans. {plansQuery.error.message}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit member" : "Add member"}
            </DialogTitle>
            <DialogDescription>
              The end date is calculated from the start date and selected plan.
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            member={editingMember}
            plans={plans}
            isSubmitting={saveMutation.isPending}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!memberToDelete}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleteMutation.isPending) {
            setMemberToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete member?</DialogTitle>
            <DialogDescription>
              This will permanently delete the record for{" "}
              {memberToDelete?.name ?? "this member"}. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              disabled={deleteMutation.isPending || !memberToDelete}
              variant="destructive"
              onClick={() => {
                if (memberToDelete) {
                  deleteMutation.mutate(memberToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!attendanceMember}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAttendanceMember(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance history</DialogTitle>
            <DialogDescription>
              Recent check-ins for {attendanceMember?.name ?? "this member"}.
            </DialogDescription>
          </DialogHeader>
          {memberAttendanceQuery.isLoading ? (
            <MembersSkeleton />
          ) : memberAttendanceQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load attendance history.{" "}
              {memberAttendanceQuery.error.message}
            </div>
          ) : (memberAttendanceQuery.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No attendance yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This member has no recorded check-ins.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check-in time</TableHead>
                  <TableHead>Recorded by</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(memberAttendanceQuery.data ?? []).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.check_in_time)}</TableCell>
                    <TableCell>
                      {log.profiles?.full_name ?? "Unknown user"}
                    </TableCell>
                    <TableCell className="max-w-64 whitespace-normal">
                      {log.notes ?? "No notes"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
