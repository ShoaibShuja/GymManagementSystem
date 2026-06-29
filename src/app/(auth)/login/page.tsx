import { Dumbbell } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/login-form";
import { getCurrentProfile } from "@/lib/auth/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const isSupabaseConfigured = hasSupabaseEnv();
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-card shadow-sm lg:grid-cols-[1fr_420px]">
        <section className="hidden border-r bg-sidebar/70 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Dumbbell className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gym MIS
                </p>
                <h1 className="text-xl font-semibold tracking-normal">
                  Small Gym
                </h1>
              </div>
            </div>
            <div className="mt-16 max-w-md">
              <p className="text-3xl font-semibold leading-tight tracking-normal">
                Daily operations, kept simple.
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Manage members, payments, attendance, plans, and trainer
                assignments without extra tools or complicated reports.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border bg-card p-3">
              <p className="font-medium">Members</p>
              <p className="mt-1 text-muted-foreground">Profiles and plans</p>
            </div>
            <div className="rounded-md border bg-card p-3">
              <p className="font-medium">Payments</p>
              <p className="mt-1 text-muted-foreground">Manual tracking</p>
            </div>
            <div className="rounded-md border bg-card p-3">
              <p className="font-medium">Attendance</p>
              <p className="mt-1 text-muted-foreground">Fast check-ins</p>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dumbbell className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Gym Management System
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Sign in
              </h1>
            </div>
          </div>

          <Card className="border-0 shadow-none ring-0">
            <CardHeader className="px-0">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Use the email and password created by your administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {isSupabaseConfigured ? (
                <LoginForm />
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-medium">Supabase is not configured yet.</p>
                  <p className="mt-2">
                    Create `.env.local` from `.env.example`, then add{" "}
                    <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                    <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from your
                    Supabase project API settings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
