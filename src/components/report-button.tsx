"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { submitReport, type ReportFormState } from "@/app/actions/report";

const initial: ReportFormState = {};

export function ReportButton({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: "profile" | "mentor_request" | "user";
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReport, initial);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        aria-label="Report this content"
      >
        <Flag className="h-3 w-3" />
        {label}
      </button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!pending) setOpen(v);
        }}
        title="Report this content"
        description="A drum major or the director will review. The person you're reporting won't be notified."
      >
        {state.ok ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">Thanks for flagging it. We&apos;ll take a look.</p>
            <Button onClick={() => setOpen(false)} className="self-end" variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <Field label="Reason" htmlFor="reason">
              <Select id="reason" name="reason" defaultValue="inappropriate">
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Details" htmlFor="description" hint="Optional. Add context if it helps us decide.">
              <Textarea id="description" name="description" rows={4} />
            </Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting…" : "Submit report"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
