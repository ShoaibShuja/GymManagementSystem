import { Activity, CalendarClock, CreditCard, UsersRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dashboardCards = [
  {
    title: "Active members",
    value: "Ready",
    description: "Member totals will appear after member management is built.",
    icon: UsersRound,
  },
  {
    title: "Pending payments",
    value: "Ready",
    description: "Monthly payment state will be connected next.",
    icon: CreditCard,
  },
  {
    title: "Expiring soon",
    value: "Ready",
    description: "Expiry alerts will use stored membership end dates.",
    icon: CalendarClock,
  },
  {
    title: "Today attendance",
    value: "Ready",
    description: "Check-in counts will appear after attendance is built.",
    icon: Activity,
  },
];

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A protected overview for daily gym operations. Live metrics will be
          connected after the core feature workflows are built.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
