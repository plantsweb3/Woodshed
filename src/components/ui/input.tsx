import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-none border-b-2 border-[color:var(--color-rule)]/40 bg-transparent px-0 py-2 text-sm",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:border-primary transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
