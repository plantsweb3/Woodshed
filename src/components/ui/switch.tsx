"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, defaultChecked, onCheckedChange, name, id, disabled, className }: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!value);
    onCheckedChange?.(!value);
  };
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={value}
      onClick={toggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        value && "bg-primary border-primary",
        disabled && "opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-card shadow transition-transform",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
      {name ? <input type="hidden" name={name} value={value ? "on" : ""} /> : null}
    </button>
  );
}
