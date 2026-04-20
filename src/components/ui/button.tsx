import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-[background,border,transform,box-shadow] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap border",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-primary hover:bg-primary-ink hover:border-primary-ink shadow-[2px_2px_0_0_var(--color-rule)] hover:shadow-[3px_3px_0_0_var(--color-rule)] hover:-translate-y-[1px]",
        outline:
          "bg-paper border-ink text-ink hover:bg-ink hover:text-paper shadow-[2px_2px_0_0_var(--color-rule)] hover:shadow-[3px_3px_0_0_var(--color-rule)] hover:-translate-y-[1px]",
        ghost:
          "border-transparent text-foreground hover:bg-muted",
        subtle: "bg-primary-soft text-primary border-primary-soft hover:bg-primary-soft/80",
        accent:
          "bg-accent text-accent-foreground border-accent-ink shadow-[2px_2px_0_0_var(--color-rule)] hover:shadow-[3px_3px_0_0_var(--color-rule)] hover:-translate-y-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:brightness-95",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        sm: "h-8 px-3 rounded-sm",
        default: "h-10 px-4 rounded-sm",
        lg: "h-11 px-6 rounded-sm",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
