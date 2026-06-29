import {
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";

import type { AppRole } from "@/lib/auth/roles";

export type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    href: "/members",
    icon: UsersRound,
  },
  {
    title: "Trainers",
    href: "/trainers",
    icon: Dumbbell,
  },
  {
    title: "Plans",
    href: "/plans",
    icon: CreditCard,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
  },
  {
    title: "Users",
    href: "/settings/users",
    icon: UserRound,
    adminOnly: true,
  },
];

export function getNavItems(role: AppRole) {
  return navItems.filter((item) => !item.adminOnly || role === "admin");
}
