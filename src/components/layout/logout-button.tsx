import { LogOut } from "lucide-react";

import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout} className={className}>
      <Button type="submit" variant="outline" className="w-full justify-start">
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
