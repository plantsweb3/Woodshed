"use client";

import { useActionState } from "react";
import { createOpportunity, type OpportunityFormState } from "@/app/actions/opportunities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_LABEL, SECTIONS, type OpportunityType } from "@/lib/constants";

const initial: OpportunityFormState = {};

export function NewOpportunityForm() {
  const [state, action, pending] = useActionState(createOpportunity, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" required placeholder="e.g. SAYWE Spring Auditions" />
      </Field>

      <Field label="Type" htmlFor="opportunityType">
        <Select id="opportunityType" name="opportunityType" required defaultValue="outside_audition">
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {OPPORTUNITY_TYPE_LABEL[t as OpportunityType]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Deadline" htmlFor="deadline" hint="Optional but helpful.">
          <Input id="deadline" name="deadline" type="date" />
        </Field>
        <Field label="Link" htmlFor="link" hint="Where they go to act on this.">
          <Input id="link" name="link" type="url" placeholder="https://..." />
        </Field>
      </div>

      <Field label="Relevant sections" htmlFor="sections" hint="Hold cmd/ctrl to pick multiple. Leave empty for everyone.">
        <select
          id="sections"
          name="sections"
          multiple
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm min-h-28"
        >
          {SECTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" required rows={5} placeholder="What is it, who should consider it, what's the benefit?" />
      </Field>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Posting…" : "Post opportunity"}
      </Button>
    </form>
  );
}
