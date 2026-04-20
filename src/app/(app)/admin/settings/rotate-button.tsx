"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { rotateInviteCode } from "@/app/actions/admin";
import { RefreshCcw } from "lucide-react";

export function RotateInviteCodeButton({ label = "Rotate code" }: { label?: string }) {
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    if (!confirm("Rotating invalidates the old code immediately. Continue?")) return;
    startTransition(async () => {
      await rotateInviteCode();
    });
  };
  return (
    <Button onClick={onClick} disabled={pending} variant="accent" className="gap-2">
      <RefreshCcw className="h-4 w-4" />
      {pending ? "Rotating…" : label}
    </Button>
  );
}
