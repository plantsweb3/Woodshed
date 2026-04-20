import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-soft text-primary font-medium text-sm h-10 w-10 select-none",
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
