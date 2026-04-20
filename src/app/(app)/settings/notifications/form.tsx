"use client";

import { useActionState, useState } from "react";
import { saveNotificationPreferences, type PrefsFormState } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

const initial: PrefsFormState = {};

export function PreferencesForm({
  defaults,
  isDirector,
}: {
  defaults: {
    emailMentorRequestDirect: boolean;
    emailMentorOfferAccepted: boolean;
    emailSignupApproved: boolean;
    emailSignupRejected: boolean;
    emailZeroTolerance: boolean;
  };
  isDirector: boolean;
}) {
  const [state, action, pending] = useActionState(saveNotificationPreferences, initial);
  const [values, setValues] = useState(defaults);

  const rows: { key: keyof typeof values; label: string; body: string; directorOnly?: boolean }[] = [
    {
      key: "emailMentorRequestDirect",
      label: "Direct mentor requests",
      body: "Email me when a student sends me a mentor request directly.",
    },
    {
      key: "emailMentorOfferAccepted",
      label: "Offers on my requests",
      body: "Email me when a mentor picks up a request I posted.",
    },
    {
      key: "emailSignupApproved",
      label: "Signup approved",
      body: "The welcome email when your account is activated.",
    },
    {
      key: "emailSignupRejected",
      label: "Signup rejected",
      body: "Softly-worded note if a signup isn't approved.",
    },
    {
      key: "emailZeroTolerance",
      label: "Zero-tolerance escalations",
      body: "Director-only. Always on for safety.",
      directorOnly: true,
    },
  ];

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
        {rows.map((r) => {
          const disabled = r.directorOnly && (!isDirector || r.key === "emailZeroTolerance");
          return (
            <div key={r.key} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{r.label}</p>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
              <Switch
                checked={disabled ? true : values[r.key]}
                disabled={disabled}
                onCheckedChange={(v) => setValues((p) => ({ ...p, [r.key]: v }))}
                name={r.key}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save preferences"}
        </Button>
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-sm text-[color:var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        {state.error && <span className="text-sm text-destructive">{state.error}</span>}
      </div>
    </form>
  );
}
