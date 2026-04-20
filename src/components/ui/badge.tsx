import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-muted-foreground",
        primary: "bg-primary-soft border-transparent text-primary",
        accent: "bg-accent-soft border-transparent text-accent-foreground",
        outline: "bg-transparent border-border text-foreground",
        success: "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] border-transparent text-[color:var(--color-success)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}
