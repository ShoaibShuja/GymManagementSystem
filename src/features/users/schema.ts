import { z } from "zod";

import { APP_ROLES, type AppRole } from "@/lib/auth/roles";

export const updateProfileRoleSchema = z.object({
  role: z.enum(APP_ROLES, {
    error: "Select a valid role.",
  }),
});

export type UpdateProfileRoleValues = z.infer<typeof updateProfileRoleSchema>;

export type UserProfileRow = {
  id: string;
  full_name: string;
  role: AppRole;
  created_at: string;
};
