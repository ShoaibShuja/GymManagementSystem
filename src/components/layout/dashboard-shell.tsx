"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Menu } from "lucide-react";

import { getNavItems } from "@/components/layout/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";
import type { AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DashboardShellProps = {
  children: React.ReactNode;
  profile: {
    full_name: string;
    role: AppRole;
  };
};

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const pathname = usePathname();
  const items = getNavItems(profile.role);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-sidebar px-4 py-5 lg:block">
        <ShellBrand />
        <nav className="mt-8 grid gap-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 grid gap-3">
          <ProfileSummary profile={profile} />
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileNav items={items} profile={profile} pathname={pathname} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gym Management System
                </p>
                <p className="text-base font-semibold">Operations dashboard</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <ProfileSummary profile={profile} compact />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function ShellBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-sidebar-foreground/70">
          Gym MIS
        </p>
        <p className="font-semibold tracking-tight">Small Gym</p>
      </div>
    </Link>
  );
}

function NavLink({
  item,
  active,
}: {
  item: ReturnType<typeof getNavItems>[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.title}
    </Link>
  );
}

function ProfileSummary({
  profile,
  compact = false,
}: {
  profile: DashboardShellProps["profile"];
  compact?: boolean;
}) {
  const initials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border bg-card p-3",
        compact && "border-transparent bg-transparent p-0",
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
        {initials || "U"}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{profile.full_name}</p>
        <Badge variant="secondary" className="mt-1 capitalize">
          {profile.role}
        </Badge>
      </div>
    </div>
  );
}

function MobileNav({
  items,
  profile,
  pathname,
}: {
  items: ReturnType<typeof getNavItems>;
  profile: DashboardShellProps["profile"];
  pathname: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="size-4" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="left-4 top-4 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] translate-x-0 translate-y-0 overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Navigation</DialogTitle>
          <DialogDescription>
            Open dashboard sections and account actions.
          </DialogDescription>
        </DialogHeader>
        <ShellBrand />
        <nav className="grid gap-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="grid gap-3 border-t pt-4">
          <ProfileSummary profile={profile} />
          <LogoutButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
