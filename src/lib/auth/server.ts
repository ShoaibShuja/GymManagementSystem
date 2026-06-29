import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { AppRole } from "@/lib/auth/roles";
import { canUseOperationalRecords } from "@/lib/auth/roles";

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getCurrentProfile() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export function hasRole(
  profile: { role: AppRole } | null | undefined,
  allowedRoles: AppRole[],
) {
  return !!profile && allowedRoles.includes(profile.role);
}

export const checkRole = hasRole;

export function isAdminProfile(profile: { role: AppRole } | null | undefined) {
  return profile?.role === "admin";
}

export function canUseOperationsProfile(
  profile: { role: AppRole } | null | undefined,
) {
  return canUseOperationalRecords(profile?.role);
}
