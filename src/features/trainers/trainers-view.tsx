"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, PowerOff, UserPlus, X } from "lucide-react";
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
  assignMemberToTrainerAction,
  createTrainerAction,
  deactivateTrainerAction,
  removeTrainerAssignmentAction,
  updateTrainerAction,
} from "@/features/trainers/actions";
import {
  assignmentFormSchema,
  defaultTrainerValues,
  trainerFormSchema,
  type AssignmentFormValues,
  type AssignmentMember,
  type Trainer,
  type TrainerAssignment,
  type TrainerFormValues,
} from "@/features/trainers/schema";

const trainersQueryKey = ["trainers"] as const;
const trainerAssignmentsQueryKey = ["trainer-member-assignments"] as const;
const assignableMembersQueryKey = ["members", "assignable"] as const;

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
}

async function fetchTrainers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trainers")
    .select("id, name, phone, specialty, status, notes, created_at, updated_at")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Trainer[];
}

async function fetchTrainerAssignments() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trainer_member_assignments")
    .select(
      `
        id,
        trainer_id,
        member_id,
        assigned_at,
        members (
          id,
          name,
          phone,
          status
        )
      `,
    )
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TrainerAssignment[];
}

async function fetchAssignableMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name, phone, status")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssignmentMember[];
}

