import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-none border-b-2 border-[color:var(--color-rule)]/40 bg-transparent px-0 py-2 text-sm",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:border-primary transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
