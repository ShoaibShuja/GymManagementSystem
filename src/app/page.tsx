import { Dumbbell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Gym Management System
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Project foundation is ready.
            </h1>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary">Next.js App Router</Badge>
              <Badge variant="secondary">Supabase-ready</Badge>
              <Badge variant="secondary">shadcn/ui</Badge>
            </div>
            <CardTitle>Clean starter for the MIS build</CardTitle>
            <CardDescription>
              The app now has the core libraries, design tokens, UI components,
              and folder structure needed for the next development phase.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button>Foundation complete</Button>
            <Button variant="outline">Next step: auth and database</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
