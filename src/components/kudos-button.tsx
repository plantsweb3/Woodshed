"use client";

import { useState, useTransition } from "react";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleKudos } from "@/app/actions/kudos";

interface Props {
  targetType: "profile" | "milestone";
  targetId: string;
  initialCount: number;
  initialGiven: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}

export function KudosButton({
  targetType,
  targetId,
  initialCount,
  initialGiven,
  disabled,
  size = "md",
  label,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [given, setGiven] = useState(initialGiven);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (disabled || pending) return;
    // Optimistic
    const nextGiven = !given;
    setGiven(nextGiven);
    setCount((c) => Math.max(0, c + (nextGiven ? 1 : -1)));
    startTransition(async () => {
      try {
        const result = await toggleKudos({ targetType, targetId });
        setGiven(result.given);
        setCount(result.count);
      } catch {
        // Revert on failure
        setGiven(given);
        setCount(count);
      }
    });
  };

  const base = size === "sm" ? "h-7 px-2.5 text-xs gap-1" : "h-9 px-3 text-sm gap-1.5";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={given}
      aria-label={given ? "You high-fived this" : "High-five"}
      className={cn(
        "inline-flex items-center rounded-full border transition-colors",
        base,
        given
          ? "bg-accent text-accent-foreground border-accent"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <Hand
        className={cn(
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
          given ? "fill-current -rotate-12" : "",
          "transition-transform"
        )}
      />
      {label ?? (given ? "High-fived" : "High-five")}
      {count > 0 && <span className="font-medium">· {count}</span>}
    </button>
  );
}
