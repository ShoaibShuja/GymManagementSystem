"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay, parseISO } from "date-fns";
import { Check, Trash2 } from "lucide-react";
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
import {
  checkInMemberAction,
  deleteAttendanceLogAction,
} from "@/features/attendance/actions";
import {
  attendanceCheckInSchema,
  type AttendanceCheckInValues,
  type AttendanceLog,
  type AttendanceMember,
} from "@/features/attendance/schema";
import type { AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/browser";

const attendanceMembersQueryKey = ["attendance-members"] as const;
const todayAttendanceQueryKey = ["attendance", "today"] as const;
const recentAttendanceQueryKey = ["attendance", "recent"] as const;

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  };
}

async function fetchMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name, phone, status, membership_end_date")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AttendanceMember[];
}

async function fetchTodayLogs() {
  const supabase = createClient();
  const range = getTodayRange();
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
    .gte("check_in_time", range.start)
    .lt("check_in_time", range.end)
    .order("check_in_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as AttendanceLog[];
}

async function fetchRecentLogs() {
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
    .order("check_in_time", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as AttendanceLog[];
}

function formatDateTime(value: string) {
  return format(parseISO(value), "MMM d, yyyy h:mm a");
}

function formatTime(value: string) {
  return format(parseISO(value), "h:mm a");
}

function memberStatusBadge(status: AttendanceMember["status"]) {
  if (status === "active") {
    return <Badge>Active</Badge>;
  }

  if (status === "expired") {
    return <Badge variant="destructive">Expired</Badge>;
  }

  return <Badge variant="secondary">Inactive</Badge>;
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

function AttendanceTable({
  logs,
  emptyTitle,
  emptyDescription,
  isAdmin,
  isDeleting,
  onDelete,
  showDate,
}: {
  logs: AttendanceLog[];
  emptyTitle: string;
  emptyDescription: string;
  isAdmin: boolean;
  isDeleting: boolean;
  onDelete: (log: AttendanceLog) => void;
  showDate: boolean;
}) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>{showDate ? "Check-in time" : "Time"}</TableHead>
          <TableHead>Recorded by</TableHead>
          <TableHead>Notes</TableHead>
          {isAdmin && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <div className="font-medium">
                {log.members?.name ?? "Unknown member"}
              </div>
              <div className="text-sm text-muted-foreground">
                {log.members?.phone ?? "No phone"}
              </div>
            </TableCell>
            <TableCell>
              {showDate
                ? formatDateTime(log.check_in_time)
                : formatTime(log.check_in_time)}
            </TableCell>
            <TableCell>{log.profiles?.full_name ?? "Unknown user"}</TableCell>
            <TableCell className="max-w-64 whitespace-normal">
              {log.notes ?? "No notes"}
            </TableCell>
            {isAdmin && (
              <TableCell>
                <div className="flex min-w-24 justify-end">
                  <Button
                    disabled={isDeleting}
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(log)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AttendanceView({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<AttendanceMember | null>(
    null,
  );
  const [logToDelete, setLogToDelete] = useState<AttendanceLog | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");

  const form = useForm<AttendanceCheckInValues>({
    resolver: zodResolver(attendanceCheckInSchema),
    values: {
      member_id: selectedMember?.id ?? "",
      notes: "",
    },
  });

  const membersQuery = useQuery({
    queryKey: attendanceMembersQueryKey,
    queryFn: fetchMembers,
  });
  const todayLogsQuery = useQuery({
    queryKey: todayAttendanceQueryKey,
    queryFn: fetchTodayLogs,
  });
  const recentLogsQuery = useQuery({
    queryKey: recentAttendanceQueryKey,
    queryFn: fetchRecentLogs,
  });

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return (membersQuery.data ?? []).slice(0, 8);
    }

    return (membersQuery.data ?? [])
      .filter(
        (member) =>
          member.name.toLowerCase().includes(normalizedSearch) ||
          member.phone.toLowerCase().includes(normalizedSearch),
      )
      .slice(0, 8);
  }, [membersQuery.data, search]);

  const filteredRecentLogs = useMemo(() => {
    const normalizedSearch = historySearch.trim().toLowerCase();
    const selectedDate = historyDate ? parseISO(historyDate) : null;

    return (recentLogsQuery.data ?? []).filter((log) => {
      const matchesSearch =
        !normalizedSearch ||
        (log.members?.name ?? "").toLowerCase().includes(normalizedSearch) ||
        (log.members?.phone ?? "").toLowerCase().includes(normalizedSearch);
      const matchesDate =
        !selectedDate || isSameDay(parseISO(log.check_in_time), selectedDate);

      return matchesSearch && matchesDate;
    });
  }, [historyDate, historySearch, recentLogsQuery.data]);

  const invalidateAttendance = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: todayAttendanceQueryKey }),
      queryClient.invalidateQueries({ queryKey: recentAttendanceQueryKey }),
    ]);
  };

  const checkInMutation = useMutation({
    mutationFn: async (values: AttendanceCheckInValues) => {
      await ensureAction(await checkInMemberAction(values));
    },
    onSuccess: async () => {
      await invalidateAttendance();
      toast.success("Member checked in.");
      form.reset({ member_id: selectedMember?.id ?? "", notes: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await ensureAction(await deleteAttendanceLogAction(id));
    },
    onSuccess: async () => {
      await invalidateAttendance();
      toast.success("Attendance record deleted.");
      setLogToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedMemberWarning =
    selectedMember && selectedMember.status !== "active"
      ? `${selectedMember.name} is ${selectedMember.status}. Confirm with the gym's rules before checking in.`
      : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Record simple member check-ins and review recent gym visits.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Check in member</CardTitle>
            <CardDescription>
              Search by name or phone, then record the visit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search member by name or phone"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />

            {membersQuery.isLoading ? (
              <TableSkeleton rows={3} />
            ) : membersQuery.isError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Could not load members. {membersQuery.error.message}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No members match that search.
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                    data-selected={selectedMember?.id === member.id}
                    type="button"
                    onClick={() => {
                      setSelectedMember(member);
                      form.setValue("member_id", member.id, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    <span>
                      <span className="block font-medium">{member.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {member.phone}
                      </span>
                    </span>
                    {memberStatusBadge(member.status)}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit details</CardTitle>
            <CardDescription>
              Notes are optional and stored with this check-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMember ? (
              <Form {...form}>
                <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit((values) =>
                    checkInMutation.mutate(values),
                  )}
                >
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">{selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.phone}
                    </p>
                    <div className="mt-2">
                      {memberStatusBadge(selectedMember.status)}
                    </div>
                  </div>

                  {selectedMemberWarning && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      {selectedMemberWarning}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional attendance note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button disabled={checkInMutation.isPending} type="submit">
                    <Check />
                    {checkInMutation.isPending ? "Checking in..." : "Check in"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Select a member to check in.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s attendance</CardTitle>
          <CardDescription>All check-ins recorded today.</CardDescription>
        </CardHeader>
        <CardContent>
          {todayLogsQuery.isLoading ? (
            <TableSkeleton />
          ) : todayLogsQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load today&apos;s attendance.{" "}
              {todayLogsQuery.error.message}
            </div>
          ) : (
            <AttendanceTable
              logs={todayLogsQuery.data ?? []}
              emptyTitle="No check-ins today"
              emptyDescription="Check in a member to start today's log."
              isAdmin={isAdmin}
              isDeleting={deleteMutation.isPending}
              showDate={false}
              onDelete={setLogToDelete}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent attendance history</CardTitle>
          <CardDescription>Latest gym visit records.</CardDescription>
          <CardAction>
            <Input
              className="w-64"
              placeholder="Search member"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.currentTarget.value)}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[220px_auto]">
            <Input
              aria-label="Attendance history date"
              type="date"
              value={historyDate}
              onChange={(event) => setHistoryDate(event.currentTarget.value)}
            />
            {historyDate && (
              <Button
                className="justify-self-start"
                variant="outline"
                onClick={() => setHistoryDate("")}
              >
                Clear date
              </Button>
            )}
          </div>

          {recentLogsQuery.isLoading ? (
            <TableSkeleton />
          ) : recentLogsQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load attendance history. {recentLogsQuery.error.message}
            </div>
          ) : (
            <AttendanceTable
              logs={filteredRecentLogs}
              emptyTitle="No matching attendance records"
              emptyDescription="Adjust the member search or date filter."
              isAdmin={isAdmin}
              isDeleting={deleteMutation.isPending}
              showDate
              onDelete={setLogToDelete}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!logToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setLogToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete attendance record?</DialogTitle>
            <DialogDescription>
              This removes the check-in record. It does not change the member
              profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              disabled={deleteMutation.isPending || !logToDelete}
              variant="destructive"
              onClick={() => {
                if (logToDelete) {
                  deleteMutation.mutate(logToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
