"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmConsent } from "@/app/actions/parent-consent";

export function ApproveButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const onClick = () => {
    startTransition(async () => {
      const res = await confirmConsent(token);
      setState(res.ok ? "ok" : "err");
    });
  };

  if (state === "ok") {
    return (
      <p className="text-sm rounded-md bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color:var(--color-success)] p-4">
        Thanks — your student&apos;s account is now waiting for the drum major&apos;s final approval.
      </p>
    );
  }
  if (state === "err") {
    return (
      <p className="text-sm rounded-md bg-[color-mix(in_oklab,var(--color-destructive)_14%,transparent)] text-destructive p-4">
        That link is no longer valid. Please ask your student to sign up again.
      </p>
    );
  }

  return (
    <Button onClick={onClick} disabled={pending} size="lg" className="self-start">
      {pending ? "Approving…" : "Approve my student's account"}
    </Button>
  );
}
