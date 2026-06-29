import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Admin controls for access and system setup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>User roles</CardTitle>
            <CardDescription>
              Review existing profiles and set each user as admin or staff.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/users">Manage users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Access rules</CardTitle>
            <CardDescription>
              Staff can run daily operations. Admins control setup, destructive
              actions, and roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Security is enforced by Supabase row-level policies and server
              actions. The interface hides restricted actions for clarity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