function trainerStatusBadge(status: Trainer["status"]) {
  return status === "active" ? (
    <Badge>Active</Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}

function TrainersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function toTrainerFormValues(trainer: Trainer | null): TrainerFormValues {
  if (!trainer) {
    return defaultTrainerValues;
  }

  return {
    name: trainer.name,
    phone: trainer.phone ?? "",
    specialty: trainer.specialty ?? "",
    status: trainer.status,
    notes: trainer.notes ?? "",
  };
}

function TrainerForm({
  trainer,
  onSubmit,
  isSubmitting,
}: {
  trainer: Trainer | null;
  onSubmit: (values: TrainerFormValues) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    values: toTrainerFormValues(trainer),
  });

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
                  <Input placeholder="Trainer name" {...field} />
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
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <FormControl>
                  <Input placeholder="Strength training" {...field} />
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
                  </SelectContent>
                </Select>
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
                <Textarea placeholder="Optional trainer notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save trainer"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function AssignmentDialogContent({
  trainer,
  assignments,
  members,
  canManage,
  isAssigning,
  isRemoving,
  onAssign,
  onRemove,
}: {
  trainer: Trainer;
  assignments: TrainerAssignment[];
  members: AssignmentMember[];
  canManage: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  onAssign: (values: AssignmentFormValues) => void;
  onRemove: (assignmentId: string) => void;
}) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      member_id: "",
    },
  });
  const assignedMemberIds = useMemo(
    () => new Set(assignments.map((assignment) => assignment.member_id)),
    [assignments],
  );
  const availableMembers = members.filter(
    (member) => !assignedMemberIds.has(member.id),
  );

  return (
    <div className="grid gap-4">
      {canManage && (
        <Form {...form}>
          <form
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_auto]"
            onSubmit={form.handleSubmit((values) => {
              onAssign(values);
              form.reset();
            })}
          >
            <FormField
              control={form.control}
              name="member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign active member</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="self-end"
              disabled={isAssigning || availableMembers.length === 0}
              type="submit"
            >
              <UserPlus />
              Assign
            </Button>
          </form>
        </Form>
      )}

      <div className="rounded-lg border">
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">
            Assigned members for {trainer.name}
          </p>
        </div>
        {assignments.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No members assigned yet.
          </div>
        ) : (
          <div className="divide-y">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div>
                  <p className="font-medium">
                    {assignment.members?.name ?? "Unknown member"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.members?.phone ?? "No phone"}
                  </p>
                </div>
                {canManage && (
                  <Button
                    disabled={isRemoving}
                    size="sm"
                    variant="outline"
                    onClick={() => onRemove(assignment.id)}
                  >
                    <X />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TrainersView({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [trainerDialogOpen, setTrainerDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [assignmentTrainer, setAssignmentTrainer] = useState<Trainer | null>(
    null,
  );

  const trainersQuery = useQuery({
    queryKey: trainersQueryKey,
    queryFn: fetchTrainers,
  });
  const assignmentsQuery = useQuery({
    queryKey: trainerAssignmentsQueryKey,
    queryFn: fetchTrainerAssignments,
  });
  const membersQuery = useQuery({
    queryKey: assignableMembersQueryKey,
    queryFn: fetchAssignableMembers,
  });

  const assignmentsByTrainer = useMemo(() => {
    const grouped = new Map<string, TrainerAssignment[]>();

    for (const assignment of assignmentsQuery.data ?? []) {
      const trainerAssignments = grouped.get(assignment.trainer_id) ?? [];
      trainerAssignments.push(assignment);
      grouped.set(assignment.trainer_id, trainerAssignments);
    }

    return grouped;
  }, [assignmentsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: TrainerFormValues) => {
      await ensureAction(
        editingTrainer
          ? await updateTrainerAction(editingTrainer.id, values)
          : await createTrainerAction(values),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trainersQueryKey });
      toast.success(editingTrainer ? "Trainer updated." : "Trainer added.");
      setTrainerDialogOpen(false);
      setEditingTrainer(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await ensureAction(await deactivateTrainerAction(id));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trainersQueryKey });
      toast.success("Trainer deactivated.");
    },
    onError: (error) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: async (values: AssignmentFormValues) => {
      if (!assignmentTrainer) {
        throw new Error("Select a trainer first.");
      }

      await ensureAction(
        await assignMemberToTrainerAction(assignmentTrainer.id, values),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trainerAssignmentsQueryKey,
      });
      toast.success("Member assigned.");
    },
    onError: (error) => toast.error(error.message),
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await ensureAction(await removeTrainerAssignmentAction(assignmentId));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trainerAssignmentsQueryKey,
      });
      toast.success("Assignment removed.");
    },
    onError: (error) => toast.error(error.message),
  });

  const trainers = trainersQuery.data ?? [];
  const members = membersQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Trainers</h1>
          <p className="text-sm text-muted-foreground">
            Manage trainer profiles and member assignments.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingTrainer(null);
              setTrainerDialogOpen(true);
            }}
          >
            <Plus />
            Add trainer
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trainer list</CardTitle>
          <CardDescription>
            Staff can view trainers. Admins can manage profiles and assignments.
          </CardDescription>
          <CardAction>
            <Input
              className="w-56"
              disabled
              placeholder="Search trainers coming soon"
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {trainersQuery.isLoading || assignmentsQuery.isLoading ? (
            <TrainersSkeleton />
          ) : trainersQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load trainers. {trainersQuery.error.message}
            </div>
          ) : assignmentsQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load assignments. {assignmentsQuery.error.message}
            </div>
          ) : trainers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No trainers yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add trainer profiles before assigning members.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainers.map((trainer) => {
                  const trainerAssignments =
                    assignmentsByTrainer.get(trainer.id) ?? [];
                  const assignedNames = trainerAssignments
                    .map((assignment) => assignment.members?.name)
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">
                        {trainer.name}
                      </TableCell>
                      <TableCell>{trainer.phone ?? "Not set"}</TableCell>
                      <TableCell>{trainer.specialty ?? "Not set"}</TableCell>
                      <TableCell>
                        {trainerStatusBadge(trainer.status)}
                      </TableCell>
                      <TableCell className="max-w-72 whitespace-normal">
                        {assignedNames || "No members assigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAssignmentTrainer(trainer)}
                          >
                            <UserPlus />
                            Assignments
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingTrainer(trainer);
                                  setTrainerDialogOpen(true);
                                }}
                              >
                                <Edit />
                                Edit
                              </Button>
                              {trainer.status === "active" && (
                                <Button
                                  disabled={deactivateMutation.isPending}
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    deactivateMutation.mutate(trainer.id)
                                  }
                                >
                                  <PowerOff />
                                  Deactivate
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {membersQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load active members for assignments.{" "}
          {membersQuery.error.message}
        </div>
      )}

      <Dialog open={trainerDialogOpen} onOpenChange={setTrainerDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTrainer ? "Edit trainer" : "Add trainer"}
            </DialogTitle>
            <DialogDescription>
              Keep trainer profiles simple and focused on daily operations.
            </DialogDescription>
          </DialogHeader>
          <TrainerForm
            trainer={editingTrainer}
            isSubmitting={saveMutation.isPending}
            onSubmit={(values) => saveMutation.mutate(values)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignmentTrainer}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAssignmentTrainer(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Trainer assignments</DialogTitle>
            <DialogDescription>
              Assign active members to a trainer or remove existing assignments.
            </DialogDescription>
          </DialogHeader>
          {assignmentTrainer && (
            <AssignmentDialogContent
              trainer={assignmentTrainer}
              assignments={assignmentsByTrainer.get(assignmentTrainer.id) ?? []}
              members={members}
              canManage={isAdmin}
              isAssigning={assignMutation.isPending}
              isRemoving={removeAssignmentMutation.isPending}
              onAssign={(values) => assignMutation.mutate(values)}
              onRemove={(assignmentId) =>
                removeAssignmentMutation.mutate(assignmentId)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
