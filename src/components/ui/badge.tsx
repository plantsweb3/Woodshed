import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold leading-none uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "bg-muted border-[color:var(--color-rule)]/40 text-muted-foreground",
        primary: "bg-primary-soft border-primary text-primary-ink",
        accent: "bg-accent-soft border-accent-ink text-accent-ink",
        outline: "bg-transparent border-[color:var(--color-rule)]/50 text-foreground",
        success:
          "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] border-[color:var(--color-success)] text-[color:var(--color-success)]",
        stamp:
          "border-ink text-ink font-mono [transform:rotate(-1.2deg)] bg-paper",
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
