"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { postShoutout, type ShoutoutFormState } from "@/app/actions/shoutouts";
import { CheckCircle2 } from "lucide-react";

const initial: ShoutoutFormState = {};

export function ShoutoutForm() {
  const [state, action, pending] = useActionState(postShoutout, initial);
  return (
    <form action={action} className="flex flex-col gap-4" key={state.ok ? "reset" : "active"}>
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
        <Field label="Type" htmlFor="kind">
          <Select id="kind" name="kind" defaultValue="other">
            <option value="audition">Audition</option>
            <option value="lesson">Lesson</option>
            <option value="honor">Honor</option>
            <option value="summer_program">Summer program</option>
            <option value="camp">Camp</option>
            <option value="performance">Performance</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="What happened" htmlFor="title">
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Made TMEA All-Region 2nd chair this year."
          />
        </Field>
      </div>
      <Field label="Details" htmlFor="body" hint="Optional. The story behind it.">
        <Textarea
          id="body"
          name="body"
          rows={3}
          maxLength={800}
          placeholder="Optional — what you worked on, how you got there, what you learned."
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting…" : "Post shoutout"}
        </Button>
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-sm text-[color:var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Posted
          </span>
        )}
        {state.error && <span className="text-sm text-destructive">{state.error}</span>}
      </div>
    </form>
  );
}
