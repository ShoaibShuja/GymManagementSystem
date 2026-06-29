"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createClient } from "@/lib/supabase/browser";
import { updateProfileRoleAction } from "@/features/users/actions";
import type {
  UpdateProfileRoleValues,
  UserProfileRow,
} from "@/features/users/schema";

const profilesQueryKey = ["profiles"] as const;

async function ensureAction(result: { ok: boolean; error?: string }) {
  if (!result.ok) {
    throw new Error(result.error ?? "The action failed.");
  }
}

async function fetchProfiles() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserProfileRow[];
}

function roleBadge(role: UserProfileRow["role"]) {
  return role === "admin" ? (
    <Badge>Admin</Badge>
  ) : (
    <Badge variant="secondary">Staff</Badge>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function UsersView({ currentProfileId }: { currentProfileId: string }) {
  const queryClient = useQueryClient();
  const profilesQuery = useQuery({
    queryKey: profilesQueryKey,
    queryFn: fetchProfiles,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      profileId,
      values,
    }: {
      profileId: string;
      values: UpdateProfileRoleValues;
    }) => {
      await ensureAction(await updateProfileRoleAction(profileId, values));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profilesQueryKey });
      toast.success("User role updated.");
    },
    onError: (error) => toast.error(error.message),
  });

  const profiles = profilesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage existing app profiles and keep access simple.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User profiles</CardTitle>
          <CardDescription>
            This page manages roles for profiles that already exist. New login
            accounts are still created in Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profilesQuery.isLoading ? (
            <UsersSkeleton />
          ) : profilesQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load users. {profilesQuery.error.message}
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No profiles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create Supabase Auth users and matching profiles before managing
                roles here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Current role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const isCurrentUser = profile.id === currentProfileId;
                  const isUpdating = updateRoleMutation.isPending;

                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {profile.full_name}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="outline">
                              <ShieldCheck />
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{roleBadge(profile.role)}</TableCell>
                      <TableCell>
                        {format(parseISO(profile.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Select
                            disabled={isUpdating}
                            value={profile.role}
                            onValueChange={(role) =>
                              updateRoleMutation.mutate({
                                profileId: profile.id,
                                values: {
                                  role: role as UserProfileRow["role"],
                                },
                              })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
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

      <Card>
        <CardHeader>
          <CardTitle>Account creation</CardTitle>
          <CardDescription>
            Invitations are not included in this simple role system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create login accounts in Supabase Auth, then add or verify the
            matching profile row before the user signs in. This keeps the app
            focused and avoids a custom invitation flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
