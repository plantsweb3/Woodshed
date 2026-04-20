"use client";

import { useActionState } from "react";
import { logShed, type ShedFormState } from "@/app/actions/shed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

const initial: ShedFormState = {};

export function ShedForm() {
  const [state, action, pending] = useActionState(logShed, initial);
  return (
    <form action={action} className="flex flex-col gap-3" key={state.ok ? "reset" : "active"}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minutes" htmlFor="durationMinutes">
          <Input id="durationMinutes" name="durationMinutes" type="number" min={1} max={600} required placeholder="45" />
        </Field>
        <Field label="Visibility" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue="private">
            <option value="private">Private</option>
            <option value="section">My section</option>
            <option value="band">Whole band</option>
          </Select>
        </Field>
      </div>
      <Field label="Worked on" htmlFor="workedOn">
        <Input id="workedOn" name="workedOn" required placeholder="All-Region etude, measures 12–40" />
      </Field>
      <Field label="Notes" htmlFor="notes" hint="Optional.">
        <Textarea id="notes" name="notes" rows={3} />
      </Field>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Logging…" : "Start a shed"}
        </Button>
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-sm text-[color:var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Logged
          </span>
        )}
      </div>
    </form>
  );
}
