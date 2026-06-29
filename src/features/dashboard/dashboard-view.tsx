"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CreditCard,
  UserCheck,
  UserRoundX,
} from "lucide-react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/browser";
import type { MemberStatus, PaymentStatus } from "@/types/database";

const dashboardQueryKey = "dashboard-overview";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type DashboardMember = {
  id: string;
  name: string;
  phone: string;
  status: MemberStatus;
  membership_end_date: string;
  membership_plans: {
    name: string;
    price: number;
  } | null;
};

type DashboardPayment = {
  member_id: string;
  amount: number;
  status: PaymentStatus;
};

function getCurrentPaymentMonth() {
  return format(new Date(), "yyyy-MM-01");
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

async function fetchDashboardData(paymentMonth: string) {
  const supabase = createClient();
  const todayRange = getTodayRange();

  const [membersResult, paymentsResult, attendanceResult] = await Promise.all([
    supabase
      .from("members")
      .select(
        `
          id,
          name,
          phone,
          status,
          membership_end_date,
          membership_plans (
            name,
            price
          )
        `,
      )
      .order("membership_end_date", { ascending: true }),
    supabase
      .from("payments")
      .select("member_id, amount, status")
      .eq("payment_month", paymentMonth),
    supabase
      .from("attendance_logs")
      .select("id")
      .gte("check_in_time", todayRange.start)
      .lt("check_in_time", todayRange.end),
  ]);

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }

  if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  }

  return {
    attendanceCount: attendanceResult.data?.length ?? 0,
    members: (membersResult.data ?? []) as unknown as DashboardMember[],
    payments: (paymentsResult.data ?? []) as DashboardPayment[],
  };
}

function MetricSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function statusBadge(status: MemberStatus) {
  if (status === "active") {
    return <Badge>Active</Badge>;
  }

  if (status === "expired") {
    return <Badge variant="destructive">Expired</Badge>;
  }

  return <Badge variant="secondary">Inactive</Badge>;
}

export function DashboardView() {
  const [alertDays, setAlertDays] = useState(7);
  const paymentMonth = useMemo(() => getCurrentPaymentMonth(), []);

  const dashboardQuery = useQuery({
    queryKey: [dashboardQueryKey, paymentMonth],
    queryFn: () => fetchDashboardData(paymentMonth),
  });

  const overview = useMemo(() => {
    const members = dashboardQuery.data?.members ?? [];
    const payments = dashboardQuery.data?.payments ?? [];
    const paidMemberIds = new Set(
      payments
        .filter((payment) => payment.status === "paid")
        .map((payment) => payment.member_id),
    );
    const today = startOfDay(new Date());
    const alertEndDate = addDays(today, alertDays);
    const expiringSoon = members.filter((member) => {
      const endDate = startOfDay(parseISO(member.membership_end_date));
      return endDate >= today && endDate <= alertEndDate;
    });

    return {
      activeMembers: members.filter((member) => member.status === "active")
        .length,
      inactiveMembers: members.filter((member) => member.status === "inactive")
        .length,
      expiredMembers: members.filter((member) => member.status === "expired")
        .length,
      paymentsCollected: payments.reduce(
        (total, payment) =>
          payment.status === "paid" ? total + payment.amount : total,
        0,
      ),
      paymentsPending: members.length - paidMemberIds.size,
      expiringSoon,
      todayAttendance: dashboardQuery.data?.attendanceCount ?? 0,
    };
  }, [alertDays, dashboardQuery.data]);

  const metricCards = [
    {
      title: "Active members",
      value: overview.activeMembers.toString(),
      description: "Currently marked active",
      icon: UserCheck,
    },
    {
      title: "Inactive members",
      value: overview.inactiveMembers.toString(),
      description: "Kept in records",
      icon: UserRoundX,
    },
    {
      title: "Expired members",
      value: overview.expiredMembers.toString(),
      description: "Need renewal follow-up",
      icon: AlertTriangle,
    },
    {
      title: "Pending payments",
      value: overview.paymentsPending.toString(),
      description: format(parseISO(paymentMonth), "MMMM yyyy"),
      icon: CreditCard,
    },
    {
      title: "Collected this month",
      value: currency.format(overview.paymentsCollected),
      description: "Manual payments recorded",
      icon: CreditCard,
    },
    {
      title: "Expiring soon",
      value: overview.expiringSoon.length.toString(),
      description: `Within ${alertDays} days`,
      icon: CalendarClock,
    },
    {
      title: "Today's attendance",
      value: overview.todayAttendance.toString(),
      description: "Check-ins recorded today",
      icon: Activity,
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Daily business overview for members, payments, expiry follow-up, and
            attendance.
          </p>
        </div>
        <div className="w-full sm:w-40">
          <label className="text-sm font-medium" htmlFor="expiry-alert-days">
            Expiry alert days
          </label>
          <Input
            id="expiry-alert-days"
            min={1}
            max={60}
            type="number"
            value={alertDays}
            onChange={(event) =>
              setAlertDays(
                Math.min(
                  60,
                  Math.max(1, Number(event.currentTarget.value) || 1),
                ),
              )
            }
          />
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <MetricSkeleton />
      ) : dashboardQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load dashboard overview. {dashboardQuery.error.message}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                  <CardAction>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{card.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membership expiry alerts</CardTitle>
          <CardDescription>
            Members whose membership ends in the selected alert window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : overview.expiringSoon.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No memberships expiring soon</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No member end dates fall within the current alert window.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {overview.expiringSoon.map((member) => {
                const daysLeft = differenceInCalendarDays(
                  parseISO(member.membership_end_date),
                  new Date(),
                );

                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {statusBadge(member.status)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {member.phone} -{" "}
                        {member.membership_plans?.name ?? "No plan"}
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="font-medium">
                        Ends{" "}
                        {format(
                          parseISO(member.membership_end_date),
                          "MMM d, yyyy",
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {daysLeft === 0
                          ? "Ends today"
                          : `${daysLeft} days left`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Useful focus</CardTitle>
          <CardDescription>
            A quick list of what staff should review today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="font-medium">Collect dues</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {overview.paymentsPending} members have no paid record for this
                month.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Renew memberships</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {overview.expiringSoon.length} memberships need attention within
                {` ${alertDays} days`}.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Track visits</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {overview.todayAttendance} attendance check-ins are recorded
                today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
