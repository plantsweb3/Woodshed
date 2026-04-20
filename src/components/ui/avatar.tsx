import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn(
          "rounded-full object-cover bg-muted h-10 w-10 select-none",
          className
        )}
      />
    );
  }
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
