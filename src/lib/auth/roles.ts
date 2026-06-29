export const APP_ROLES = ["admin", "staff"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function canManageAllRecords(role: AppRole | null | undefined) {
  return role === "admin";
}

export function canUseOperationalRecords(role: AppRole | null | undefined) {
  return role === "admin" || role === "staff";
}
