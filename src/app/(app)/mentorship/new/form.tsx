"use client";

import { useActionState, useState } from "react";
import { createMentorRequest, type MentorFormState } from "@/app/actions/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { MENTOR_URGENCY, URGENCY_LABEL } from "@/lib/constants";

const initial: MentorFormState = {};

export function NewMentorRequestForm({
  targetId,
  skillHints,
}: {
  targetId: string | null;
  skillHints: string[];
}) {
  const [state, action, pending] = useActionState(createMentorRequest, initial);
  const [skill, setSkill] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      {targetId && <input type="hidden" name="targetId" value={targetId} />}
      <Field label="Skill" htmlFor="skill" hint="Which skill are you trying to level up?">
        <Input
          id="skill"
          name="skill"
          required
          list="skill-hints"
          placeholder="e.g. audition prep, marching fundamentals"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <datalist id="skill-hints">
          {skillHints.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label="What do you need?" htmlFor="description">
        <Textarea id="description" name="description" required rows={5} placeholder="Be specific. 'I'm working on the All-Region etude and I can't get the tempo clean past measure 24.'" />
      </Field>

      <Field label="Urgency" htmlFor="urgency">
        <Select id="urgency" name="urgency" defaultValue="casual">
          {MENTOR_URGENCY.map((u) => (
            <option key={u} value={u}>
              {URGENCY_LABEL[u]}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Posting…" : targetId ? "Send request" : "Post to board"}
      </Button>
    </form>
  );
}
