"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard could not load</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Refresh the page or try again. If this keeps happening, check the
          Supabase connection and user profile.
        </p>
        <Button onClick={reset} className="w-fit">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
