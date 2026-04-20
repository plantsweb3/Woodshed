"use client";

import { Button } from "@/components/ui/button";
import { signout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export function SignoutButton({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  return (
    <form action={signout}>
      <Button type="submit" variant={variant} size="sm" className="gap-2">
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </form>
  );
}
