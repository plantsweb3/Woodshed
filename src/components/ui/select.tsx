import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none rounded-sm border border-[color:var(--color-rule)]/50 bg-card pl-3 pr-9 py-2 text-sm",
          "shadow-[1px_1px_0_0_var(--color-rule)]",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[2px_2px_0_0_var(--color-rule)] transition-[border,box-shadow]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
);
Select.displayName = "Select";
