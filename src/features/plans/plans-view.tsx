"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, PowerOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/browser";
import type { AppRole } from "@/lib/auth/roles";
import {
  createPlanAction,
  deactivatePlanAction,
  updatePlanAction,
} from "@/features/plans/actions";
import {
  defaultPlanValues,
  planFormSchema,
  type MembershipPlan,
  type PlanFormValues,
} from "@/features/plans/schema";

const plansQueryKey = ["membership-plans"] as const;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
}

async function fetchPlans() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, name, duration_months, price, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MembershipPlan[];
}

function PlanStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge>Active</Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}

function PlansSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function PlanForm({
  plan,
  onSubmit,
  isSubmitting,
}: {
  plan: MembershipPlan | null;
  onSubmit: (values: PlanFormValues) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    values: plan
      ? {
          name: plan.name,
          duration_months: plan.duration_months,
          price: plan.price,
          is_active: plan.is_active,
        }
      : defaultPlanValues,
  });

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan name</FormLabel>
              <FormControl>
                <Input placeholder="Monthly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration months</FormLabel>
                <FormControl>
                  <Input
                    min={1}
                    type="number"
                    value={field.value}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    onChange={(event) =>
                      field.onChange(event.currentTarget.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    min={0}
                    step="0.01"
                    type="number"
                    value={field.value}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    onChange={(event) =>
                      field.onChange(event.currentTarget.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save plan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function PlansView({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const plansQuery = useQuery({
    queryKey: plansQueryKey,
    queryFn: fetchPlans,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: PlanFormValues) => {
      await ensureAction(
        editingPlan
          ? await updatePlanAction(editingPlan.id, values)
          : await createPlanAction(values),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: plansQueryKey });
      toast.success(editingPlan ? "Plan updated." : "Plan created.");
      setOpen(false);
      setEditingPlan(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await ensureAction(await deactivatePlanAction(id));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: plansQueryKey });
      toast.success("Plan deactivated.");
    },
    onError: (error) => toast.error(error.message),
  });

  const plans = plansQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Membership plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage prices and membership durations.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingPlan(null);
              setOpen(true);
            }}
          >
            <Plus />
            New plan
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>
            Inactive plans stay available on old member records.
          </CardDescription>
          <CardAction>
            <Input
              className="w-56"
              disabled
              placeholder="Search plans coming soon"
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {plansQuery.isLoading ? (
            <PlansSkeleton />
          ) : plansQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load plans. {plansQuery.error.message}
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No plans yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add monthly, quarterly, or yearly plans to start assigning
                members.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.duration_months} months</TableCell>
                    <TableCell>{currency.format(plan.price)}</TableCell>
                    <TableCell>
                      <PlanStatusBadge isActive={plan.is_active} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPlan(plan);
                              setOpen(true);
                            }}
                          >
                            <Edit />
                            Edit
                          </Button>
                          {plan.is_active && (
                            <Button
                              disabled={deactivateMutation.isPending}
                              size="sm"
                              variant="destructive"
                              onClick={() => deactivateMutation.mutate(plan.id)}
                            >
                              <PowerOff />
                              Deactivate
                            </Button>
                          )}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit plan" : "New plan"}</DialogTitle>
            <DialogDescription>
              Set the plan duration and price used for member expiry dates.
            </DialogDescription>
          </DialogHeader>
          <PlanForm
            plan={editingPlan}
            isSubmitting={saveMutation.isPending}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
