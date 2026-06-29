"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";
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

function formatDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
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

  const membersQuery = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  });
  const plansQuery = useQuery({
    queryKey: activePlansQueryKey,
    queryFn: fetchActivePlans,
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

  const members = membersQuery.data ?? [];
  const plans = plansQuery.data ?? [];

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
              disabled
              placeholder="Search by name or phone coming soon"
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <MembersSkeleton />
          ) : membersQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load members. {membersQuery.error.message}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No members yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the first member after creating at least one active plan.
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
                {members.map((member) => (
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
    </div>
  );
}
